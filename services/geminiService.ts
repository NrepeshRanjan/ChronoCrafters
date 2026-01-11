import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GeminiGenerateContentParameters, GeminiGenerateContentResponse } from "../types";

// The API key is assumed to be available from the environment.
// For the purpose of this demo, we'll initialize GoogleGenAI lazily when needed
// as per the guidance, ensuring it uses the latest API key from `process.env.API_KEY`.

export const generateGeminiContent = async (params: GeminiGenerateContentParameters): Promise<GeminiGenerateContentResponse> => {
  if (!process.env.API_KEY) {
    console.error("Gemini API Key is not configured. Please ensure process.env.API_KEY is set.");
    // Return a mock response or throw an error gracefully
    return { text: "Error: Gemini API key is missing. Cannot generate content." };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Correctly import and use GenerateContentResponse from @google/genai
    const response: GenerateContentResponse = await ai.models.generateContent(params);
    return { text: response.text };
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    // Check for "Requested entity was not found." error specifically for API key issues.
    if (error.message && error.message.includes("Requested entity was not found.")) {
      console.error("Potential API Key issue: 'Requested entity was not found.' error. Prompting user to select API key.");
      // This part assumes a global `window.aistudio` is available in the specific runtime environment.
      // If not, this needs to be handled differently (e.g., via a global state and UI prompt).
      if (window.aistudio && window.aistudio.openSelectKey) {
        // Assume key selection was successful and proceed.
        await window.aistudio.openSelectKey();
      }
      return { text: "Error: There might be an issue with your API key. Please try again after selecting a valid API key." };
    }
    return { text: `Error generating content: ${error.message}` };
  }
};