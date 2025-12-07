export const POPULATION_SIZE = 40;
export const GENOME_LENGTH = 20; // 20 Loci for simplicity in visualization
export const MAX_GENERATIONS = 20;

export const TRAITS = {
  YIELD: 'yield',
  RESISTANCE: 'resistance',
};

// Indices 0-9 affect Yield, 10-19 affect Drought Resistance
export const YIELD_LOCI = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
export const RESISTANCE_LOCI = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

export const INITIAL_ENV_VARIANCE = 2.0;
