import React, { useMemo } from 'react';
import { ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ReferenceLine } from 'recharts';
import { Plant } from '../types';
import { getBellCurveData } from '../utils/geneticsEngine';

interface Props {
  population: Plant[];
  selectedIds: Set<string>;
}

const SelectionDistributionChart: React.FC<Props> = ({ population, selectedIds }) => {
  const { data, mean, selMean } = useMemo(() => getBellCurveData(population, selectedIds), [population, selectedIds]);

  const differential = selMean - mean;

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-2 px-2">
         <h3 className="text-gray-300 text-xs font-bold uppercase">Selection Differential (S)</h3>
         <span className="text-xs font-mono text-blue-400">S = +{differential.toFixed(2)}</span>
      </div>
      
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
            <XAxis dataKey="x" stroke="#9CA3AF" tick={{fontSize: 9}} tickFormatter={(val) => val.toFixed(0)} />
            <YAxis stroke="#9CA3AF" tick={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563', fontSize: '10px' }}
              labelFormatter={(label) => `Yield: ${label}`}
              formatter={(value: number, name: string) => [value.toFixed(4), name === 'population' ? 'Pop' : 'Selected']}
            />
            {/* Population Curve */}
            <Area type="monotone" dataKey="population" stroke="#10B981" fill="#10B981" fillOpacity={0.2} name="Population" />
            
            {/* Selected Curve */}
            {selectedIds.size > 0 && (
               <Area type="monotone" dataKey="selected" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} name="Parents" />
            )}

            {/* Mean Lines */}
            <ReferenceLine x={mean} stroke="#10B981" strokeDasharray="3 3" label={{ position: 'top', value: 'μ', fill: '#10B981', fontSize: 10 }} />
            {selectedIds.size > 0 && (
                <ReferenceLine x={selMean} stroke="#3B82F6" strokeDasharray="3 3" label={{ position: 'top', value: 'μSel', fill: '#3B82F6', fontSize: 10 }} />
            )}

          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[9px] text-gray-500 text-center mt-1">
        R = h² × S (Response = Heritability × Selection Differential)
      </p>
    </div>
  );
};

export default SelectionDistributionChart;