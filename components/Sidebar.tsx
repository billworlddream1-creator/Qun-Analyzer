
import React from 'react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const items = [
    { id: 'dashboard' as ViewType, label: 'Control Center', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'analysis' as ViewType, label: 'Data Analysis', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'simulation' as ViewType, label: 'Quantum Sim', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'settings' as ViewType, label: 'Configuration', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  return (
    <div className="w-64 h-full glass border-r border-slate-800 flex flex-col transition-all duration-300">
      <div className="p-6">
        <h1 className="text-2xl font-orbitron font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
          Q-ANALYZE
        </h1>
        <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest">Version 2.0.4-β</p>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              currentView === item.id 
              ? 'bg-violet-600/20 text-violet-500 border border-violet-500/30 font-bold' 
              : 'text-slate-400 hover:bg-slate-800/20 hover:text-violet-400'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-500/20">
          <p className="text-xs text-violet-500 font-semibold mb-2">ENTROPY LEVEL</p>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-violet-500 h-full w-[42%] shadow-[0_0_8px_rgba(139,92,246,0.6)] animate-pulse"></div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">Active Qubits: 256/1024</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
