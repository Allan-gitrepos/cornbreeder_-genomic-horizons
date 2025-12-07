import React, { useState, useEffect } from 'react';
import { 
  Plant, PopulationStats, 
} from './types';
import { 
  createInitialPopulation, breedNextGeneration, calculateStats 
} from './utils/geneticsEngine';
import { INITIAL_ENV_VARIANCE, POPULATION_SIZE } from './constants';
import GenomeVisualizer from './components/GenomeVisualizer';
import StatsPanel from './components/StatsPanel';
import Scene3D from './components/Scene3D';
import EducationModal from './components/EducationModal';
import SelectionDistributionChart from './components/SelectionDistributionChart';
import { getGeneticistAnalysis, generateScenario } from './services/geminiService';
import { Dna, Activity, Sprout, ArrowRight, Microscope, AlertTriangle, BookOpen, Layers } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [generation, setGeneration] = useState<number>(1);
  const [population, setPopulation] = useState<Plant[]>([]);
  const [history, setHistory] = useState<PopulationStats[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionIntensity, setSelectionIntensity] = useState<number>(0.2); // Default top 20%
  const [envVariance, setEnvVariance] = useState<number>(INITIAL_ENV_VARIANCE);
  const [genomicSelectionEnabled, setGenomicSelectionEnabled] = useState<boolean>(false);
  const [analysisMsg, setAnalysisMsg] = useState<string>("Initialize the field to begin.");
  const [scenario, setScenario] = useState<string>("Normal Conditions");
  const [lastSelectedPlant, setLastSelectedPlant] = useState<Plant | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // UI State
  const [isManualOpen, setIsManualOpen] = useState<boolean>(false);

  // Initialize
  useEffect(() => {
    const initPop = createInitialPopulation(envVariance);
    setPopulation(initPop);
    const initialStats = calculateStats(initPop, 1);
    setHistory([initialStats]);
    setAnalysisMsg("Welcome, Breeder. This is your Founder Population (F0). Genetic variance is high. Select the best plants based on Phenotype to improve Yield.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handlers
  const handlePlantClick = (id: string) => {
    const plant = population.find(p => p.id === id);
    if (plant) setLastSelectedPlant(plant);
    
    // Toggle selection
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const autoSelectBest = () => {
    // Select top % based on Phenotype (or GEBV if enabled)
    const count = Math.ceil(POPULATION_SIZE * selectionIntensity);
    
    // Sort logic
    const sorted = [...population].sort((a, b) => {
       // If Genomic Selection is ON, we can see the Breeding Value (True Genotype)
       // If OFF, we only see Phenotype (P = G + E)
       const valA = genomicSelectionEnabled ? a.breedingValue.yield : a.phenotype.yield;
       const valB = genomicSelectionEnabled ? b.breedingValue.yield : b.phenotype.yield;
       return valB - valA; // Descending
    });

    const topIds = new Set(sorted.slice(0, count).map(p => p.id));
    setSelectedIds(topIds);
  };

  const advanceGeneration = async () => {
    if (selectedIds.size < 2) {
      alert("Select at least 2 parents to breed!");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Get Parents
      const parents = population.filter(p => selectedIds.has(p.id));

      // 2. AI: Generate Scenario (affects Env Variance for next gen)
      const newScenario = await generateScenario(generation + 1);
      setScenario(newScenario.description);
      const newEnvVar = newScenario.envImpact; 

      // 3. Breed
      const nextGen = breedNextGeneration(parents, generation, newEnvVar);
      
      // 4. Update Stats
      const stats = calculateStats(nextGen, generation + 1);
      
      // 5. Update State
      setPopulation(nextGen);
      setHistory(prev => [...prev, stats]);
      setGeneration(prev => prev + 1);
      setEnvVariance(newEnvVar);
      setSelectedIds(new Set()); // Reset selection
      setLastSelectedPlant(null);

      // 6. AI: Analyze
      const analysis = await getGeneticistAnalysis([...history, stats], generation + 1);
      setAnalysisMsg(analysis);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentMeanYield = history.length > 0 ? history[history.length - 1].meanYield : 0;

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 font-sans overflow-hidden">
      
      <EducationModal isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} />

      {/* Sidebar: Controls & Stats */}
      <aside className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col z-20 shadow-2xl relative">
        <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-gray-900">
           <div className="flex items-center gap-2 text-green-500">
             <Sprout size={24} />
             <div>
                <h1 className="text-lg font-bold tracking-tight text-white leading-none">CornBreeder</h1>
                <p className="text-[10px] text-gray-500 font-mono">3D Sim v2.0</p>
             </div>
           </div>
           <button onClick={() => setIsManualOpen(true)} className="text-gray-400 hover:text-white transition-colors" title="Manual">
             <BookOpen size={20} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* Status Card */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex justify-between items-center mb-2">
               <span className="text-gray-400 text-xs uppercase font-bold">Generation</span>
               <span className="text-2xl font-mono text-white">{generation}</span>
            </div>
            <div className="flex justify-between items-center">
               <span className="text-gray-400 text-xs uppercase font-bold">Pop. Mean Yield</span>
               <span className="text-xl font-mono text-green-400">{currentMeanYield.toFixed(2)}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-700">
               <span className="text-gray-400 text-xs uppercase font-bold block mb-1">Condition</span>
               <span className="text-sm text-yellow-500 flex items-center gap-2 font-mono">
                 <AlertTriangle size={12} /> {scenario}
               </span>
            </div>
          </div>

          {/* New: Selection Distribution Chart */}
          <div className="h-40 bg-gray-800/30 rounded-lg p-2 border border-gray-700">
            <SelectionDistributionChart population={population} selectedIds={selectedIds} />
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-2 block flex justify-between">
                <span>Selection Intensity</span>
                <span className="text-white">{Math.round(selectionIntensity * 100)}%</span>
              </label>
              <input 
                type="range" 
                min="0.05" 
                max="0.5" 
                step="0.05" 
                value={selectionIntensity}
                onChange={(e) => setSelectionIntensity(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            
            <div className="flex items-center justify-between bg-gray-800 p-2 rounded-lg border border-gray-700">
               <span className="text-xs text-gray-300 font-semibold flex items-center gap-2"><Layers size={14}/> Genomic View</span>
               <button 
                 onClick={() => setGenomicSelectionEnabled(!genomicSelectionEnabled)}
                 className={`w-10 h-5 rounded-full p-0.5 transition-colors ${genomicSelectionEnabled ? 'bg-purple-600' : 'bg-gray-600'}`}
               >
                 <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${genomicSelectionEnabled ? 'translate-x-5' : ''}`}></div>
               </button>
            </div>

            <button 
              onClick={autoSelectBest}
              className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg border border-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <Microscope size={16} /> Auto-Select Top {Math.round(selectionIntensity * 100)}%
            </button>
          </div>

          {/* AI Analysis */}
          <div className="bg-blue-900/10 border border-blue-800 p-4 rounded-lg">
             <div className="flex items-center gap-2 text-blue-400 mb-2">
                <Activity size={16} />
                <h3 className="text-xs font-bold uppercase">Professor's Note</h3>
             </div>
             <p className="text-sm text-gray-300 leading-relaxed italic">
               "{analysisMsg}"
             </p>
          </div>

        </div>

        {/* Action Button */}
        <div className="p-4 border-t border-gray-800 bg-gray-900">
           <div className="flex justify-between items-center mb-2 text-xs text-gray-500 font-mono">
             <span>Selected: {selectedIds.size}</span>
             <span>Req: 2+</span>
           </div>
           <button 
             onClick={advanceGeneration}
             disabled={isProcessing || selectedIds.size < 2}
             className="w-full py-3 bg-green-700 hover:bg-green-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all border border-green-600/30"
           >
             {isProcessing ? 'Processing Meiosis...' : 'Breed Generation'}
             {!isProcessing && <ArrowRight size={18} />}
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative">
        
        {/* Top Overlay */}
        <div className="absolute top-0 left-0 w-full p-4 z-10 pointer-events-none flex justify-between items-start">
           <div className="flex items-center gap-4 pointer-events-auto">
             <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-gray-700 flex gap-4 text-xs font-mono">
                <span className="text-green-400">● Healthy</span>
                <span className="text-yellow-500">● Susceptible</span>
                <span className="text-gray-400">|</span>
                <span className="text-white">Height ≈ Yield</span>
             </div>
           </div>
           {/* Manual Button (Mobile/Top) */}
           {/* We put manual button in sidebar, but here is a backup or additional info */}
        </div>

        {/* Workspace Split */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* 3D Field View (Left 60%) */}
          <div className="flex-1 relative bg-black">
             <Scene3D 
                population={population} 
                selectedIds={selectedIds} 
                onPlantClick={handlePlantClick} 
                showGenetics={genomicSelectionEnabled}
             />
          </div>

          {/* Analytics & DNA (Right 40%) */}
          <div className="w-80 border-l border-gray-800 bg-gray-900 flex flex-col shadow-2xl z-20">
            
            {/* Top: DNA Viewer */}
            <div className="h-1/3 p-4 border-b border-gray-800 overflow-y-auto bg-gray-900/50">
               <div className="flex items-center gap-2 mb-2 text-gray-400">
                 <Dna size={16} />
                 <h2 className="text-xs font-bold uppercase tracking-wider">Genomic Sequencer</h2>
               </div>
               <GenomeVisualizer plant={lastSelectedPlant} />
            </div>

            {/* Bottom: Charts */}
            <div className="flex-1 p-4 overflow-hidden flex flex-col bg-gray-900">
               <div className="flex items-center gap-2 mb-2 text-gray-400">
                 <Activity size={16} />
                 <h2 className="text-xs font-bold uppercase tracking-wider">Genetic Gain</h2>
               </div>
               <div className="flex-1 min-h-0">
                 <StatsPanel history={history} />
               </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
};

export default App;