import React from 'react';
import { Plant } from '../types';
import { YIELD_LOCI, RESISTANCE_LOCI, HEIGHT_LOCI } from '../constants';

interface GenomeVisualizerProps {
  plant: Plant | null;
}

const GenomeVisualizer: React.FC<GenomeVisualizerProps> = ({ plant }) => {
  if (!plant) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-xs italic">
        Click a plant to view genome
      </div>
    );
  }

  const renderLocus = (val: number, index: number) => {
    const isYield = YIELD_LOCI.includes(index);
    const isRes = RESISTANCE_LOCI.includes(index);
    const isHeight = HEIGHT_LOCI.includes(index);

    // Check heterozygosity from diploid data
    let isHet = false;
    if (plant.genome.diploid && plant.genome.diploid[index]) {
      const allele = plant.genome.diploid[index];
      isHet = allele.maternal !== allele.paternal;
    }

    let colorClass = 'bg-gray-800';
    let label = 'aa';

    if (val === 2) {
      if (isYield) colorClass = 'bg-green-400';
      else if (isRes) colorClass = 'bg-yellow-400';
      else if (isHeight) colorClass = 'bg-blue-400';
      label = 'AA';
    } else if (val === 1) {
      if (isYield) colorClass = 'bg-green-700';
      else if (isRes) colorClass = 'bg-yellow-700';
      else if (isHeight) colorClass = 'bg-blue-700';
      label = 'Aa';
    }

    return (
      <div
        key={index}
        className="flex flex-col items-center"
        title={`Locus ${index}: ${label}${isHet ? ' (Het)' : ''}`}
      >
        <div
          className={`w-2 h-6 ${colorClass} rounded-sm transition-all duration-300 ${isHet ? 'border border-white/50' : ''}`}
        />
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-gray-400 text-[10px] font-mono">{plant.id}</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${plant.isHeterozygous ? 'bg-purple-900 text-purple-300' : 'bg-gray-800 text-gray-400'}`}>
          {plant.isHeterozygous ? 'Heterozygous' : 'Homozygous'}
        </span>
      </div>

      <div className="flex gap-0.5 justify-center bg-black/50 p-2 rounded overflow-x-auto">
        {plant.genome.loci.map((val, idx) => renderLocus(val, idx))}
      </div>

      <div className="grid grid-cols-3 gap-1 text-[10px] font-mono">
        <div className="bg-gray-800/50 p-1.5 rounded text-center">
          <p className="text-green-400">Yield</p>
          <p className="text-white">{plant.breedingValue.yield.toFixed(1)}</p>
        </div>
        <div className="bg-gray-800/50 p-1.5 rounded text-center">
          <p className="text-yellow-400">Resist</p>
          <p className="text-white">{plant.breedingValue.resistance.toFixed(1)}</p>
        </div>
        <div className="bg-gray-800/50 p-1.5 rounded text-center">
          <p className="text-blue-400">Height</p>
          <p className="text-white">{plant.breedingValue.height.toFixed(1)}</p>
        </div>
      </div>

      <div className="flex gap-2 text-[9px] justify-center">
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Yield</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-500 rounded-full"></span> Resist</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full"></span> Height</span>
      </div>
    </div>
  );
};

export default GenomeVisualizer;