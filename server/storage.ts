import {
  users, type User, type InsertUser,
  apiKeys, type ApiKey, type InsertApiKey,
  uploads, type Upload, type InsertUpload,
  processingJobs, type ProcessingJob, type InsertProcessingJob,
  summaries, type Summary, type InsertSummary,
  reflections, type Reflection, type InsertReflection,
  audio_notes, type AudioNote, type InsertAudioNote
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, asc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // API Key operations
  getApiKeys(): Promise<ApiKey | undefined>;
  saveApiKeys(keys: InsertApiKey): Promise<ApiKey>;
  
  // Upload operations
  createUpload(upload: InsertUpload): Promise<Upload>;
  getUpload(id: number): Promise<Upload | undefined>;
  getUploads(ids: number[]): Promise<Upload[]>;
  
  // Processing Job operations
  createProcessingJob(job: InsertProcessingJob): Promise<ProcessingJob>;
  getProcessingJob(id: number): Promise<ProcessingJob | undefined>;
  updateProcessingJob(id: number, updates: Partial<ProcessingJob>): Promise<ProcessingJob | undefined>;
  
  // Summary operations
  createSummary(summary: InsertSummary): Promise<Summary>;
  getSummary(id: number): Promise<Summary | undefined>;
  getSummaryByProcessingJobId(processingJobId: number): Promise<Summary | undefined>;
  
  // Reflection operations
  createReflection(reflection: InsertReflection): Promise<Reflection>;
  getReflection(id: number): Promise<Reflection | undefined>;
  getReflectionBySummaryId(summaryId: number): Promise<Reflection[]>;

  // Audio Note operations
  createAudioNote(noteData: InsertAudioNote): Promise<AudioNote>;
  getAudioNotesBySummaryId(summaryId: number): Promise<AudioNote[]>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // API Key operations
  async getApiKeys(): Promise<ApiKey | undefined> {
    const [apiKey] = await db.select().from(apiKeys).limit(1);
    return apiKey;
  }
  
  async saveApiKeys(keys: InsertApiKey): Promise<ApiKey> {
    // Delete all existing API keys
    await db.delete(apiKeys);
    
    // Insert new API keys
    const [apiKey] = await db.insert(apiKeys).values(keys).returning();
    return apiKey;
  }
  
  // Upload operations
  async createUpload(insertUpload: InsertUpload): Promise<Upload> {
    const [upload] = await db.insert(uploads).values(insertUpload).returning();
    return upload;
  }
  
  async getUpload(id: number): Promise<Upload | undefined> {
    const [upload] = await db.select().from(uploads).where(eq(uploads.id, id));
    return upload;
  }
  
  async getUploads(ids: number[]): Promise<Upload[]> {
    if (ids.length === 0) return [];
    
    // Handle each ID individually to avoid SQL issues
    const results: Upload[] = [];
    
    for (const id of ids) {
      try {
        const [upload] = await db.select().from(uploads).where(eq(uploads.id, id));
        if (upload) {
          results.push(upload);
        }
      } catch (error) {
        console.error(`Error fetching upload with ID ${id}:`, error);
        // Continue with other IDs even if one fails
      }
    }
    
    return results;
  }
  
  // Processing Job operations
  async createProcessingJob(insertJob: InsertProcessingJob): Promise<ProcessingJob> {
    const [job] = await db.insert(processingJobs)
      .values({
        ...insertJob,
        status: "pending",
        progress: 0
      })
      .returning();
    
    return job;
  }
  
  async getProcessingJob(id: number): Promise<ProcessingJob | undefined> {
    const [job] = await db.select()
      .from(processingJobs)
      .where(eq(processingJobs.id, id));
    
    return job;
  }
  
  async updateProcessingJob(id: number, updates: Partial<ProcessingJob>): Promise<ProcessingJob | undefined> {
    const [updatedJob] = await db.update(processingJobs)
      .set(updates)
      .where(eq(processingJobs.id, id))
      .returning();
    
    return updatedJob;
  }
  
  // Summary operations
  async createSummary(insertSummary: InsertSummary): Promise<Summary> {
    const [summary] = await db.insert(summaries)
      .values(insertSummary)
      .returning();
    
    return summary;
  }
  
  async getSummary(id: number): Promise<Summary | undefined> {
    const [summary] = await db.select()
      .from(summaries)
      .where(eq(summaries.id, id));
    
    return summary;
  }
  
  async getSummaryByProcessingJobId(processingJobId: number): Promise<Summary | undefined> {
    const [summary] = await db.select()
      .from(summaries)
      .where(eq(summaries.processingJobId, processingJobId));
    
    return summary;
  }
  
  // Reflection operations
  async createReflection(insertReflection: InsertReflection): Promise<Reflection> {
    const [reflection] = await db.insert(reflections)
      .values(insertReflection)
      .returning();
    
    return reflection;
  }
  
  async getReflection(id: number): Promise<Reflection | undefined> {
    const [reflection] = await db.select()
      .from(reflections)
      .where(eq(reflections.id, id));
    
    return reflection;
  }
  
  async getReflectionBySummaryId(summaryId: number): Promise<Reflection[]> {
    const reflection = await db.select()
      .from(reflections)
      .where(eq(reflections.summaryId, summaryId));
    
    return reflection;
  }

  // Audio Note operations
  async createAudioNote(noteData: InsertAudioNote): Promise<AudioNote> {
    const [note] = await db.insert(audio_notes).values(noteData).returning();
    return note;
  }

  async getAudioNotesBySummaryId(summaryId: number): Promise<AudioNote[]> {
    const notes = await db.select()
      .from(audio_notes)
      .where(eq(audio_notes.summaryId, summaryId))
      .orderBy(asc(audio_notes.timestamp));
    return notes;
  }
}

// Export storage instance
export const storage = new DatabaseStorage();
