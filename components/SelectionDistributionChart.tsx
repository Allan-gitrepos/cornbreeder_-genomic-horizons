import React, { useMemo, useState } from 'react';
import { ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Plant } from '../types';
import { getBellCurveData } from '../utils/geneticsEngine';

interface Props {
  population: Plant[];
  selectedIds: Set<string>;
}

const SelectionDistributionChart: React.FC<Props> = ({ population, selectedIds }) => {
  const [trait, setTrait] = useState<'yield' | 'resistance' | 'height'>('yield');

  const { data, mean, selMean, stdDev } = useMemo(
    () => getBellCurveData(population, selectedIds, trait),
    [population, selectedIds, trait]
  );

  const differential = selectedIds.size > 0 ? selMean - mean : 0;

  const traitColors: Record<string, { primary: string; secondary: string }> = {
    yield: { primary: '#22c55e', secondary: '#86efac' },
    resistance: { primary: '#eab308', secondary: '#fde047' },
    height: { primary: '#3b82f6', secondary: '#93c5fd' },
  };

  const colors = traitColors[trait];

  return (
    <div className="h-full flex flex-col">
      {/* Trait selector and stats */}
      <div className="flex justify-between items-center mb-1 px-1">
        <div className="flex gap-1">
          {(['yield', 'resistance', 'height'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTrait(t)}
              className={`px-1.5 py-0.5 text-[9px] rounded transition-colors ${trait === t
                  ? t === 'yield' ? 'bg-green-700 text-white'
                    : t === 'resistance' ? 'bg-yellow-700 text-white'
                      : 'bg-blue-700 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <span className={`text-[10px] font-mono ${differential > 0 ? 'text-green-400' : differential < 0 ? 'text-red-400' : 'text-gray-400'}`}>
          S = {differential >= 0 ? '+' : ''}{differential.toFixed(2)}
        </span>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
            <XAxis
              dataKey="x"
              stroke="#9CA3AF"
              tick={{ fontSize: 8 }}
              tickFormatter={(val) => val.toFixed(0)}
            />
            <YAxis stroke="#9CA3AF" tick={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563', fontSize: '10px' }}
              labelFormatter={(label) => `${trait}: ${parseFloat(label).toFixed(1)}`}
              formatter={(value: number | null, name: string) => [
                value ? value.toFixed(4) : '0',
                name === 'population' ? 'Pop' : 'Selected'
              ]}
            />

            {/* Population Curve */}
            <Area
              type="monotone"
              dataKey="population"
              stroke={colors.primary}
              fill={colors.primary}
              fillOpacity={0.2}
              name="Population"
            />

            {/* Selected Curve */}
            {selectedIds.size > 0 && (
              <Area
                type="monotone"
                dataKey="selected"
                stroke="#a855f7"
                fill="#a855f7"
                fillOpacity={0.4}
                name="Selected"
              />
            )}

            {/* Mean Lines */}
            <ReferenceLine
              x={mean}
              stroke={colors.primary}
              strokeDasharray="3 3"
              label={{ position: 'top', value: 'μ', fill: colors.primary, fontSize: 9 }}
            />
            {selectedIds.size > 0 && (
              <ReferenceLine
                x={selMean}
                stroke="#a855f7"
                strokeDasharray="3 3"
                label={{ position: 'top', value: 'μS', fill: '#a855f7', fontSize: 9 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="text-[8px] text-gray-500 text-center">
        μ={mean.toFixed(1)} σ={stdDev.toFixed(1)} | R = h² × S
      </div>
    </div>
  );
};

export default SelectionDistributionChart;