
export interface Trait {
  id: string;
  name: string;
  type: 'quantitative' | 'qualitative';
  lociIndices: number[]; // Which indices in the genome array affect this trait
  optimumValue?: number;
}

// Diploid genome representation
export interface Allele {
  maternal: 0 | 1; // 0 = recessive, 1 = dominant
  paternal: 0 | 1;
}

export interface Genome {
  // Diploid: Each locus has two alleles (maternal and paternal)
  // For backwards compatibility, we also compute the additive value (0, 1, or 2)
  loci: number[]; // Additive representation: 0 (aa), 1 (Aa), 2 (AA)
  diploid: Allele[]; // Full diploid representation
}

export interface Plant {
  id: string;
  generation: number;
  genome: Genome;
  phenotype: {
    yield: number;
    resistance: number;
    height: number;
  };
  breedingValue: {
    yield: number;
    resistance: number;
    height: number;
  };
  isSelected: boolean;
  isHeterozygous: boolean; // True if many loci are Aa
}

export interface PopulationStats {
  generation: number;
  size: number;
  meanYield: number;
  varYield: number;
  meanResistance: number;
  meanHeight: number;
  maxYield: number;
  heterozygosity: number; // Average heterozygosity
}

export interface GameState {
  generationCount: number;
  population: Plant[];
  history: PopulationStats[];
  selectedPlantIds: string[];
  selectionIntensity: number; // 0.1 to 1.0 (10% to 100%)
  environmentalVariance: number; // The 'E' in P = G + E
  messages: { role: 'system' | 'ai', text: string, timestamp: number }[];
  isThinking: boolean;
}

// Global JSX definitions for Three.js elements to satisfy TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
      mesh: any;
      group: any;
      planeGeometry: any;
      meshStandardMaterial: any;
      meshBasicMaterial: any;
      gridHelper: any;
      ringGeometry: any;
      sphereGeometry: any;
      cylinderGeometry: any;
      coneGeometry: any;
      capsuleGeometry: any;
      primitive: any;
    }
  }
}
