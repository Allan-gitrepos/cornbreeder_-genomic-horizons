import { GoogleGenAI } from "@google/genai";
import { PopulationStats } from "../types";

// Pre-defined scenarios for fallback when no API key
const FALLBACK_SCENARIOS = [
  { description: "Normal growing conditions", envImpact: 1.5 },
  { description: "Mild drought stress - reduced water availability", envImpact: 2.5 },
  { description: "Nitrogen deficiency in soil", envImpact: 2.2 },
  { description: "Fall Armyworm outbreak detected", envImpact: 3.0 },
  { description: "Optimal GxE interaction - ideal weather", envImpact: 1.0 },
  { description: "Heat wave during flowering stage", envImpact: 2.8 },
  { description: "Heavy rainfall - waterlogging risk", envImpact: 2.0 },
  { description: "Fungal rust disease pressure", envImpact: 2.6 },
  { description: "Early frost warning", envImpact: 3.5 },
  { description: "Excellent pollination conditions", envImpact: 1.2 },
];

const FALLBACK_ANALYSES = [
  "Selection differential appears positive. Monitor variance depletion.",
  "Genetic gain observed. Consider the Bulmer Effect on variance reduction.",
  "Phenotypic response noted. Heritability estimates stable.",
  "Progress toward breeding objective. Watch for linkage drag.",
  "Selection intensity adequate. Maintain effective population size.",
  "Favorable allele frequency increasing. Avoid excessive inbreeding.",
  "Response to selection within expected range for h² estimates.",
  "Truncation selection effective. Consider index selection for multiple traits.",
];

// Global API instance - will be null if no key provided
let ai: GoogleGenAI | null = null;

// Initialize or update API key
export const setApiKey = (apiKey: string) => {
  if (apiKey && apiKey.trim()) {
    ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    return true;
  }
  ai = null;
  return false;
};

// Try to initialize with environment variable
const envKey = typeof process !== 'undefined' ? process.env?.API_KEY : undefined;
if (envKey) {
  setApiKey(envKey);
}

export const getGeneticistAnalysis = async (
  history: PopulationStats[],
  currentGeneration: number
): Promise<string> => {
  if (currentGeneration < 2) {
    return "Welcome, Breeder! This is your Founder Population (F0). Genetic variance is high. Select the best plants to begin your breeding program. Remember: Phenotype = Genotype + Environment.";
  }

  // If no API key, use fallback
  if (!ai) {
    return FALLBACK_ANALYSES[Math.floor(Math.random() * FALLBACK_ANALYSES.length)];
  }

  const latest = history[history.length - 1];
  const previous = history[history.length - 2];

  const prompt = `
    You are a world-renowned Quantitative Geneticist. Your language is precise, academic, but slightly eccentric.
    You communicate in short, dense bursts of scientific insight.
    
    The student has bred Generation ${currentGeneration}.
    
    Data:
    Gen ${currentGeneration - 1}: μ_yield=${previous.meanYield}, μ_height=${previous.meanHeight}, σ²=${previous.varYield}, Het=${previous.heterozygosity}.
    Gen ${currentGeneration}: μ_yield=${latest.meanYield}, μ_height=${latest.meanHeight}, σ²=${latest.varYield}, Het=${latest.heterozygosity}, Max=${latest.maxYield}.
    
    Analyze the Response to Selection (R).
    Did we achieve Genetic Gain (ΔG)?
    Is the additive genetic variance (σ²A) depleting too fast (Fixation)?
    Comment on heterozygosity trends.
    
    Use terms like: "Selection Differential", "Heritability", "Bulmer Effect", "Linkage Drag", "Heterosis".
    Maximum 2 sentences.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || FALLBACK_ANALYSES[Math.floor(Math.random() * FALLBACK_ANALYSES.length)];
  } catch (error) {
    console.error("Gemini API Error:", error);
    return FALLBACK_ANALYSES[Math.floor(Math.random() * FALLBACK_ANALYSES.length)];
  }
};

export const generateScenario = async (generation: number): Promise<{ description: string, envImpact: number }> => {
  // Generation 1 is always normal
  if (generation <= 1) {
    return { description: "Normal growing conditions - establishing baseline", envImpact: 1.5 };
  }

  // If no API key, use fallback scenarios
  if (!ai) {
    const scenario = FALLBACK_SCENARIOS[Math.floor(Math.random() * FALLBACK_SCENARIOS.length)];
    return scenario;
  }

  const prompt = `
    Generate an environmental scenario for Generation ${generation} of a corn breeding program.
    Factors: Drought, Nitrogen Deficiency, Pest Outbreak (Fall Armyworm), Disease, or Ideal GxE Interaction.
    
    Return JSON only:
    {
      "description": "Brief scientific description (max 10 words)",
      "envImpact": number between 0.8 and 4.0
    }
    Note: High envImpact = High Environmental Variance (σ²E) = Low Heritability (h²). Harder to select.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text);
    return {
      description: parsed.description || "Variable conditions",
      envImpact: Math.max(0.8, Math.min(4.0, parsed.envImpact || 2.0))
    };
  } catch (error) {
    console.error("Scenario generation error:", error);
    return FALLBACK_SCENARIOS[Math.floor(Math.random() * FALLBACK_SCENARIOS.length)];
  }
};

// Check if API is configured
export const isApiConfigured = (): boolean => {
  return ai !== null;
};