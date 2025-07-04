import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import { extractTextFromPDF } from "./lib/pdf-processor";
import { generateSummary } from "./lib/gemini-api";
import { convertTextToSpeech } from "./lib/elevenlabs-api";
import { z } from "zod";
import { insertApiKeySchema, insertProcessingJobSchema, insertReflectionSchema, insertAudioNoteSchema } from "@shared/schema";

// Create uploads directory if it doesn't exist
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const createUploadsDir = async () => {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch (error) {
    console.error("Failed to create uploads directory:", error);
  }
};

// Configure multer storage
const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage_config,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Create uploads directory
  await createUploadsDir();
  
  // API Keys routes
  app.get("/api/settings/api-keys", async (req, res) => {
    try {
      // Check for environment variable API keys first
      const envGeminiKey = process.env.GEMINI_API_KEY;
      const envElevenlabsKey = process.env.ELEVENLABS_API_KEY;
      
      // If both environment keys are available, use them
      if (envGeminiKey && envElevenlabsKey) {
        // Check if we already have these keys stored
        const storedKeys = await storage.getApiKeys();
        
        // If not stored or different, store them
        if (!storedKeys || 
            storedKeys.gemini !== envGeminiKey || 
            storedKeys.elevenlabs !== envElevenlabsKey) {
          try {
            await storage.saveApiKeys({
              gemini: envGeminiKey,
              elevenlabs: envElevenlabsKey
            });
            console.log("Stored environment API keys in database");
          } catch (err) {
            console.error("Failed to store environment API keys:", err);
          }
        }
        
        // Return the environment keys
        return res.json({
          gemini: envGeminiKey,
          elevenlabs: envElevenlabsKey
        });
      }
      
      // Try to get keys from storage
      const apiKeys = await storage.getApiKeys();
      
      if (!apiKeys) {
        console.log("No API keys found in storage or environment");
        // For the prototype, provide default API keys so the app can function
        return res.json({
          gemini: 'demo-gemini-key-for-prototype',
          elevenlabs: 'demo-elevenlabs-key-for-prototype'
        });
      }
      
      // Don't expose the ID
      const { id, createdAt, ...keys } = apiKeys;
      res.json(keys);
    } catch (error) {
      console.error("Error getting API keys:", error);
      // For the prototype, provide default keys on error too
      res.json({
        gemini: 'demo-gemini-key-for-prototype',
        elevenlabs: 'demo-elevenlabs-key-for-prototype'
      });
    }
  });
  
  app.post("/api/settings/api-keys", async (req, res) => {
    try {
      const validatedData = insertApiKeySchema.parse(req.body);
      const apiKeys = await storage.saveApiKeys(validatedData);
      
      // Don't expose the ID
      const { id, createdAt, ...keys } = apiKeys;
      res.json(keys);
    } catch (error) {
      console.error("Error saving API keys:", error);
      res.status(400).json({ message: "Invalid API keys data" });
    }
  });
  
  // Upload PDF files
  app.post("/api/upload", upload.array("files", 10), async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }
      
      console.log(`Received ${req.files.length} files for upload`);
      const uploadIds: number[] = [];
      
      for (const file of req.files as Express.Multer.File[]) {
        console.log(`Processing upload: ${file.originalname} (${Math.round(file.size / 1024)} KB)`);
        
        const upload = await storage.createUpload({
          filename: file.originalname,
          filepath: file.path,
          size: file.size
        });
        
        console.log(`Created upload record with ID: ${upload.id}`);
        uploadIds.push(upload.id);
      }
      
      console.log(`Successfully processed ${uploadIds.length} uploads`);
      res.status(201).json({ uploadIds });
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({ message: "Failed to upload files" });
    }
  });
  
  // Process documents
  app.post("/api/process", async (req, res) => {
    try {
      const schema = z.object({
        uploadIds: z.array(z.number()),
        context: z.object({
          question: z.string().optional(),
          knowledge: z.string().optional(),
          interest: z.string().optional(),
          conversation: z.string().optional()
        }).optional()
      });
      
      const validatedData = schema.parse(req.body);
      
      // Create processing job
      const processingJob = await storage.createProcessingJob({
        uploadIds: validatedData.uploadIds,
        context: validatedData.context
      });
      
      // Start processing in the background
      processDocuments(processingJob.id).catch(error => {
        console.error(`Error processing job ${processingJob.id}:`, error);
      });
      
      res.status(201).json({ processingId: processingJob.id });
    } catch (error) {
      console.error("Error initiating process:", error);
      res.status(400).json({ message: "Invalid processing request" });
    }
  });
  
  // Get processing status
  app.get("/api/process/:id/status", async (req, res) => {
    try {
      const processingId = parseInt(req.params.id);
      
      if (isNaN(processingId)) {
        return res.status(400).json({ message: "Invalid processing ID" });
      }
      
      const job = await storage.getProcessingJob(processingId);
      
      if (!job) {
        return res.status(404).json({ message: "Processing job not found" });
      }
      
      // Create response object with proper type definition
      const response: {
        status: string;
        progress: number;
        summary?: {
          id: number;
          title: string;
          description: string;
          text: string;
          audioUrl: string;
          createdAt: Date;
        };
        error?: string | null;
      } = {
        status: job.status,
        progress: job.progress
      };
      
      // If the job is completed, include the summary
      if (job.status === "completed") {
        const summary = await storage.getSummaryByProcessingJobId(job.id);
        
        if (summary) {
          response.summary = {
            id: summary.id,
            title: summary.title,
            description: summary.description,
            text: summary.text,
            audioUrl: summary.audioUrl,
            createdAt: summary.createdAt
          };
        }
      }
      
      // If the job has an error, include it
      if (job.error) {
        response.error = job.error;
      }
      
      res.json(response);
    } catch (error) {
      console.error("Error getting processing status:", error);
      res.status(500).json({ message: "Failed to get processing status" });
    }
  });
  
  // Save reflection
  app.post("/api/summaries/:id/reflection", async (req, res) => {
    try {
      const summaryId = parseInt(req.params.id);
      
      if (isNaN(summaryId)) {
        return res.status(400).json({ message: "Invalid summary ID" });
      }
      
      const summary = await storage.getSummary(summaryId);
      
      if (!summary) {
        return res.status(404).json({ message: "Summary not found" });
      }
      
      const schema = insertReflectionSchema.extend({
        summaryId: z.literal(summaryId)
      });
      
      const validatedData = schema.parse({
        ...req.body,
        summaryId
      });
      
      await storage.createReflection(validatedData);
      
      res.status(201).json({ message: "Reflection saved successfully" });
    } catch (error) {
      console.error("Error saving reflection:", error);
      res.status(400).json({ message: "Invalid reflection data" });
    }
  });
  
  // Export reflections
  app.get("/api/summaries/:id/reflections/export", async (req: Request, res: Response) => {
    try {
      const summaryIdSchema = z.string().regex(/^\d+$/).transform(Number);
      const validationResult = summaryIdSchema.safeParse(req.params.id);

      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid summary ID format" });
      }
      const summaryId = validationResult.data;

      const reflections = await storage.getReflectionBySummaryId(summaryId);

      if (!reflections || reflections.length === 0) {
        return res.status(404).json({ message: "No reflections found for this summary" });
      }

      let formattedText = "";
      for (const reflection of reflections) {
        formattedText += `Reflection ID: ${reflection.id}\n`;
        formattedText += `Pride: ${reflection.pride}\n`;
        formattedText += `Surprise: ${reflection.surprise}\n`;
        formattedText += `Question: ${reflection.question}\n`;
        formattedText += `Role: ${reflection.role}\n`;
        formattedText += `Created At: ${reflection.createdAt.toISOString()}\n`;
        formattedText += "---\n";
      }

      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Content-Disposition", `attachment; filename="reflections-summary-${summaryId}.txt"`);
      res.send(formattedText);

    } catch (error) {
      console.error(`Error exporting reflections for summary ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to export reflections" });
    }
  });

  // Get audio notes for a summary
  app.get("/api/summaries/:id/notes", async (req: Request, res: Response) => {
    try {
      const summaryIdSchema = z.string().regex(/^\d+$/).transform(Number);
      const validationResult = summaryIdSchema.safeParse(req.params.id);

      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid summary ID format" });
      }
      const summaryId = validationResult.data;

      // Check if summary exists to give a more specific 404 if notes are absent *because* summary is absent
      const summary = await storage.getSummary(summaryId);
      if (!summary) {
        return res.status(404).json({ message: "Summary not found" });
      }

      const notes = await storage.getAudioNotesBySummaryId(summaryId);
      res.status(200).json(notes);
    } catch (error) {
      console.error(`Error fetching audio notes for summary ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch audio notes" });
    }
  });

  // Add an audio note to a summary
  app.post("/api/summaries/:id/notes", async (req: Request, res: Response) => {
    try {
      const summaryIdSchema = z.string().regex(/^\d+$/).transform(Number);
      const summaryIdValidation = summaryIdSchema.safeParse(req.params.id);

      if (!summaryIdValidation.success) {
        return res.status(400).json({ message: "Invalid summary ID format" });
      }
      const summaryId = summaryIdValidation.data;

      const noteBodySchema = z.object({
        timestamp: z.number().int().nonnegative({ message: "Timestamp must be a non-negative integer" }),
        text: z.string().min(1, { message: "Note text cannot be empty" })
      });

      const bodyValidation = noteBodySchema.safeParse(req.body);

      if (!bodyValidation.success) {
        return res.status(400).json({ message: "Invalid note data", errors: bodyValidation.error.format() });
      }

      const summary = await storage.getSummary(summaryId);
      if (!summary) {
        return res.status(404).json({ message: "Summary not found" });
      }

      const noteData = {
        summaryId,
        timestamp: bodyValidation.data.timestamp,
        text: bodyValidation.data.text
      };

      // Validate with the schema from shared/schema.ts before insertion
      const insertValidation = insertAudioNoteSchema.safeParse(noteData);
      if(!insertValidation.success) {
        return res.status(400).json({ message: "Note data failed shared schema validation", errors: insertValidation.error.format() });
      }

      const createdNote = await storage.createAudioNote(insertValidation.data);
      res.status(201).json(createdNote);
    } catch (error) {
      console.error(`Error adding audio note for summary ${req.params.id}:`, error);
      if (error instanceof z.ZodError) { // Should be caught by safeParse, but as a safeguard
        return res.status(400).json({ message: "Invalid data format", errors: error.format() });
      }
      res.status(500).json({ message: "Failed to add audio note" });
    }
  });

  // Download audio
  app.get("/api/summaries/:id/audio/download", async (req, res) => {
    try {
      const summaryId = parseInt(req.params.id);
      
      if (isNaN(summaryId)) {
        return res.status(400).json({ message: "Invalid summary ID" });
      }
      
      const summary = await storage.getSummary(summaryId);
      
      if (!summary) {
        return res.status(404).json({ message: "Summary not found" });
      }
      
      // Extract audio file path from URL
      const audioFilePath = summary.audioUrl.replace('/audio/', '');
      const fullPath = path.join(UPLOADS_DIR, audioFilePath);
      
      try {
        await fs.access(fullPath);
      } catch {
        return res.status(404).json({ message: "Audio file not found" });
      }
      
      res.download(fullPath, `${summary.title}.mp3`);
    } catch (error) {
      console.error("Error downloading audio:", error);
      res.status(500).json({ message: "Failed to download audio" });
    }
  });
  
  // Serve audio files
  app.get("/audio/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;
      const filepath = path.join(UPLOADS_DIR, filename);
      
      try {
        await fs.access(filepath);
      } catch {
        return res.status(404).json({ message: "Audio file not found" });
      }
      
      res.setHeader('Content-Type', 'audio/mpeg');
      res.sendFile(filepath);
    } catch (error) {
      console.error("Error serving audio file:", error);
      res.status(500).json({ message: "Failed to serve audio file" });
    }
  });
  
  // Simplified document processing function
  async function processDocuments(processingJobId: number) {
    try {
      console.log(`Starting processing for job ${processingJobId}`);
      
      // Get the processing job
      const job = await storage.getProcessingJob(processingJobId);
      if (!job) throw new Error("Processing job not found");
      
      // Update job status to processing
      await storage.updateProcessingJob(processingJobId, {
        status: "processing",
        progress: 20
      });
      
      // Ensure uploadIds is an array of numbers
      const uploadIds = Array.isArray(job.uploadIds) 
        ? job.uploadIds.filter(id => typeof id === 'number') 
        : [];
      
      console.log('Processing uploadIds:', uploadIds);
      
      const uploads = await storage.getUploads(uploadIds);
      if (uploads.length === 0) throw new Error("No uploads found");
      
      // Get upload info for documentation
      const uploadInfo = uploads.map(upload => 
        `${upload.filename} (${Math.round(upload.size / 1024)} KB)`
      ).join(", ");
      console.log(`Processing file metadata: ${uploadInfo}`);

      // Extract text from each PDF
      let allExtractedText = "";
      let filesProcessed = 0;
      for (const upload of uploads) {
        try {
          console.log(`Extracting text from: ${upload.filename}`);
          const text = await extractTextFromPDF(upload.filepath);
          allExtractedText += `\n\n--- Document: ${upload.filename} ---\n\n${text}`;
          filesProcessed++;
          console.log(`Extracted ${text.length} characters from ${upload.filename}`);
        } catch (extractError) {
          console.error(`Error extracting text from ${upload.filename}:`, extractError);
          // Optionally, append an error message to allExtractedText or handle as needed
          allExtractedText += `\n\n--- Document: ${upload.filename} (Error: Could not extract content) ---\n\n`;
        }
      }

      if (filesProcessed === 0 && uploads.length > 0) {
        throw new Error("Failed to extract text from any documents.");
      }
      console.log(`Extracted a total of ${allExtractedText.length} characters from ${filesProcessed}/${uploads.length} documents.`);
      
      // Update job status
      await storage.updateProcessingJob(processingJobId, {
        status: "summarizing",
        progress: 40
      });
      
      // Define a proper type for the context
      const context = job.context as {
        question?: string;
        knowledge?: string;
        interest?: string;
        conversation?: string;
      } | undefined;
      
      // Get API keys
      const apiKeys = await storage.getApiKeys();
      const geminiKey = apiKeys?.gemini || process.env.GEMINI_API_KEY;
      const elevenlabsKey = apiKeys?.elevenlabs || process.env.ELEVENLABS_API_KEY;
      
      if (!geminiKey) {
        throw new Error("Gemini API key is not available");
      }
      
      // Generate AI summary using Gemini
      console.log("Generating AI summary with Gemini using extracted text...");
      let aiSummary;
      
      try {
        aiSummary = await generateSummary(
          allExtractedText, // Use the actual extracted text
          context,          // Pass the user context
          geminiKey
        );
        
        console.log("Generated summary:", {
          title: aiSummary.title,
          description: aiSummary.description.substring(0, 100) + "..."
        });
      } catch (error) {
        console.error("Error generating summary:", error);
        throw new Error("Failed to generate summary with Gemini");
      }
      
      // Update job status
      await storage.updateProcessingJob(processingJobId, {
        status: "converting",
        progress: 70
      });
      
      // Generate audio from summary text using ElevenLabs
      const audioFilename = `audio-${Date.now()}.mp3`;
      const audioPath = path.join(UPLOADS_DIR, audioFilename);
      
      if (elevenlabsKey) {
        try {
          console.log("Converting text to speech with ElevenLabs...");
          await convertTextToSpeech(aiSummary.text, audioPath, elevenlabsKey);
          console.log("Created audio file at", audioPath);
        } catch (error) {
          console.error("Error converting text to speech:", error);
          // Create an empty file as fallback if ElevenLabs fails
          await fs.writeFile(audioPath, Buffer.from([0]));
          console.log("Created empty audio file as fallback");
        }
      } else {
        console.log("ElevenLabs API key not available, creating empty audio file");
        await fs.writeFile(audioPath, Buffer.from([0]));
      }
      
      // Create summary record
      const createdSummary = await storage.createSummary({
        title: aiSummary.title,
        description: aiSummary.description,
        text: aiSummary.text,
        audioUrl: `/audio/${audioFilename}`,
        processingJobId: job.id
      });
      
      console.log(`Created summary with ID ${createdSummary.id}`);
      
      // Update job status to completed
      await storage.updateProcessingJob(processingJobId, {
        status: "completed",
        progress: 100,
        completedAt: new Date()
      });
      
      return createdSummary;
    } catch (error) {
      console.error(`Error processing documents for job ${processingJobId}:`, error);
      
      // Update job status to error
      await storage.updateProcessingJob(processingJobId, {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error occurred"
      });
      
      throw error;
    }
  }
  
  const httpServer = createServer(app);
  return httpServer;
}
