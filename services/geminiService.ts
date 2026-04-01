import { GoogleGenAI, Type } from '@google/genai';
import { MetricSummary } from '../types';

const getApiKey = () => {
  // 1. Check local storage (user provided)
  const storedKey = localStorage.getItem('kazira_api_key');
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
  return new GoogleGenAI({ apiKey });
};

export const generateNarrativeReport = async (data: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are an expert clinic business analyst. Analyze the following clinic data and generate an executive summary report. Use Markdown formatting. Data:\n\n${data}`,
  });
  return response.text || 'Failed to generate narrative.';
};

export const auditReport = async (data: string, narrative: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: `Audit the following narrative report against the raw data. Verify math and logic. Report any discrepancies or confirm accuracy.\n\nRaw Data:\n${data}\n\nNarrative:\n${narrative}`,
  });
  return response.text || 'Failed to audit report.';
};

export const extractMetrics = async (data: string): Promise<MetricSummary> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Extract key metrics from the following clinic data. Return ONLY a JSON object matching this schema: { "revenueThisWeek": number, "revenueLastWeek": number, "utilization": number, "cancellations": number, "procedureMix": [{ "name": string, "value": number }], "practitionerPerformance": [{ "name": string, "patients": number }] }. Data:\n\n${data}`,
    config: {
      responseMimeType: 'application/json',
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
