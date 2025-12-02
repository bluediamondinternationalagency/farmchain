import { GoogleGenAI, Type } from "@google/genai";
import { Cow } from "../types";

// Helper to get AI instance safely
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateCowStatusUpdate = async (cow: Cow): Promise<{
  newWeight: number;
  healthScore: number;
  narrative: string;
  marketPrediction: string;
}> => {
  const prompt = `
    You are an AI Ranch Manager for Farm Chain (a Nerve venture).
    Simulate a weekly status update for a cow with the following stats:
    - Name: ${cow.name}
    - Breed: ${cow.breed}
    - Current Weight: ${cow.weight} kg
    - Days on ranch: ${Math.floor((Date.now() - cow.purchaseDate) / (1000 * 60 * 60 * 24))}
    - Health Score: ${cow.healthScore}

    Provide a realistic update representing 1 week of growth. 
    1. Realistic weight gain (approx 0.5kg to 1.5kg per day * 7 days).
    2. Minor fluctuation in health score.
    3. A short narrative description of how the cow is doing (eating habits, behavior).
    4. A brief market sentiment prediction for beef prices (Bullish/Bearish/Neutral).
  `;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            newWeight: { type: Type.NUMBER, description: "The new weight of the cow in kg." },
            healthScore: { type: Type.NUMBER, description: "The new health score (0-100)." },
            narrative: { type: Type.STRING, description: "A 1-2 sentence update about the cow." },
            marketPrediction: { type: Type.STRING, description: "Market sentiment analysis." },
          },
          required: ["newWeight", "healthScore", "narrative", "marketPrediction"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    // Fallback if API fails
    return {
      newWeight: cow.weight + 5,
      healthScore: cow.healthScore,
      narrative: "Stable growth observed this week. The cattle is feeding well.",
      marketPrediction: "Neutral",
    };
  }
};

export const getInvestmentAdvice = async (cow: Cow): Promise<string> => {
  const prompt = `
    Analyze the investment potential for this cow on the Farm Chain platform:
    - Breed: ${cow.breed}
    - Initial Price: ${cow.purchasePrice} ALGO
    - Current Weight: ${cow.weight} kg
    - Target: 90 days fattening cycle.
    
    Give a concise, 2-sentence financial advice summary for the owner. Should they hold or sell early?
  `;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "Hold for maximum maturity.";
  } catch (error) {
    return "Unable to fetch advice at this time.";
  }
};