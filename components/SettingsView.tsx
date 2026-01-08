
import React, { useState } from 'react';

interface SettingsViewProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ theme, toggleTheme }) => {
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [quantumPrecision, setQuantumPrecision] = useState('high');

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <header>
        <h2 className="text-3xl font-orbitron font-bold text-slate-100">System Configuration</h2>
        <p className="text-slate-400">Manage interface preferences and quantum engine parameters</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance & Interface */}
        <div className="p-6 glass border border-slate-800 rounded-2xl bg-slate-900/40">
          <h3 className="text-xl font-orbitron font-bold text-slate-200 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            Interface
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <p className="text-sm font-medium text-slate-200">Theme Mode</p>
                <p className="text-xs text-slate-500">Current: <span className="uppercase text-violet-400">{theme}</span></p>
              </div>
              <button 
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${theme === 'light' ? 'bg-violet-600' : 'bg-slate-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${theme === 'light' ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-200">System Notifications</p>
                <p className="text-xs text-slate-500">Receive quantum event alerts</p>
              </div>
              <button 
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${notifications ? 'bg-emerald-500' : 'bg-slate-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Quantum Parameters */}
        <div className="p-6 glass border border-slate-800 rounded-2xl bg-slate-900/40">
          <h3 className="text-xl font-orbitron font-bold text-slate-200 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.618.309a6 6 0 01-3.86.517l-3.158-.632a2 2 0 01-1.223-2.011V7.822a2 2 0 011.223-2.011l3.158-.632a6 6 0 013.86.517l.618.309a6 6 0 003.86-.517l2.387-.477a2 2 0 001.022-.547V15.428z" />
            </svg>
            Core Parameters
          </h3>
          
          <div className="space-y-6">
             <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-slate-200">Simulation Fidelity</p>
                  <p className="text-xs text-cyan-400 font-mono">{quantumPrecision.toUpperCase()}</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['low', 'medium', 'high'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setQuantumPrecision(level)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                        quantumPrecision === level 
                        ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/50' 
                        : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
             </div>

             <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-sm font-medium text-slate-200">Auto-Collapse Waves</p>
                <p className="text-xs text-slate-500">Automatically resolve superposition states</p>
              </div>
              <button 
                onClick={() => setAutoSave(!autoSave)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${autoSave ? 'bg-cyan-600' : 'bg-slate-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${autoSave ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="md:col-span-2 p-6 glass border border-slate-800 rounded-2xl bg-slate-900/40">
           <h3 className="text-xl font-orbitron font-bold text-slate-200 mb-4">Data Governance</h3>
           <div className="flex items-center justify-between p-4 border border-rose-500/20 bg-rose-500/5 rounded-xl">
              <div>
                <p className="text-sm font-bold text-rose-300">Purge Local Cache</p>
                <p className="text-xs text-rose-400/70">Clear all temporary quantum states and analysis history.</p>
              </div>
              <button className="px-4 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-600/30 rounded-lg text-sm transition-colors">
                Purge Data
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
