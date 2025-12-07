import React, { useState, useEffect } from 'react';
import { Plant, PopulationStats } from './types';
import {
  createInitialPopulation, breedNextGeneration, calculateStats
} from './utils/geneticsEngine';
import { INITIAL_ENV_VARIANCE, POPULATION_SIZE, SELECTION_TYPES } from './constants';
import GenomeVisualizer from './components/GenomeVisualizer';
import StatsPanel from './components/StatsPanel';
import Scene3D from './components/Scene3D';
import EducationModal from './components/EducationModal';
import SelectionDistributionChart from './components/SelectionDistributionChart';
import { getGeneticistAnalysis, generateScenario, setApiKey, isApiConfigured } from './services/geminiService';
import { Dna, Activity, Sprout, ArrowRight, Microscope, AlertTriangle, BookOpen, Layers, Target, Shield, Ruler, Zap, Key, ExternalLink } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [generation, setGeneration] = useState<number>(1);
  const [population, setPopulation] = useState<Plant[]>([]);
  const [history, setHistory] = useState<PopulationStats[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionIntensity, setSelectionIntensity] = useState<number>(0.2);
  const [envVariance, setEnvVariance] = useState<number>(INITIAL_ENV_VARIANCE);
  const [genomicSelectionEnabled, setGenomicSelectionEnabled] = useState<boolean>(false);
  const [analysisMsg, setAnalysisMsg] = useState<string>("Initialize the field to begin.");
  const [scenario, setScenario] = useState<string>("Normal Conditions");
  const [lastSelectedPlant, setLastSelectedPlant] = useState<Plant | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // UI State
  const [isManualOpen, setIsManualOpen] = useState<boolean>(false);
  const [apiKey, setApiKeyState] = useState<string>('');
  const [showApiInput, setShowApiInput] = useState<boolean>(false);
  const [apiConfigured, setApiConfigured] = useState<boolean>(isApiConfigured());

  // Initialize
  useEffect(() => {
    const initPop = createInitialPopulation(envVariance);
    setPopulation(initPop);
    const initialStats = calculateStats(initPop, 1);
    setHistory([initialStats]);
    setAnalysisMsg("Welcome, Breeder! This is your Founder Population (F0). High genetic variance detected. Select plants to begin breeding. Tip: Use the Auto-Select buttons below.");
  }, []);

  // Handlers
  const handlePlantClick = (id: string) => {
    const plant = population.find(p => p.id === id);
    if (plant) setLastSelectedPlant(plant);

    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Auto-select functions
  const autoSelectByTrait = (trait: 'yield' | 'resistance' | 'height' | 'optimum') => {
    const count = Math.ceil(POPULATION_SIZE * selectionIntensity);

    let sorted: Plant[];

    if (trait === 'optimum') {
      // Index selection: balanced score of all traits
      sorted = [...population].sort((a, b) => {
        const scoreA = a.phenotype.yield * 0.5 + a.phenotype.resistance * 0.3 + (a.phenotype.height / 2) * 0.2;
        const scoreB = b.phenotype.yield * 0.5 + b.phenotype.resistance * 0.3 + (b.phenotype.height / 2) * 0.2;
        return scoreB - scoreA;
      });
    } else if (trait === 'height') {
      // For height, breeders might want dwarf plants (lower height)
      sorted = [...population].sort((a, b) => a.phenotype.height - b.phenotype.height);
    } else {
      // For yield and resistance, higher is better
      const getValue = (p: Plant) => {
        if (genomicSelectionEnabled) {
          return p.breedingValue[trait];
        }
        return p.phenotype[trait];
      };
      sorted = [...population].sort((a, b) => getValue(b) - getValue(a));
    }

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
      const parents = population.filter(p => selectedIds.has(p.id));

      // Generate scenario for next generation
      const newScenario = await generateScenario(generation + 1);
      setScenario(newScenario.description);
      const newEnvVar = newScenario.envImpact;

      // Breed next generation
      const nextGen = breedNextGeneration(parents, generation, newEnvVar);

      // Calculate stats
      const stats = calculateStats(nextGen, generation + 1);

      // Update state
      setPopulation(nextGen);
      setHistory(prev => [...prev, stats]);
      setGeneration(prev => prev + 1);
      setEnvVariance(newEnvVar);
      setSelectedIds(new Set());
      setLastSelectedPlant(null);

      // Get AI analysis
      const analysis = await getGeneticistAnalysis([...history, stats], generation + 1);
      setAnalysisMsg(analysis);
    } catch (e) {
      console.error(e);
      setAnalysisMsg("Analysis error. Continue breeding based on phenotypic selection.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApiKeySubmit = () => {
    if (setApiKey(apiKey)) {
      setApiConfigured(true);
      setShowApiInput(false);
      setAnalysisMsg("API key configured! AI-powered analysis is now available.");
    } else {
      alert("Invalid API key. Please check and try again.");
    }
  };

  const currentStats = history.length > 0 ? history[history.length - 1] : null;

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 font-sans overflow-hidden">

      <EducationModal isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} />

      {/* Sidebar: Controls & Stats */}
      <aside className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col z-20 shadow-2xl relative">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900">
          <div className="flex items-center gap-2 text-green-500">
            <Sprout size={22} />
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white leading-none">CornBreeder</h1>
              <p className="text-[10px] text-gray-500 font-mono">Genomic Horizons v3.0</p>
            </div>
          </div>
          <button onClick={() => setIsManualOpen(true)} className="text-gray-400 hover:text-white transition-colors" title="Manual">
            <BookOpen size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4">

          {/* Status Card */}
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/40 rounded-lg p-3 border border-gray-700">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500 text-xs uppercase font-bold">Generation</span>
                <p className="text-2xl font-mono text-white">{generation}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs uppercase font-bold">Mean Yield</span>
                <p className="text-2xl font-mono text-green-400">{currentStats?.meanYield.toFixed(1) || '0'}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs uppercase font-bold">Mean Height</span>
                <p className="text-lg font-mono text-blue-400">{currentStats?.meanHeight.toFixed(1) || '0'}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs uppercase font-bold">Resistance</span>
                <p className="text-lg font-mono text-yellow-400">{currentStats?.meanResistance.toFixed(1) || '0'}</p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-700">
              <span className="text-gray-500 text-xs uppercase font-bold block">Environment</span>
              <span className="text-sm text-yellow-500 flex items-center gap-1 font-mono">
                <AlertTriangle size={12} /> {scenario}
              </span>
            </div>
          </div>

          {/* API Key Input */}
          {!apiConfigured && (
            <div className="bg-purple-900/20 border border-purple-700 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-400 text-xs font-bold flex items-center gap-1">
                  <Key size={12} /> AI Features (Optional)
                </span>
                <button
                  onClick={() => setShowApiInput(!showApiInput)}
                  className="text-purple-400 hover:text-purple-300 text-xs"
                >
                  {showApiInput ? 'Hide' : 'Setup'}
                </button>
              </div>
              {showApiInput && (
                <div className="space-y-2">
                  <input
                    type="password"
                    placeholder="Enter Gemini API Key"
                    value={apiKey}
                    onChange={(e) => setApiKeyState(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleApiKeySubmit}
                      className="flex-1 bg-purple-700 hover:bg-purple-600 text-white text-xs py-1 rounded"
                    >
                      Connect
                    </button>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-xs"
                    >
                      <ExternalLink size={10} /> Get Key
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Selection Distribution */}
          <div className="h-32 bg-gray-800/30 rounded-lg p-2 border border-gray-700">
            <SelectionDistributionChart population={population} selectedIds={selectedIds} />
          </div>

          {/* Selection Controls */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-1 block flex justify-between">
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
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
            </div>

            {/* Genomic View Toggle */}
            <div className="flex items-center justify-between bg-gray-800 p-2 rounded-lg border border-gray-700">
              <span className="text-xs text-gray-300 font-semibold flex items-center gap-1">
                <Layers size={12} /> Genomic View
              </span>
              <button
                onClick={() => setGenomicSelectionEnabled(!genomicSelectionEnabled)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors ${genomicSelectionEnabled ? 'bg-purple-600' : 'bg-gray-600'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${genomicSelectionEnabled ? 'translate-x-4' : ''}`}></div>
              </button>
            </div>

            {/* Auto-Select Buttons */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-bold uppercase">Auto-Select Top {Math.round(selectionIntensity * 100)}%</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => autoSelectByTrait('yield')}
                  className="py-2 px-3 bg-green-800/50 hover:bg-green-700/50 text-white text-xs font-semibold rounded-lg border border-green-600/30 transition-colors flex items-center justify-center gap-1"
                >
                  <Target size={12} /> Yield
                </button>
                <button
                  onClick={() => autoSelectByTrait('resistance')}
                  className="py-2 px-3 bg-yellow-800/50 hover:bg-yellow-700/50 text-white text-xs font-semibold rounded-lg border border-yellow-600/30 transition-colors flex items-center justify-center gap-1"
                >
                  <Shield size={12} /> Disease
                </button>
                <button
                  onClick={() => autoSelectByTrait('height')}
                  className="py-2 px-3 bg-blue-800/50 hover:bg-blue-700/50 text-white text-xs font-semibold rounded-lg border border-blue-600/30 transition-colors flex items-center justify-center gap-1"
                >
                  <Ruler size={12} /> Dwarf
                </button>
                <button
                  onClick={() => autoSelectByTrait('optimum')}
                  className="py-2 px-3 bg-purple-800/50 hover:bg-purple-700/50 text-white text-xs font-semibold rounded-lg border border-purple-600/30 transition-colors flex items-center justify-center gap-1"
                >
                  <Zap size={12} /> Optimum
                </button>
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="bg-blue-900/10 border border-blue-800 p-3 rounded-lg">
            <div className="flex items-center gap-1 text-blue-400 mb-1">
              <Activity size={14} />
              <h3 className="text-xs font-bold uppercase">Professor's Note</h3>
              {!apiConfigured && <span className="text-[10px] text-gray-500">(Offline)</span>}
            </div>
            <p className="text-xs text-gray-300 leading-relaxed italic">
              "{analysisMsg}"
            </p>
          </div>

        </div>

        {/* Action Button */}
        <div className="p-3 border-t border-gray-800 bg-gray-900">
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
            {!isProcessing && <ArrowRight size={16} />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative">

        {/* Top Overlay */}
        <div className="absolute top-0 left-0 w-full p-3 z-10 pointer-events-none flex justify-between items-start">
          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-700 flex gap-3 text-xs font-mono">
              <span className="text-green-400">● Healthy</span>
              <span className="text-yellow-500">● Susceptible</span>
              <span className="text-gray-400">|</span>
              <span className="text-white">Size ≈ Traits</span>
            </div>
          </div>
        </div>

        {/* Workspace Split */}
        <div className="flex-1 flex overflow-hidden">

          {/* 3D Field View */}
          <div className="flex-1 relative">
            <Scene3D
              population={population}
              selectedIds={selectedIds}
              onPlantClick={handlePlantClick}
              showGenetics={genomicSelectionEnabled}
            />
          </div>

          {/* Analytics & DNA Panel */}
          <div className="w-72 border-l border-gray-800 bg-gray-900 flex flex-col shadow-2xl z-20">

            {/* DNA Viewer */}
            <div className="h-1/4 p-3 border-b border-gray-800 overflow-y-auto bg-gray-900/50">
              <div className="flex items-center gap-1 mb-2 text-gray-400">
                <Dna size={14} />
                <h2 className="text-xs font-bold uppercase tracking-wider">Genome Viewer</h2>
              </div>
              <GenomeVisualizer plant={lastSelectedPlant} />
            </div>

            {/* Charts */}
            <div className="flex-1 p-3 overflow-hidden flex flex-col bg-gray-900">
              <div className="flex items-center gap-1 mb-2 text-gray-400">
                <Activity size={14} />
                <h2 className="text-xs font-bold uppercase tracking-wider">Breeding Progress</h2>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto">
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