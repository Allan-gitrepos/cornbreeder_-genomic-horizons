import React from 'react';
import { Plant, Genome } from '../types';
import { YIELD_LOCI, RESISTANCE_LOCI } from '../constants';

interface GenomeVisualizerProps {
  plant: Plant | null;
}

const GenomeVisualizer: React.FC<GenomeVisualizerProps> = ({ plant }) => {
  if (!plant) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm italic">
        Select a plant to sequence its genome
      </div>
    );
  }

  const renderLocus = (val: number, index: number) => {
    // 2 (AA) = Bright, 1 (Aa) = Medium, 0 (aa) = Dark/Empty
    let colorClass = 'bg-gray-800';
    let label = 'aa';
    
    const isYield = YIELD_LOCI.includes(index);
    const isRes = RESISTANCE_LOCI.includes(index);

    if (val === 2) {
      colorClass = isYield ? 'bg-green-400' : 'bg-blue-400';
      label = 'AA';
    } else if (val === 1) {
      colorClass = isYield ? 'bg-green-700' : 'bg-blue-700';
      label = 'Aa';
    }

    return (
      <div key={index} className="flex flex-col items-center gap-1">
        <div className={`w-3 h-10 ${colorClass} rounded-sm transition-all duration-300 border border-gray-700`}></div>
        <span className="text-[9px] text-gray-500 font-mono">{index}</span>
      </div>
    );
  };

  return (
    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 shadow-inner">
      <div className="flex justify-between items-end mb-3">
        <h3 className="text-white font-mono text-sm">Sequencer Output: <span className="text-blue-400">{plant.id}</span></h3>
        <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Yield Loci</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full"></span> Resistance Loci</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center bg-black/50 p-4 rounded-lg overflow-x-auto">
        {plant.genome.loci.map((val, idx) => renderLocus(val, idx))}
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4 text-xs font-mono">
         <div className="bg-gray-800 p-2 rounded">
            <p className="text-gray-400">Total Yield Alleles</p>
            <p className="text-lg text-white">{plant.breedingValue.yield} / 20</p>
         </div>
         <div className="bg-gray-800 p-2 rounded">
            <p className="text-gray-400">Total Resistance Alleles</p>
            <p className="text-lg text-white">{plant.breedingValue.resistance} / 20</p>
         </div>
      </div>
    </div>
  );
};

export default GenomeVisualizer;