import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

interface SummaryResult {
  title: string;
  description: string;
  text: string;
}

interface UserContext {
  question?: string;
  knowledge?: string;
  interest?: string;
  conversation?: string;
}

// Gemini System Prompt
const SYSTEM_PROMPT = `
You are tasked with creating an immersive "deep dive" summary of the provided document content—think of the tone and style of a podcast episode from NotebookLM.

Instructions:
1. Begin with a brief, engaging introduction that sets the stage and sparks curiosity about the topic.
2. Analyze and synthesize the key information, main arguments, and most significant points from the text. Incorporate any user-provided context about their exploration questions, key interests, or desired conversation starters to shape the narrative's focus.
3. Weave these insights into a compelling, conversational narrative—imagine you're guiding a podcast listener through the big ideas, discoveries, and nuances of the material, guided by the user's specific interests if provided.
4. Structure your summary logically: start with context, explore the main themes or segments (potentially influenced by user context), and wrap up with a succinct, thoughtful conclusion or takeaway.
5. Use an accessible tone, avoiding jargon where possible (or briefly explaining it when needed), always prioritizing clarity and flow.
6. Represent the source material accurately and faithfully, ensuring that listeners will come away informed and engaged.
7. *Strict Constraint:* The final summary MUST NOT exceed 1000 words. Aim for slightly less to ensure you stay within the limit.

Your goal: Craft a summary that not only informs but also captivates—making listeners feel like they've truly explored the heart of the document, potentially through the lens the user wants to emphasize.
`;

/**
 * Generate a summary from document text using Google Gemini AI
 * @param documentText The text content from the documents
 * @param userContext Optional context provided by the user
 * @param apiKey Google Gemini API key
 * @returns Generated summary
 */
export async function generateSummary(
  documentText: string,
  userContext?: UserContext,
  apiKey?: string
): Promise<SummaryResult> {
  try {
    // Ensure API key is provided
    if (!apiKey) {
      throw new Error("Gemini API key is required");
    }
    
    // Initialize the Google Generative AI with the API key
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // For text generation, use the gemini-2.0-flash-lite model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-lite",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });
    
    // Construct user context prompt if provided
    let contextPrompt = "";
    
    if (userContext) {
      contextPrompt = "USER CONTEXT:\n";
      
      if (userContext.question) {
        contextPrompt += `Question being explored: ${userContext.question}\n`;
      }
      
      if (userContext.knowledge) {
        contextPrompt += `What user wants others to know: ${userContext.knowledge}\n`;
      }
      
      if (userContext.interest) {
        contextPrompt += `What caught user's attention: ${userContext.interest}\n`;
      }
      
      if (userContext.conversation) {
        contextPrompt += `Conversation user wants to start: ${userContext.conversation}\n`;
      }
      
      contextPrompt += "\nPlease consider this context when generating the summary.\n\n";
    }
    
    // Prepare the complete prompt with system prompt, optional user context, and document text
    const prompt = `${SYSTEM_PROMPT}\n\n${contextPrompt}DOCUMENT CONTENT:\n${documentText}`;
    
    // Generate content
    console.log("Generating summary with Gemini...");
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Extract title and description
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    // Use the first line as the title (or generate a reasonable title)
    const title = lines.length > 0 ? lines[0].replace(/^#\s*/, '') : "Document Summary";
    
    // Use the second paragraph as the description, or generate one
    let description = "";
    let foundFirstParagraph = false;
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim().length > 0) {
        if (!foundFirstParagraph) {
          foundFirstParagraph = true;
          continue;
        }
        
        description = lines[i];
        break;
      }
    }
    
    if (!description) {
      description = "An AI-generated summary of the uploaded documents.";
    }
    
    // Limit description to a reasonable length
    if (description.length > 200) {
      description = description.substring(0, 197) + "...";
    }
    
    return {
      title,
      description,
      text
    };
  } catch (error) {
    console.error("Error generating summary with Gemini:", error);
    throw new Error(`Failed to generate summary: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
