
import { GoogleGenAI, Type } from "@google/genai";
import { NARRATIVE_AGENT_SYSTEM_PROMPT, AUDIT_AGENT_SYSTEM_PROMPT, METRIC_EXTRACTION_SYSTEM_PROMPT } from "../constants";
import { MetricSummary } from "../types";

export const extractMetrics = async (rawInput: string): Promise<MetricSummary> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: rawInput,
    config: {
      systemInstruction: METRIC_EXTRACTION_SYSTEM_PROMPT,
      responseMimeType: "application/json",
    },
  });

  try {
    return JSON.parse(response.text || "{}") as MetricSummary;
  } catch (e) {
    console.error("Failed to parse metrics JSON", e);
    return {
      revenueThisWeek: 0,
      revenueLastWeek: 0,
      utilization: 0,
      cancellations: 0,
      procedureMix: [],
      practitionerPerformance: []
    };
  }
};

export const generateNarrativeReport = async (rawInput: string): Promise<string> => {
  // Initialize AI client using the direct environment variable as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY });
  
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
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY });
  
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
