
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import AnalysisView from './components/AnalysisView';
import SettingsView from './components/SettingsView';
import { ViewType } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const body = document.body;
    if (theme === 'light') {
      body.classList.add('light-theme');
    } else {
      body.classList.remove('light-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'analysis':
        return <AnalysisView />;
      case 'settings':
        return <SettingsView theme={theme} toggleTheme={toggleTheme} />;
      case 'simulation':
        return (
          <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center space-y-4">
            <div className="p-8 glass border border-slate-800 rounded-full animate-pulse">
              <svg className="w-16 h-16 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2 1m0 0l-2-1m2 1v2.5M4 7l2-1M4 7l2 1M4 7v2.5M10 21l2-1m0 0l2 1m-2-1v-2.5M4 17l2-1M4 17l2 1M4 17v2.5M14 17l2-1m0 0l2 1m-2-1v-2.5" />
              </svg>
            </div>
            <h2 className="text-2xl font-orbitron font-bold text-slate-100">Simulation Environment Locked</h2>
            <p className="text-slate-500 max-w-md">The Quantum Simulation Sandbox is currently undergoing calibration. Please check back after the next wave collapse.</p>
            <button 
              onClick={() => setCurrentView('dashboard')}
              className="mt-4 px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-white transition"
            >
              Back to Safety
            </button>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'analysis', label: 'Analysis' },
    { id: 'simulation', label: 'Simulation' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className={`min-h-screen w-full flex flex-col quantum-gradient transition-colors duration-500 font-sans text-slate-100`}>
      {/* Top Navigation Bar */}
      <header className="glass border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 py-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.618.309a6 6 0 01-3.86.517l-3.158-.632a2 2 0 01-1.223-2.011V7.822a2 2 0 011.223-2.011l3.158-.632a6 6 0 013.86.517l.618.309a6 6 0 003.86-.517l2.387-.477a2 2 0 001.022-.547V15.428z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-orbitron font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                  Q-ANALYZE
                </h1>
                <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase hidden sm:block">Quantum Data Engine</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center bg-slate-900/50 p-1 rounded-xl border border-slate-800/50">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as ViewType)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    currentView === item.id 
                    ? 'bg-violet-600/90 text-white shadow-lg shadow-violet-900/50' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:border-violet-500/50 transition-all group"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-violet-600 group-hover:-rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto relative">
        {/* Background decorative blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto p-4 sm:p-8">
          {renderView()}
        </div>
      </main>

      {/* Global Toast / Overlay for "Quantum Events" */}
      <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
        <div className="glass px-4 py-3 rounded-xl border border-emerald-500/30 shadow-2xl flex items-center space-x-3 animate-slide-up">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
          <span className="text-xs font-mono text-emerald-300">CORE_STABILITY: 0.99984 - OPTIMAL</span>
        </div>
      </div>
    </div>
  );
};

export default App;
