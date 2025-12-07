
export interface Trait {
  id: string;
  name: string;
  type: 'quantitative' | 'qualitative';
  lociIndices: number[]; // Which indices in the genome array affect this trait
  optimumValue?: number;
}

export interface Genome {
  // A simplified genome: an array of chromosome pairs.
  // For simplicity in this game, we use a single linear array of loci per chromosome pair.
  // Values: 0 (aa), 1 (Aa), 2 (AA) - representing additive effect alleles.
  loci: number[];
}

export interface Plant {
  id: string;
  generation: number;
  genome: Genome;
  phenotype: {
    [traitId: string]: number; // The observed value (G + E)
    height?: number; // Visual trait correlated with yield
  };
  breedingValue: {
    [traitId: string]: number; // The true genetic potential (G)
  };
  isSelected: boolean;
}

export interface PopulationStats {
  generation: number;
  size: number;
  meanYield: number;
  varYield: number;
  meanResistance: number;
  maxYield: number;
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
      mesh: any;
      group: any;
      planeGeometry: any;
      meshStandardMaterial: any;
      gridHelper: any;
      ringGeometry: any;
      meshBasicMaterial: any;
      sphereGeometry: any;
      cylinderGeometry: any;
      coneGeometry: any;
      capsuleGeometry: any;
      primitive: any; // Added for GLTF handling
    }
  }
}
