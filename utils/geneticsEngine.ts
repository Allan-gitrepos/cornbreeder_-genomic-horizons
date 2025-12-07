import { Plant, Genome, PopulationStats } from '../types';
import { GENOME_LENGTH, POPULATION_SIZE, YIELD_LOCI, RESISTANCE_LOCI, TRAITS } from '../constants';

// Helper: Gaussian random
const randn_bm = (): number => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

// Generate a random initial genome
const generateRandomGenome = (): Genome => {
  const loci = Array.from({ length: GENOME_LENGTH }, () => {
    // Randomly assign 0, 1, or 2 based on Hardy-Weinberg-ish probabilities (p=q=0.5)
    const rand = Math.random();
    if (rand < 0.25) return 0;
    if (rand < 0.75) return 1;
    return 2;
  });
  return { loci };
};

// Calculate Breeding Value (G) and Phenotype (P)
const evaluatePlant = (genome: Genome, generation: number, envVariance: number, idOverride?: string): Plant => {
  // 1. Calculate Genetic Value (Additive Model)
  let yieldG = 0;
  let resG = 0;

  YIELD_LOCI.forEach(idx => yieldG += genome.loci[idx]); // Max score = 2 * 10 = 20
  RESISTANCE_LOCI.forEach(idx => resG += genome.loci[idx]); // Max score = 20

  // 2. Add Environmental Effect (E)
  const yieldE = randn_bm() * envVariance;
  const resE = randn_bm() * envVariance;

  // 3. Apply Correlations (The "Game" Mechanics)
  
  // CORRELATION 1: Disease Drag
  // If Resistance Phenotype is low, it penalizes the realized Yield Phenotype.
  // A plant might have good yield genes, but if it gets sick, it won't produce.
  const resistancePhenotype = Math.max(0, resG + resE);
  const diseasePenalty = resistancePhenotype < 8 ? (8 - resistancePhenotype) * 1.5 : 0;
  
  const rawYieldP = yieldG + yieldE;
  const finalYieldP = Math.max(0, rawYieldP - diseasePenalty);

  // CORRELATION 2: Height linkage
  // Taller plants tend to have higher yield (Harvest Index), but not always.
  // Height is mostly Yield Genotype + some noise.
  const heightP = (yieldG * 0.8) + (randn_bm() * 2) + 10; // Base height offset

  return {
    id: idOverride || `gen${generation}-${Math.random().toString(36).substr(2, 5)}`,
    generation,
    genome,
    breedingValue: {
      [TRAITS.YIELD]: yieldG,
      [TRAITS.RESISTANCE]: resG,
    },
    phenotype: {
      [TRAITS.YIELD]: parseFloat(finalYieldP.toFixed(2)),
      [TRAITS.RESISTANCE]: parseFloat(resistancePhenotype.toFixed(2)),
      height: parseFloat(heightP.toFixed(2))
    },
    isSelected: false,
  };
};

export const createInitialPopulation = (envVariance: number): Plant[] => {
  const plants: Plant[] = [];
  for (let i = 0; i < POPULATION_SIZE; i++) {
    plants.push(evaluatePlant(generateRandomGenome(), 1, envVariance));
  }
  return plants;
};

// Simulate Meiosis (Creation of Gametes) and Fertilization
const cross = (parent1: Plant, parent2: Plant, generation: number, envVariance: number): Plant => {
  const gamete1: number[] = [];
  const gamete2: number[] = [];

  const createGamete = (p: Plant) => {
    const g = [];
    for(let i=0; i<GENOME_LENGTH; i++) {
        const alleles = p.genome.loci[i]; // 0, 1, or 2
        if (alleles === 0) g.push(0);
        else if (alleles === 2) g.push(1);
        else g.push(Math.random() < 0.5 ? 0 : 1);
    }
    return g;
  };

  const g1 = createGamete(parent1);
  const g2 = createGamete(parent2);

  // Fertilization: Combine gametes
  const zygoteLoci = g1.map((allele, i) => allele + g2[i]);

  return evaluatePlant({ loci: zygoteLoci }, generation, envVariance);
};

export const breedNextGeneration = (
  parents: Plant[],
  currentGeneration: number,
  envVariance: number
): Plant[] => {
  const nextGen: Plant[] = [];
  // Random mating among selected parents
  for (let i = 0; i < POPULATION_SIZE; i++) {
    const p1 = parents[Math.floor(Math.random() * parents.length)];
    const p2 = parents[Math.floor(Math.random() * parents.length)];
    nextGen.push(cross(p1, p2, currentGeneration + 1, envVariance));
  }
  return nextGen;
};

export const calculateStats = (population: Plant[], generation: number): PopulationStats => {
  const yields = population.map(p => p.phenotype[TRAITS.YIELD]);
  const res = population.map(p => p.phenotype[TRAITS.RESISTANCE]);

  const sumYield = yields.reduce((a, b) => a + b, 0);
  const meanYield = sumYield / population.length;
  const maxYield = Math.max(...yields);

  const meanRes = res.reduce((a, b) => a + b, 0) / population.length;

  const variance = yields.reduce((a, b) => a + Math.pow(b - meanYield, 2), 0) / population.length;

  return {
    generation,
    size: population.length,
    meanYield: parseFloat(meanYield.toFixed(2)),
    varYield: parseFloat(variance.toFixed(2)),
    meanResistance: parseFloat(meanRes.toFixed(2)),
    maxYield: parseFloat(maxYield.toFixed(2)),
  };
};

// Helper for Bell Curve generation
export const getBellCurveData = (population: Plant[], selectedIds: Set<string>) => {
    const yields = population.map(p => p.phenotype[TRAITS.YIELD]);
    const min = Math.floor(Math.min(...yields));
    const max = Math.ceil(Math.max(...yields));
    
    // Pop stats
    const mean = yields.reduce((a,b)=>a+b,0) / yields.length;
    const stdDev = Math.sqrt(yields.reduce((a,b)=>a+Math.pow(b-mean,2),0)/yields.length);

    // Selected stats
    const selectedPlants = population.filter(p => selectedIds.has(p.id));
    const selYields = selectedPlants.map(p => p.phenotype[TRAITS.YIELD]);
    let selMean = 0;
    let selStdDev = 1;
    if (selectedPlants.length > 0) {
        selMean = selYields.reduce((a,b)=>a+b,0) / selectedPlants.length;
        selStdDev = Math.sqrt(selYields.reduce((a,b)=>a+Math.pow(b-selMean,2),0)/selectedPlants.length) || 0.5;
    }

    const data = [];
    // Generate points
    for(let x = min - 5; x <= max + 5; x += 0.5) {
        // PDF formula
        const popY = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean)/stdDev, 2));
        
        let selY = 0;
        if (selectedPlants.length > 0) {
            selY = (1 / (selStdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - selMean)/selStdDev, 2));
        }

        data.push({
            x: x,
            population: parseFloat(popY.toFixed(4)),
            selected: selectedPlants.length > 0 ? parseFloat(selY.toFixed(4)) : null,
        });
    }
    return { data, mean, selMean };
};