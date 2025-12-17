import { GoogleGenAI, Type } from "@google/genai";
import { GeminiAnalysis } from '../types';
import { GEMINI_MODEL_ID } from '../constants';

const apiKey = import.meta.env.VITE_API_KEY;

const ai = new GoogleGenAI({ apiKey: apiKey });

export const generateRunAnalysis = async (distance: number, coins: number): Promise<GeminiAnalysis> => {
  try {
    const prompt = `
      The player just finished a run in an endless runner game.
      Stats: Distance ran: ${Math.floor(distance)}m, Coins collected: ${coins}.
      
      Generate a fun, arcade-style "Runner Title" (max 5 words) and a witty, short "Sage Comment" (max 15 words) evaluating their performance.
      If the distance is low (<100m), be encouraging but slightly roasting.
      If the distance is high (>1000m), be impressed.
    `;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_ID,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            comment: { type: Type.STRING }
          },
          required: ["title", "comment"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as GeminiAnalysis;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      title: "Unknown Runner",
      comment: "The AI is sleeping. Run again to wake it up!"
    };
  }
};