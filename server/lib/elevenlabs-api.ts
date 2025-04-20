import fetch from "node-fetch";
import fs from "fs";
import stream from "stream";
import { promisify } from "util";

const pipeline = promisify(stream.pipeline);

// ElevenLabs API constants
const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";
const VOICE_ID = "9BWtsMINqrJLrRacOk9x"; // Specified voice ID
const MODEL_ID = "eleven_flash_v2_5"; // Specified model

/**
 * Convert text to speech using ElevenLabs API and save to file
 * @param text Text to convert to speech
 * @param outputPath Path to save the audio file
 * @param apiKey ElevenLabs API key
 */
export async function convertTextToSpeech(
  text: string,
  outputPath: string,
  apiKey: string
): Promise<void> {
  try {
    if (!apiKey) {
      throw new Error("ElevenLabs API key is required");
    }

    const url = `${ELEVENLABS_API_URL}/text-to-speech/${VOICE_ID}/stream`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": apiKey
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorBody}`);
    }

    if (!response.body) {
      throw new Error("No response body returned from ElevenLabs API");
    }

    // Save the audio stream to file
    const fileWriteStream = fs.createWriteStream(outputPath);
    await pipeline(response.body, fileWriteStream);

    console.log(`Audio saved to ${outputPath}`);
  } catch (error) {
    console.error("Error converting text to speech:", error);
    throw new Error(`Failed to convert text to speech: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
