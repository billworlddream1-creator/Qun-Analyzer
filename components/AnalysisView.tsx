
import React, { useState, useRef, useEffect } from 'react';
import { analyzeData } from '../services/geminiService';
import InsightVisualizer from './InsightVisualizer';
import { AnalysisMode } from '../types';

interface ErrorRange {
  start: number;
  end: number;
}

interface AnalysisRecord {
  id: number;
  timestamp: string;
  fileName: string | null;
  inputSnippet: string;
  mode: AnalysisMode;
  results: any;
}

const AnalysisView: React.FC = () => {
  const [dataInput, setDataInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [errorRanges, setErrorRanges] = useState<ErrorRange[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  
  // New State
  const [mode, setMode] = useState<AnalysisMode>('quantum');
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [viewMode, setViewMode] = useState<'analyze' | 'history'>('analyze');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('quantum_analysis_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  // Save history helper
  const saveToHistory = (newRecord: AnalysisRecord) => {
    const updatedHistory = [newRecord, ...history].slice(0, 50); // Keep last 50
    setHistory(updatedHistory);
    localStorage.setItem('quantum_analysis_history', JSON.stringify(updatedHistory));
  };

  const loadHistoryItem = (record: AnalysisRecord) => {
    setDataInput(JSON.stringify(record.results, null, 2)); 
    setResults(record.results);
    setFileName(record.fileName);
    setMode(record.mode);
    setViewMode('analyze');
  };

  const deleteHistoryItem = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('quantum_analysis_history', JSON.stringify(updated));
  };

  const validateData = (input: string, currentMode: AnalysisMode): { message: string | null; ranges: ErrorRange[] } => {
    const trimmed = input.trim();
    if (!trimmed) return { message: "Input is empty.", ranges: [] };

    // Skip strict structure validation for Code and Internet modes as they are often unstructured text
    if (currentMode === 'code' || currentMode === 'internet') {
      return { message: null, ranges: [] };
    }

    // 1. Attempt JSON Validation
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(input);
        if (typeof parsed !== 'object' || parsed === null) {
           return { message: "Valid JSON detected, but it must be an Object or Array.", ranges: [] };
        }
        return { message: null, ranges: [] }; 
      } catch (e: any) {
        let ranges: ErrorRange[] = [];
        const match = e.message.match(/at position (\d+)/);
        if (match) {
          const pos = parseInt(match[1], 10);
          ranges.push({ start: pos, end: pos + 1 }); 
        }
        return { message: `JSON Syntax Error: ${e.message}`, ranges };
      }
    }

    // 2. Attempt CSV Validation (Only for Quantum/Weather which are usually structured)
    const lines = input.split('\n');
    let currentPos = 0;
    const lineInfos = lines.map(line => {
      const info = { text: line, start: currentPos, length: line.length };
      currentPos += line.length + 1; 
      return info;
    });

    const dataLines = lineInfos.filter(l => l.text.trim() !== '');

    if (dataLines.length < 2) {
      // If it's not clearly JSON and only 1 line, and we are in strict mode
      return { message: "Format Error: Provide at least a header and data row for CSV, or valid JSON.", ranges: [] };
    }

    // Heuristic to detect delimiter
    const firstLine = dataLines[0].text;
    const delimiters = [',', ';', '\t', '|'];
    let bestDelimiter = ',';
    let maxCols = 0;

    delimiters.forEach(d => {
      const cols = firstLine.split(d).length;
      if (cols > maxCols) {
        maxCols = cols;
        bestDelimiter = d;
      }
    });

    if (maxCols < 2) {
      return { message: "CSV Error: Unable to detect a valid delimiter.", ranges: [] };
    }

    const inconsistentRows: number[] = [];
    const ranges: ErrorRange[] = [];

    for (let i = 1; i < dataLines.length; i++) {
      const lineObj = dataLines[i];
      const colCount = lineObj.text.split(bestDelimiter).length;
      if (colCount !== maxCols) {
        inconsistentRows.push(i + 1);
        ranges.push({ start: lineObj.start, end: lineObj.start + lineObj.length });
      }
    }

    if (inconsistentRows.length > 0) {
      const preview = inconsistentRows.slice(0, 5).join(', ');
      const suffix = inconsistentRows.length > 5 ? `...and ${inconsistentRows.length - 5} more` : '';
      return { 
        message: `CSV Structure Error: Rows ${preview}${suffix} do not match header column count (${maxCols}).`,
        ranges
      };
    }

    return { message: null, ranges: [] };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setDataInput(val);
    setFileName(null);
    if (validationMessage) {
      setValidationMessage(null);
      setErrorRanges([]);
    }
  };

  const handleScroll = () => {
    if (backdropRef.current && textareaRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    
    // Loosen extension restriction for Code/Internet
    const allowed = ['json', 'csv', 'txt', 'js', 'ts', 'py', 'html', 'css'];
    if (!allowed.includes(extension || '')) {
      setValidationMessage("Unsupported file type.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setDataInput(content);
      setFileName(file.name);
      
      const { message, ranges } = validateData(content, mode);
      setValidationMessage(message);
      setErrorRanges(ranges);
    };
    reader.onerror = () => setValidationMessage("Error reading file.");
    reader.readAsText(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleExportRaw = () => {
    if (!dataInput) return;
    const blob = new Blob([dataInput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analysis_raw_${mode}_${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAnalyze = async () => {
    const { message, ranges } = validateData(dataInput, mode);
    if (message) {
      setValidationMessage(message);
      setErrorRanges(ranges);
      return;
    }

    setValidationMessage(null);
    setErrorRanges([]);
    setLoading(true);
    setViewMode('analyze');

    try {
      const analysis = await analyzeData(dataInput, mode);
      setResults(analysis);
      
      const newRecord: AnalysisRecord = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        fileName: fileName,
        inputSnippet: dataInput.substring(0, 100) + (dataInput.length > 100 ? '...' : ''),
        mode: mode,
        results: analysis
      };
      saveToHistory(newRecord);

    } catch (err) {
      console.error(err);
      setValidationMessage("An error occurred during analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const exportResults = () => {
    if (!results) return;
    const dataStr = JSON.stringify(results, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${mode}_analysis_report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderHighlights = () => {
    if (!errorRanges.length) return dataInput;
    const sortedRanges = [...errorRanges].sort((a, b) => a.start - b.start);
    const elements = [];
    let lastIndex = 0;

    sortedRanges.forEach((range, i) => {
      if (range.start > lastIndex) {
        elements.push(<span key={`text-${i}`}>{dataInput.slice(lastIndex, range.start)}</span>);
      }
      elements.push(
        <mark key={`mark-${i}`} className="bg-rose-500/40 text-transparent rounded-sm animate-pulse">
          {dataInput.slice(range.start, range.end) || ' '}
        </mark>
      );
      lastIndex = range.end;
    });

    if (lastIndex < dataInput.length) {
      elements.push(<span key="text-end">{dataInput.slice(lastIndex)}</span>);
    }
    
    if (dataInput.endsWith('\n')) {
        elements.push(<br key="br-end" />);
    }

    return elements;
  };

  const getPlaceholder = () => {
    switch(mode) {
      case 'code': return `Paste source code here for review...\n\nExample:\nfunction calculateEntropy(data) {\n  // ... code ...\n}`;
      case 'weather': return `Paste weather JSON or CSV data...\n\nExample:\nTimestamp, Temp, Humidity\n2023-01-01, 22C, 45%`;
      case 'internet': return `Paste web content, articles, or logs...\n\nExample:\nUser reviews from social media feed...`;
      default: return `Paste quantum data here...\n\nExample JSON:\n[\n  {"id": 1, "value": 0.5, "status": "active"}\n]`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <header className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-orbitron font-bold text-slate-100">Analysis Engine</h2>
            <p className="text-slate-400">Select an analysis vector to begin data processing</p>
          </div>
          
          <div className="flex items-center space-x-3">
             <div className="flex bg-slate-800/50 rounded-lg p-1 border border-slate-700">
               <button onClick={() => setViewMode('analyze')} className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${viewMode === 'analyze' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}>ANALYZE</button>
               <button onClick={() => setViewMode('history')} className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${viewMode === 'history' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}>HISTORY</button>
             </div>
             <div className="h-6 w-px bg-slate-700 mx-1"></div>
             <button onClick={handleExportRaw} disabled={!dataInput} className="hidden md:flex items-center space-x-2 px-3 py-1.5 glass border border-slate-700 rounded-xl text-xs font-medium text-slate-300 hover:border-violet-500/50 transition-all disabled:opacity-50">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
               <span>Raw</span>
             </button>
             <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv,.json,.txt,.js,.ts,.py" className="hidden" />
             <button onClick={triggerFileUpload} className="flex items-center space-x-2 px-4 py-2 glass border border-slate-700 rounded-xl text-sm font-medium text-slate-300 hover:border-violet-500/50 hover:text-violet-400 transition-all">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
               <span>Ingest</span>
             </button>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-4 gap-2 p-1 bg-slate-900/40 border border-slate-800 rounded-xl">
          {(['quantum', 'code', 'weather', 'internet'] as AnalysisMode[]).map((m) => (
             <button
                key={m}
                onClick={() => setMode(m)}
                className={`py-2 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                  mode === m 
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                }`}
             >
               {m}
             </button>
          ))}
        </div>
      </header>

      {viewMode === 'history' ? (
        <div className="space-y-4 animate-slide-up">
          {history.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-slate-700 rounded-3xl text-slate-500">
               <p>No analysis history found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {history.map((record) => (
                <div key={record.id} onClick={() => loadHistoryItem(record)} className="group relative p-6 glass border border-slate-800 rounded-2xl hover:border-violet-500/50 transition-all cursor-pointer hover:bg-slate-800/30">
                   <div className="flex justify-between items-start">
                     <div>
                       <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            record.mode === 'code' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                            record.mode === 'weather' ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' :
                            record.mode === 'internet' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
                            'text-violet-400 border-violet-500/30 bg-violet-500/10'
                          }`}>
                            {record.mode}
                          </span>
                          <span className="text-xs text-slate-500">{new Date(record.timestamp).toLocaleDateString()}</span>
                       </div>
                       <h3 className="text-lg font-bold text-slate-200 group-hover:text-white">{record.fileName || `${record.mode.charAt(0).toUpperCase() + record.mode.slice(1)} Input`}</h3>
                       <p className="text-sm text-slate-400 mt-2 line-clamp-2 pr-8">{record.results.summary}</p>
                     </div>
                     <button onClick={(e) => deleteHistoryItem(e, record.id)} className="p-2 text-slate-600 hover:text-rose-500 z-10"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Analyze View */
        <>
          <div className="space-y-4">
            <div className={`relative w-full h-[500px] group rounded-2xl border transition-all ${
                validationMessage 
                    ? 'border-rose-500/50 ring-1 ring-rose-500/30' 
                    : 'border-slate-700 focus-within:ring-2 focus-within:ring-violet-500/50'
            } glass overflow-hidden`}>
              
              <div ref={backdropRef} className="absolute inset-0 p-6 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words text-transparent bg-transparent overflow-hidden pointer-events-none select-none z-0">
                {renderHighlights()}
              </div>

              <textarea
                ref={textareaRef}
                className="absolute inset-0 w-full h-full bg-transparent border-none p-6 text-slate-200 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words resize-none focus:outline-none focus:ring-0 z-10"
                placeholder={getPlaceholder()}
                value={dataInput}
                onChange={handleInputChange}
                onScroll={handleScroll}
                spellCheck={false}
              />
              
              {fileName && (
                <div className="absolute top-4 right-4 z-20 flex items-center space-x-2 bg-violet-600/20 text-violet-400 px-3 py-1 rounded-full border border-violet-500/30 text-[10px] font-bold tracking-widest animate-pulse pointer-events-none">
                  <span>{fileName.toUpperCase()}</span>
                </div>
              )}

              {validationMessage && (
                <div className="absolute bottom-4 left-4 right-4 z-20 bg-rose-950/90 backdrop-blur-md border border-rose-500/30 text-rose-300 px-4 py-3 rounded-xl flex items-start space-x-3 shadow-xl animate-bounce-short">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-xs font-medium">{validationMessage}</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                onClick={handleAnalyze}
                disabled={loading || !dataInput.trim()}
                className={`px-8 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all ${
                  loading 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:scale-[1.02] shadow-xl shadow-violet-900/30 active:scale-[0.98]'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-500 border-t-violet-400 rounded-full animate-spin"></div>
                    <span>PROCESSING {mode.toUpperCase()} DATA...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.618.309a6 6 0 01-3.86.517l-3.158-.632a2 2 0 01-1.223-2.011V7.822a2 2 0 011.223-2.011l3.158-.632a6 6 0 013.86.517l.618.309a6 6 0 003.86-.517l2.387-.477a2 2 0 001.022-.547V15.428z" /></svg>
                    <span>ANALYZE</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {results && (
            <div className="space-y-6 animate-slide-up">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 glass border border-violet-500/30 rounded-2xl bg-violet-900/10 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-orbitron font-bold text-violet-300 flex items-center">
                      <span className="w-2 h-2 bg-violet-400 rounded-full mr-3 animate-pulse"></span>
                      Analysis Report
                    </h3>
                    <button onClick={exportResults} className="flex items-center space-x-2 px-3 py-1.5 glass border border-violet-500/20 rounded-lg text-xs font-bold text-violet-400 hover:bg-violet-600/10 hover:border-violet-500/50 transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      <span>EXPORT</span>
                    </button>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line">{results.summary}</p>
                  
                  <div className="mt-6 pt-4 border-t border-violet-500/20">
                     <h4 className="text-sm font-bold text-violet-300 mb-2">Key Recommendations</h4>
                     <ul className="space-y-2">
                        {results.recommendations.map((rec: string, i: number) => (
                          <li key={i} className="flex items-start space-x-2 text-slate-400 text-xs">
                            <span className="text-violet-500 mt-0.5">►</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                     </ul>
                  </div>
                </div>

                <div className="lg:col-span-1">
                   <InsightVisualizer insights={results.insights} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {results.insights.map((insight: any, i: number) => (
                  <div key={i} className="group p-4 glass border border-slate-800 rounded-2xl hover:border-violet-500/40 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] font-bold tracking-widest text-violet-400 uppercase px-1.5 py-0.5 rounded border border-violet-400/20">
                        {insight.type}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {Math.round(insight.confidence * 100)}%
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-200 text-sm mb-1 truncate" title={insight.title}>{insight.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AnalysisView;
