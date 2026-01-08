
import { GoogleGenAI } from "@google/genai";
import { NARRATIVE_AGENT_SYSTEM_PROMPT, AUDIT_AGENT_SYSTEM_PROMPT } from "../constants";

export const generateNarrativeReport = async (rawInput: string): Promise<string> => {
  // Initialize AI client using the direct environment variable as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: rawInput,
    config: {
      systemInstruction: NARRATIVE_AGENT_SYSTEM_PROMPT,
      temperature: 0.1, // Keep it grounded and consistent
    },
  });

  return response.text || "Failed to generate narrative.";
};

export const auditReport = async (rawInput: string, generatedReport: string): Promise<string> => {
  // Audit tasks require complex reasoning and math verification, using the pro model
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const combinedInput = `RAW DATA:\n${rawInput}\n\nGENERATED REPORT:\n${generatedReport}`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: combinedInput,
    config: {
      systemInstruction: AUDIT_AGENT_SYSTEM_PROMPT,
      temperature: 0, // Maximum deterministic output for auditing
    },
  });

  return response.text || "Audit failed.";
};
