import React, { useState } from 'react';
import { X, BookOpen, Activity, Dna, HelpCircle, FileText } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const EducationModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'basics' | 'advanced' | 'assumptions'>('guide');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 w-full max-w-3xl h-[85vh] rounded-2xl shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
           <div className="flex items-center gap-2">
             <BookOpen className="text-green-500" />
             <h2 className="text-xl font-bold text-white">Breeding Protocol & Manual</h2>
           </div>
           <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
             <X size={24} />
           </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 overflow-x-auto">
           <button 
             onClick={() => setActiveTab('guide')}
             className={`flex-1 min-w-[100px] py-3 text-sm font-semibold transition-colors ${activeTab === 'guide' ? 'bg-gray-800 text-white border-b-2 border-green-500' : 'text-gray-400 hover:text-gray-200'}`}
           >
             <div className="flex items-center justify-center gap-2"><HelpCircle size={16}/> Guide</div>
           </button>
           <button 
             onClick={() => setActiveTab('basics')}
             className={`flex-1 min-w-[120px] py-3 text-sm font-semibold transition-colors ${activeTab === 'basics' ? 'bg-gray-800 text-white border-b-2 border-green-500' : 'text-gray-400 hover:text-gray-200'}`}
           >
             <div className="flex items-center justify-center gap-2"><Dna size={16}/> Genetics 101</div>
           </button>
           <button 
             onClick={() => setActiveTab('advanced')}
             className={`flex-1 min-w-[120px] py-3 text-sm font-semibold transition-colors ${activeTab === 'advanced' ? 'bg-gray-800 text-white border-b-2 border-green-500' : 'text-gray-400 hover:text-gray-200'}`}
           >
             <div className="flex items-center justify-center gap-2"><Activity size={16}/> Advanced Quant</div>
           </button>
           <button 
             onClick={() => setActiveTab('assumptions')}
             className={`flex-1 min-w-[120px] py-3 text-sm font-semibold transition-colors ${activeTab === 'assumptions' ? 'bg-gray-800 text-white border-b-2 border-green-500' : 'text-gray-400 hover:text-gray-200'}`}
           >
             <div className="flex items-center justify-center gap-2"><FileText size={16}/> Assumptions</div>
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 text-gray-300 space-y-6">
           {activeTab === 'guide' && (
             <div className="space-y-6">
               <div>
                  <h3 className="text-lg text-white font-bold mb-2">Protocol: Recurrent Selection</h3>
                  <p className="text-sm leading-relaxed">
                    You are the lead breeder. Your goal is to shift the population mean for Yield {'($\\mu_{yield}$)'} higher over 20 generations. 
                    However, you must maintain enough genetic variance ({'$\\sigma^2_G$'}) to ensure future gains.
                  </p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 p-4 rounded border border-gray-700">
                     <h4 className="text-green-400 font-bold text-sm mb-2">Controls</h4>
                     <ul className="text-sm space-y-1 list-disc list-inside text-gray-400">
                        <li><strong>LMB (Click Plant):</strong> Select/Deselect parent.</li>
                        <li><strong>LMB (Drag):</strong> Rotate 3D View.</li>
                        <li><strong>RMB (Drag):</strong> Pan View.</li>
                        <li><strong>Scroll:</strong> Zoom.</li>
                     </ul>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded border border-gray-700">
                     <h4 className="text-yellow-400 font-bold text-sm mb-2">Visual Phenotyping</h4>
                     <ul className="text-sm space-y-1 list-disc list-inside text-gray-400">
                        <li><strong>Height:</strong> Correlated to Yield (Tall ≈ High Yield).</li>
                        <li><strong>Color:</strong> Disease Resistance (Green = High, Brown = Low).</li>
                        <li><strong>Ear Size:</strong> Direct Yield Indicator.</li>
                     </ul>
                  </div>
               </div>
             </div>
           )}

           {activeTab === 'basics' && (
             <div className="space-y-6">
               <h3 className="text-lg text-white font-bold">The Fundamental Model</h3>
               <div className="bg-black/40 p-6 rounded-xl text-center border border-gray-700">
                 <span className="text-2xl font-mono text-green-400 font-bold">P = G + E</span>
                 <p className="mt-2 text-sm text-gray-500">Phenotype = Genotype + Environment</p>
               </div>
               <p className="leading-relaxed">
                 As a breeder, you only see <strong>P</strong> (how the plant looks). You want to select for <strong>G</strong> (the genes).
                 <strong>E</strong> is the "noise" caused by rain, soil, and pests.
               </p>
               <div className="bg-blue-900/20 p-4 rounded border border-blue-800">
                 <h4 className="text-blue-400 font-bold text-sm mb-1">Key Concept: Heritability ({'$h^2$'})</h4>
                 <p className="text-sm">
                   If Environmental variance is high (e.g., a drought), {'$P$'} tells you very little about {'$G$'}. Heritability is low. Breeding becomes a guessing game.
                 </p>
               </div>
             </div>
           )}

           {activeTab === 'advanced' && (
             <div className="space-y-6">
               <h3 className="text-lg text-white font-bold">The Breeder's Equation</h3>
               <div className="bg-black/40 p-6 rounded-xl text-center border border-gray-700">
                 <span className="text-2xl font-mono text-purple-400 font-bold">R = h² × S</span>
               </div>
               
               <div className="space-y-4 text-sm">
                 <p>
                   <strong>Response (R):</strong> The gain in the next generation {'($\\mu_{next} - \\mu_{current}$)'}.<br/>
                   <strong>Heritability (h²):</strong> {'$\\sigma^2_A / \\sigma^2_P$'}. The fraction of variance that is additive.<br/>
                   <strong>Selection Differential (S):</strong> {'$\\mu_{selected} - \\mu_{population}$'}. How "elite" your parents are compared to the average.
                 </p>
                 
                 <hr className="border-gray-700"/>
                 
                 <h4 className="text-white font-bold">The Bell Curve (Normal Distribution)</h4>
                 <p>
                   Quantitative traits follow a Normal Distribution. By selecting only the right-tail extremes, you shift the curve right.
                   <br/>
                   <span className="text-yellow-500">Warning:</span> Extreme selection reduces variance ({'$\\sigma^2$'}). This is the <strong>Bulmer Effect</strong>. If variance hits zero, you have reached a selection plateau.
                 </p>
               </div>
             </div>
           )}

           {activeTab === 'assumptions' && (
             <div className="space-y-6">
               <h3 className="text-lg text-white font-bold">Simulation Assumptions</h3>
               <p className="text-sm italic text-gray-400">This simulation simplifies complex biology for gameplay.</p>
               
               <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-bold text-white">1. Additive Gene Action</h4>
                      <p className="text-sm text-gray-400">Traits are controlled by 20 loci with purely additive effects (Value 0, 1, or 2). No dominance or epistasis is simulated.</p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-bold text-white">2. Pleiotropy (Height-Yield Linkage)</h4>
                      <p className="text-sm text-gray-400">
                        Assumption: {'$P_{height} = 0.8 \\times G_{yield} + \\text{Noise}$'}. 
                        <br/>Selecting for tall plants is an indirect selection for yield.
                      </p>
                  </div>

                  <div className="border-l-4 border-yellow-500 pl-4">
                      <h4 className="font-bold text-white">3. Disease Drag (Threshold Model)</h4>
                      <p className="text-sm text-gray-400">
                        If Resistance Phenotype drops below a threshold (10), a penalty is applied to the final Yield Phenotype.
                        <br/>
                        {'$P_{yield} = (G_{yield} + E) - \\text{DiseasePenalty}$'}.
                      </p>
                  </div>

                  <div className="border-l-4 border-red-500 pl-4">
                      <h4 className="font-bold text-white">4. Random Mating</h4>
                      <p className="text-sm text-gray-400">Selected parents mate randomly (Panmixia). No selfing or specific cross-planning is enabled in this version.</p>
                  </div>
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default EducationModal;