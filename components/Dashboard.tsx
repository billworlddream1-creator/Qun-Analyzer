
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import QuantumVisualizer from './QuantumVisualizer';

const data = [
  { time: '00:00', intensity: 45, coherance: 24, loss: 12 },
  { time: '04:00', intensity: 52, coherance: 31, loss: 10 },
  { time: '08:00', intensity: 38, coherance: 45, loss: 15 },
  { time: '12:00', intensity: 65, coherance: 29, loss: 8 },
  { time: '16:00', intensity: 48, coherance: 55, loss: 11 },
  { time: '20:00', intensity: 59, coherance: 42, loss: 14 },
  { time: '23:59', intensity: 71, coherance: 38, loss: 9 },
];

const StatCard: React.FC<{ label: string; value: string; delta: string; trend: 'up' | 'down' }> = ({ label, value, delta, trend }) => (
  <div className="p-5 rounded-2xl glass border border-slate-800 hover:border-violet-500/30 transition-all">
    <p className="text-slate-400 text-sm font-medium">{label}</p>
    <div className="mt-2 flex items-baseline justify-between">
      <h4 className="text-2xl font-orbitron font-bold text-slate-100">{value}</h4>
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${trend === 'up' ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'}`}>
        {delta}
      </span>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-orbitron font-bold text-slate-100">Control Center</h2>
          <p className="text-slate-400">System overview and quantum core health metrics</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 glass border border-slate-700 text-sm rounded-lg hover:bg-slate-800 transition">
            Export Report
          </button>
          <button className="px-4 py-2 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-500 shadow-lg shadow-violet-900/20 transition">
            Launch Simulation
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Phase Coherence" value="98.2%" delta="+1.2%" trend="up" />
        <StatCard label="Entanglement Flux" value="1,420 ψ" delta="-4.1%" trend="down" />
        <StatCard label="Computation Rate" value="14.2 THz" delta="+8.5%" trend="up" />
        <StatCard label="Error Correction" value="99.998%" delta="Stable" trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 glass border border-slate-800 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-orbitron font-semibold text-slate-300">COHERENCE ANALYTICS</h3>
            <select className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-400">
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorInt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCoh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="intensity" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorInt)" />
                <Area type="monotone" dataKey="coherance" stroke="#06b6d4" fillOpacity={1} fill="url(#colorCoh)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-1 p-6 glass border border-slate-800 rounded-2xl flex flex-col">
          <h3 className="font-orbitron font-semibold text-slate-300 mb-6">SIGNAL LOSS</h3>
          <div className="h-[200px] mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} hide />
                <YAxis hide />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                />
                <Bar dataKey="loss" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Peak Interference</span>
              <span className="text-slate-300 font-mono">15.2 dBm</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Mean Recovery</span>
              <span className="text-slate-300 font-mono">42ms</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Ambient Noise</span>
              <span className="text-slate-300 font-mono">-104 dBm</span>
            </div>
          </div>
        </div>
      </div>

      <QuantumVisualizer />
    </div>
  );
};

export default Dashboard;
