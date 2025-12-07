import { GoogleGenAI } from "@google/genai";
import { PopulationStats } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGeneticistAnalysis = async (
  history: PopulationStats[],
  currentGeneration: number
): Promise<string> => {
  if (currentGeneration < 2) return "Awaiting F1 data. Establish your baseline phenotypic variance. Remember: σ²P = σ²G + σ²E.";

  const latest = history[history.length - 1];
  const previous = history[history.length - 2];

  const prompt = `
    You are a world-renowned Quantitative Geneticist. Your language is precise, academic, but slightly eccentric.
    You communicate in short, dense bursts of scientific insight.
    
    The student has bred Generation ${currentGeneration}.
    
    Data:
    Gen ${currentGeneration - 1}: μ=${previous.meanYield}, σ²=${previous.varYield}.
    Gen ${currentGeneration}: μ=${latest.meanYield}, σ²=${latest.varYield}, Max=${latest.maxYield}.
    
    Analyze the Response to Selection (R).
    Did we achieve Genetic Gain ($\Delta G$)?
    Is the additive genetic variance ($\sigma^2_A$) depleting too fast (Fixation)?
    
    Use terms like: "Selection Differential", "Heritability", "Bulmer Effect", "Linkage Drag", "Heterosis".
    Maximum 2 sentences.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Analysis unavailable. Proceed with selection based on phenotypic truncation.";
  }
};

export const generateScenario = async (generation: number): Promise<{description: string, envImpact: number}> => {
  const prompt = `
    Generate an environmental scenario for Generation ${generation}.
    Factors: Drought, Nitrogen Deficiency, Pest Outbreak (Fall Armyworm), or Ideal GxE Interaction.
    
    Return JSON:
    {
      "description": "Scientific description of the environment",
      "envImpact": number (0.5 to 4.0).
    }
    Note: High envImpact = High Environmental Variance ($\sigma^2_E$) = Low Heritability ($h^2$). Harder to select.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    return { description: "Standard ambient conditions.", envImpact: 2.0 };
  }
};