import React from 'react';
import { Plant } from '../types';
import { TRAITS } from '../constants';

interface CornPlantProps {
  plant: Plant;
  onClick: (id: string) => void;
  isSelected: boolean;
  showGenetics: boolean;
}

const CornPlant: React.FC<CornPlantProps> = ({ plant, onClick, isSelected, showGenetics }) => {
  // Visual mapping
  // Yield affects Height and Ear size
  // Resistance affects Color (Green = resistant, Yellow/Brown = susceptible)
  
  const yieldVal = plant.phenotype[TRAITS.YIELD]; // Range roughly 0-25
  const resVal = plant.phenotype[TRAITS.RESISTANCE]; // Range roughly 0-25

  // Normalize for visuals
  const heightScale = Math.min(1.5, Math.max(0.7, yieldVal / 12)); 
  
  // Color calculation: High resistance = Rich Green (#166534), Low = Dry Yellow (#EAB308)
  // Simple interpolation logic
  const isHealthy = resVal > 10;
  const plantColor = isHealthy ? 'text-green-600' : 'text-yellow-600';
  const earColor = isSelected ? 'text-blue-400' : 'text-yellow-300';
  
  const baseClasses = `transition-all duration-300 cursor-pointer transform hover:scale-110 flex flex-col items-center justify-end h-32 w-16 relative`;
  const selectionRing = isSelected ? 'ring-2 ring-blue-500 bg-blue-900/20 rounded-lg' : '';

  return (
    <div 
      className={`${baseClasses} ${selectionRing}`} 
      onClick={() => onClick(plant.id)}
    >
      {/* Genomic Value Badge if toggled */}
      {showGenetics && (
        <div className="absolute -top-2 bg-gray-800 text-[10px] px-1 rounded border border-gray-600 text-purple-300 z-10 font-mono">
          BV:{plant.breedingValue[TRAITS.YIELD]}
        </div>
      )}

      {/* Phenotype Value (Hover) */}
      <div className="opacity-0 hover:opacity-100 absolute bottom-full mb-1 bg-black/80 text-white text-xs p-1 rounded z-20 pointer-events-none whitespace-nowrap">
        Y: {yieldVal.toFixed(1)} | R: {resVal.toFixed(1)}
      </div>

      {/* SVG Corn */}
      <svg 
        width="40" 
        height="100%" 
        viewBox="0 0 100 200" 
        className={`${plantColor}`}
        style={{ transform: `scaleY(${heightScale})` }}
      >
        {/* Stalk */}
        <path d="M45,200 Q50,100 48,50 L50,0 L52,50 Q50,100 55,200 Z" fill="currentColor" />
        
        {/* Leaves */}
        <path d="M48,150 Q10,120 0,160" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        <path d="M52,130 Q90,100 100,140" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        <path d="M48,90 Q15,70 10,110" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        <path d="M52,70 Q85,50 90,90" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />

        {/* Corn Ear */}
        <ellipse cx="50" cy="100" rx="12" ry="30" className={earColor} fill="currentColor" />
        {/* Silks */}
        <path d="M50,70 Q40,60 45,50" fill="none" stroke="#FDE047" strokeWidth="2" />
        <path d="M50,70 Q60,60 55,50" fill="none" stroke="#FDE047" strokeWidth="2" />
      </svg>

      {/* Trait Tags */}
      <div className="mt-1 flex gap-1">
         {isSelected && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
      </div>
    </div>
  );
};

export default CornPlant;