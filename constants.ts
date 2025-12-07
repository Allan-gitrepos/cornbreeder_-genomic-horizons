export const POPULATION_SIZE = 64; // Increased for more plants
export const GENOME_LENGTH = 30; // 30 Loci for more genetic variation
export const MAX_GENERATIONS = 20;

export const TRAITS = {
  YIELD: 'yield',
  RESISTANCE: 'resistance',
  HEIGHT: 'height',
};

// Loci allocation with LINKAGE:
// Loci 0-9: Primarily affect Yield
// Loci 10-19: Primarily affect Disease Resistance (linked negatively to yield)
// Loci 20-29: Primarily affect Height (linked positively to yield)
export const YIELD_LOCI = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
export const RESISTANCE_LOCI = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
export const HEIGHT_LOCI = [20, 21, 22, 23, 24, 25, 26, 27, 28, 29];

// Linkage: Some loci affect multiple traits (pleiotropy)
// Loci 8,9 affect both yield AND resistance (trade-off)
// Loci 20,21 affect both height AND yield (positive linkage)
export const PLEIOTROPIC_YIELD_RESISTANCE = [8, 9]; // Higher = more yield, less resistance
export const PLEIOTROPIC_HEIGHT_YIELD = [20, 21]; // Dwarf = less yield

export const INITIAL_ENV_VARIANCE = 1.5;

// Selection types
export const SELECTION_TYPES = {
  YIELD: 'yield',
  RESISTANCE: 'resistance',
  HEIGHT: 'height',
  OPTIMUM: 'optimum', // Balanced selection
};
