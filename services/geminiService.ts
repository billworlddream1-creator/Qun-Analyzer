
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisMode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const PROMPTS = {
  quantum: `Perform a quantum-inspired data analysis. Identify patterns, potential quantum tunneling-like anomalies, and correlations.`,
  code: `Perform a code review and calculation analysis. Identify algorithmic complexity (Big O), potential bugs, security vulnerabilities, and optimizations. Treat the input as code or pseudocode.`,
  weather: `Analyze this weather data. Summarize forecasts, identify meteorological anomalies, trends, and potential impacts on operations.`,
  internet: `Analyze this internet/web data. specific tasks: Sentiment analysis, keyword extraction, fact verification, and summarization of key topics.`
};

export async function analyzeData(data: string, mode: AnalysisMode = 'quantum') {
  try {
    const basePrompt = PROMPTS[mode];
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${basePrompt}
      
      Respond with professional insights formatted as JSON.
      
      Dataset/Input content: ${data}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  confidence: { type: Type.NUMBER }
                }
              }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}

export async function explainQuantumState(state: any) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Explain the physical significance of this quantum simulation state in plain but professional terms: ${JSON.stringify(state)}`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Explanation Error:", error);
    return "Error generating explanation.";
  }
}
