import { Plant, Genome, Allele, PopulationStats } from '../types';
import {
  GENOME_LENGTH, POPULATION_SIZE,
  YIELD_LOCI, RESISTANCE_LOCI, HEIGHT_LOCI,
  PLEIOTROPIC_YIELD_RESISTANCE, PLEIOTROPIC_HEIGHT_YIELD,
  TRAITS
} from '../constants';

// Helper: Gaussian random (Box-Muller transform)
const randn_bm = (): number => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

// Generate diploid allele (0 or 1 for each parent)
const generateAllele = (): Allele => {
  return {
    maternal: Math.random() < 0.5 ? 0 : 1,
    paternal: Math.random() < 0.5 ? 0 : 1,
  };
};

// Convert diploid to additive value
const diploidToAdditive = (allele: Allele): number => {
  return allele.maternal + allele.paternal; // 0, 1, or 2
};

// Check if heterozygous
const isHet = (allele: Allele): boolean => {
  return allele.maternal !== allele.paternal;
};

// Generate a random initial genome (diploid)
const generateRandomGenome = (): Genome => {
  const diploid: Allele[] = Array.from({ length: GENOME_LENGTH }, () => generateAllele());
  const loci = diploid.map(a => diploidToAdditive(a));
  return { loci, diploid };
};

// Calculate breeding values with LINKAGE
const calculateBreedingValues = (genome: Genome): { yield: number, resistance: number, height: number } => {
  let yieldG = 0;
  let resG = 0;
  let heightG = 0;

  // Main effects
  YIELD_LOCI.forEach(idx => {
    if (idx < genome.loci.length) yieldG += genome.loci[idx];
  });

  RESISTANCE_LOCI.forEach(idx => {
    if (idx < genome.loci.length) resG += genome.loci[idx];
  });

  HEIGHT_LOCI.forEach(idx => {
    if (idx < genome.loci.length) heightG += genome.loci[idx];
  });

  // LINKAGE/PLEIOTROPY: Trade-offs
  // Loci 8,9: High yield alleles DECREASE resistance (trade-off)
  PLEIOTROPIC_YIELD_RESISTANCE.forEach(idx => {
    if (idx < genome.loci.length) {
      resG -= genome.loci[idx] * 0.5; // Penalty to resistance
    }
  });

  // Loci 20,21: Dwarf alleles (low height) DECREASE yield
  PLEIOTROPIC_HEIGHT_YIELD.forEach(idx => {
    if (idx < genome.loci.length) {
      yieldG += genome.loci[idx] * 0.3; // Taller plants = more yield
    }
  });

  return {
    yield: Math.max(0, yieldG),
    resistance: Math.max(0, resG),
    height: Math.max(5, heightG + 10), // Base height of 10
  };
};

// Calculate heterozygosity
const calculateHeterozygosity = (genome: Genome): number => {
  if (!genome.diploid) return 0;
  const hetCount = genome.diploid.filter(a => isHet(a)).length;
  return hetCount / genome.diploid.length;
};

// Evaluate plant: G + E
const evaluatePlant = (genome: Genome, generation: number, envVariance: number, idOverride?: string): Plant => {
  const bv = calculateBreedingValues(genome);
  const heterozygosity = calculateHeterozygosity(genome);

  // Environmental effects
  const yieldE = randn_bm() * envVariance;
  const resE = randn_bm() * envVariance * 0.5;
  const heightE = randn_bm() * envVariance * 0.3;

  // Phenotype = Genotype + Environment
  // Disease penalty: Low resistance reduces realized yield
  const resPhenotype = Math.max(0, bv.resistance + resE);
  const diseasePenalty = resPhenotype < 8 ? (8 - resPhenotype) * 0.8 : 0;

  const yieldPhenotype = Math.max(0, bv.yield + yieldE - diseasePenalty);
  const heightPhenotype = Math.max(5, bv.height + heightE);

  return {
    id: idOverride || `gen${generation}-${Math.random().toString(36).substr(2, 6)}`,
    generation,
    genome,
    breedingValue: {
      yield: parseFloat(bv.yield.toFixed(2)),
      resistance: parseFloat(bv.resistance.toFixed(2)),
      height: parseFloat(bv.height.toFixed(2)),
    },
    phenotype: {
      yield: parseFloat(yieldPhenotype.toFixed(2)),
      resistance: parseFloat(resPhenotype.toFixed(2)),
      height: parseFloat(heightPhenotype.toFixed(2)),
    },
    isSelected: false,
    isHeterozygous: heterozygosity > 0.4,
  };
};

export const createInitialPopulation = (envVariance: number): Plant[] => {
  const plants: Plant[] = [];
  for (let i = 0; i < POPULATION_SIZE; i++) {
    plants.push(evaluatePlant(generateRandomGenome(), 1, envVariance));
  }
  return plants;
};

