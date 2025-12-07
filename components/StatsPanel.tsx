import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend
} from 'recharts';
import { PopulationStats } from '../types';

interface StatsPanelProps {
  history: PopulationStats[];
}

const StatsPanel: React.FC<StatsPanelProps> = ({ history }) => {
  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto">
      {/* Yield Progress */}
      <div className="bg-gray-800/80 p-3 rounded-xl border border-gray-700 min-h-[180px]">
        <h3 className="text-green-400 text-xs font-bold mb-2 flex items-center gap-1">
          🌽 Yield Progress
        </h3>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="generation" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
            <YAxis stroke="#9CA3AF" domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563', color: '#F3F4F6', fontSize: 11 }}
            />
            <Line type="monotone" dataKey="meanYield" stroke="#22c55e" strokeWidth={2} dot={{ r: 2 }} name="Mean" />
            <Line type="monotone" dataKey="maxYield" stroke="#86efac" strokeWidth={1.5} strokeDasharray="4 4" name="Max" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Height Progress */}
      <div className="bg-gray-800/80 p-3 rounded-xl border border-gray-700 min-h-[180px]">
        <h3 className="text-blue-400 text-xs font-bold mb-2 flex items-center gap-1">
          📏 Plant Height
        </h3>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="generation" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
            <YAxis stroke="#9CA3AF" domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563', color: '#F3F4F6', fontSize: 11 }}
            />
            <Line type="monotone" dataKey="meanHeight" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} name="Mean Height" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Resistance & Variance */}
      <div className="bg-gray-800/80 p-3 rounded-xl border border-gray-700 min-h-[180px]">
        <h3 className="text-yellow-400 text-xs font-bold mb-2 flex items-center gap-1">
          🛡️ Resistance & Variance
        </h3>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="generation" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
            <YAxis stroke="#9CA3AF" tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563', color: '#F3F4F6', fontSize: 11 }}
            />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Area type="monotone" dataKey="meanResistance" stroke="#eab308" fill="#eab308" fillOpacity={0.2} name="Resistance" />
            <Area type="monotone" dataKey="varYield" stroke="#f97316" fill="#f97316" fillOpacity={0.15} name="Variance" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Heterozygosity */}
      <div className="bg-gray-800/80 p-3 rounded-xl border border-gray-700 min-h-[140px]">
        <h3 className="text-purple-400 text-xs font-bold mb-2 flex items-center gap-1">
          🧬 Genetic Diversity (Heterozygosity)
        </h3>
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="generation" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
            <YAxis stroke="#9CA3AF" domain={[0, 1]} tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563', color: '#F3F4F6', fontSize: 11 }}
            />
            <Area type="monotone" dataKey="heterozygosity" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} name="Heterozygosity" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsPanel;
