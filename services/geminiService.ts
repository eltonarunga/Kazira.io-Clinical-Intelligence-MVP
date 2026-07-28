import { GoogleGenAI, Type } from '@google/genai';
import { MetricSummary } from '../types';
import { NARRATIVE_AGENT_SYSTEM_PROMPT, AUDIT_AGENT_SYSTEM_PROMPT, METRIC_EXTRACTION_SYSTEM_PROMPT } from '../constants';
import { safeStorage } from '../utils/storage';

const getApiKey = () => {
  // 1. Check local storage (user provided)
  const storedKey = safeStorage.getItem('kazira_api_key');
  if (storedKey) return storedKey;
  
  // 2. Check process.env (AI Studio environment)
  try {
    if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
      return process.env.GEMINI_API_KEY;
    }
  } catch (e) {
    // Ignore
  }
  
  // 3. Check import.meta.env as fallback
  try {
    if (import.meta && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
      return import.meta.env.VITE_GEMINI_API_KEY;
    }
  } catch (e) {
    // Ignore
  }
  
  return '';
};

const getAI = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key is missing. Please set your Gemini API Key in the settings.");
  }
  return new GoogleGenAI({ 
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

export const generateNarrativeReport = async (data: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: `Analyze the following clinic data and generate an executive summary report. Use Markdown formatting. Data:\n\n${data}`,
    config: {
      systemInstruction: NARRATIVE_AGENT_SYSTEM_PROMPT,
      temperature: 0.1,
    }
  });
  return response.text || 'Failed to generate narrative.';
};

export const auditReport = async (data: string, narrative: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: `Audit the following narrative report against the raw data. Verify math and logic. Report any discrepancies or confirm accuracy.\n\nRaw Data:\n${data}\n\nNarrative:\n${narrative}`,
    config: {
      systemInstruction: AUDIT_AGENT_SYSTEM_PROMPT,
      temperature: 0.1,
    }
  });
  return response.text || 'Failed to audit report.';
};

export const extractMetrics = async (data: string): Promise<MetricSummary> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: `Extract key metrics from the following clinic data. Data:\n\n${data}`,
    config: {
      systemInstruction: METRIC_EXTRACTION_SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      temperature: 0.1,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          revenueThisWeek: { type: Type.NUMBER },
          revenueLastWeek: { type: Type.NUMBER },
          utilization: { type: Type.NUMBER },
          cancellations: { type: Type.NUMBER },
          procedureMix: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                value: { type: Type.NUMBER }
              }
            }
          },
          practitionerPerformance: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                patients: { type: Type.NUMBER }
              }
            }
          }
        },
        required: ['revenueThisWeek', 'revenueLastWeek', 'utilization', 'cancellations', 'procedureMix', 'practitionerPerformance']
      }
    }
  });
  try {
    return JSON.parse(response.text || '{}') as MetricSummary;
  } catch (e) {
    console.error("Failed to parse extracted metrics:", e);
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