// Meiosis: Create gamete from diploid parent
const createGamete = (parent: Plant): number[] => {
  const gamete: number[] = [];

  if (!parent.genome.diploid) {
    // Fallback for old format
    for (let i = 0; i < GENOME_LENGTH; i++) {
      const alleles = parent.genome.loci[i];
      if (alleles === 0) gamete.push(0);
      else if (alleles === 2) gamete.push(1);
      else gamete.push(Math.random() < 0.5 ? 0 : 1);
    }
  } else {
    // Proper meiosis from diploid
    for (let i = 0; i < parent.genome.diploid.length; i++) {
      const allele = parent.genome.diploid[i];
      // Randomly inherit maternal or paternal
      gamete.push(Math.random() < 0.5 ? allele.maternal : allele.paternal);
    }
  }

  // Crossing over (recombination) - swap adjacent alleles occasionally
  for (let i = 0; i < gamete.length - 1; i++) {
    if (Math.random() < 0.1) { // 10% crossover rate
      const temp = gamete[i];
      gamete[i] = gamete[i + 1];
      gamete[i + 1] = temp;
    }
  }

  return gamete;
};

// Fertilization: Combine two gametes
const cross = (parent1: Plant, parent2: Plant, generation: number, envVariance: number): Plant => {
  const g1 = createGamete(parent1);
  const g2 = createGamete(parent2);

  // Create diploid zygote
  const diploid: Allele[] = g1.map((m, i) => ({
    maternal: m as 0 | 1,
    paternal: (g2[i] || 0) as 0 | 1,
  }));

  const loci = diploid.map(a => diploidToAdditive(a));

  return evaluatePlant({ loci, diploid }, generation, envVariance);
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
    let p2 = parents[Math.floor(Math.random() * parents.length)];

    // Avoid selfing if possible
    let attempts = 0;
    while (p1.id === p2.id && attempts < 5 && parents.length > 1) {
      p2 = parents[Math.floor(Math.random() * parents.length)];
      attempts++;
    }

    nextGen.push(cross(p1, p2, currentGeneration + 1, envVariance));
  }

  return nextGen;
};

export const calculateStats = (population: Plant[], generation: number): PopulationStats => {
  const yields = population.map(p => p.phenotype.yield);
  const res = population.map(p => p.phenotype.resistance);
  const heights = population.map(p => p.phenotype.height);

  const meanYield = yields.reduce((a, b) => a + b, 0) / population.length;
  const maxYield = Math.max(...yields);
  const meanRes = res.reduce((a, b) => a + b, 0) / population.length;
  const meanHeight = heights.reduce((a, b) => a + b, 0) / population.length;

  const variance = yields.reduce((a, b) => a + Math.pow(b - meanYield, 2), 0) / population.length;

  // Calculate average heterozygosity
  let totalHet = 0;
  population.forEach(p => {
    if (p.genome.diploid) {
      totalHet += p.genome.diploid.filter(a => isHet(a)).length / p.genome.diploid.length;
    }
  });
  const avgHet = totalHet / population.length;

  return {
    generation,
    size: population.length,
    meanYield: parseFloat(meanYield.toFixed(2)),
    varYield: parseFloat(variance.toFixed(2)),
    meanResistance: parseFloat(meanRes.toFixed(2)),
    meanHeight: parseFloat(meanHeight.toFixed(2)),
    maxYield: parseFloat(maxYield.toFixed(2)),
    heterozygosity: parseFloat(avgHet.toFixed(3)),
  };
};

// Bell Curve data for visualization
export const getBellCurveData = (population: Plant[], selectedIds: Set<string>, trait: 'yield' | 'resistance' | 'height' = 'yield') => {
  const values = population.map(p => p.phenotype[trait]);
  const min = Math.floor(Math.min(...values));
  const max = Math.ceil(Math.max(...values));

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length) || 1;

  const selectedPlants = population.filter(p => selectedIds.has(p.id));
  const selValues = selectedPlants.map(p => p.phenotype[trait]);
  let selMean = mean;
  let selStdDev = stdDev;

  if (selectedPlants.length > 0) {
    selMean = selValues.reduce((a, b) => a + b, 0) / selectedPlants.length;
    selStdDev = Math.sqrt(selValues.reduce((a, b) => a + Math.pow(b - selMean, 2), 0) / selectedPlants.length) || 0.5;
  }

  const data = [];
  const step = (max - min) / 50 || 0.5;

  for (let x = min - 3 * stdDev; x <= max + 3 * stdDev; x += step) {
    const popY = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));

    let selY = 0;
    if (selectedPlants.length > 0) {
      selY = (1 / (selStdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - selMean) / selStdDev, 2));
    }

    data.push({
      x: parseFloat(x.toFixed(2)),
      population: parseFloat(popY.toFixed(4)),
      selected: selectedPlants.length > 0 ? parseFloat(selY.toFixed(4)) : null,
    });
  }

  return { data, mean, selMean, stdDev };
};