import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { PopulationStats } from '../types';

interface StatsPanelProps {
  history: PopulationStats[];
}

const StatsPanel: React.FC<StatsPanelProps> = ({ history }) => {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex-1 min-h-[200px]">
        <h3 className="text-gray-300 text-sm font-bold mb-2">Genetic Gain (Mean Yield)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="generation" stroke="#9CA3AF" tick={{fontSize: 10}} />
            <YAxis stroke="#9CA3AF" domain={['auto', 'auto']} tick={{fontSize: 10}} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563', color: '#F3F4F6' }}
              itemStyle={{ color: '#F3F4F6' }}
            />
            <Line type="monotone" dataKey="meanYield" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} name="Avg Yield" />
            <Line type="monotone" dataKey="maxYield" stroke="#34D399" strokeWidth={2} strokeDasharray="5 5" name="Max Yield" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex-1 min-h-[200px]">
        <h3 className="text-gray-300 text-sm font-bold mb-2">Genetic Variance</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="generation" stroke="#9CA3AF" tick={{fontSize: 10}} />
            <YAxis stroke="#9CA3AF" tick={{fontSize: 10}} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563', color: '#F3F4F6' }}
            />
            <Area type="monotone" dataKey="varYield" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.2} name="Variance" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsPanel;
