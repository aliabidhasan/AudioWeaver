import fs from "fs/promises";
import pdf from 'pdf-parse';

/**
 * Extract text from a PDF file using a simple extraction method
 * @param filePath Path to the PDF file
 * @returns Extracted text content
 */
export async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    // Check if file exists
    await fs.access(filePath);
    
    // Get file info for logging
    const stats = await fs.stat(filePath);
    const fileName = filePath.split('/').pop();
    
    console.log(`Processing PDF file: ${fileName} (${Math.round(stats.size / 1024)} KB)`);
    
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);
    
    console.log(`Successfully extracted text from ${fileName}`);
    return data.text;
  } catch (error) {
    console.error(`Error processing PDF ${filePath}:`, error);
    // Check if the error is an instance of Error to satisfy TypeScript
    if (error instanceof Error) {
      throw new Error(`Failed to process PDF: ${error.message}`);
    }
    throw new Error(`Failed to process PDF: Unknown error`);
  }
}
