
export interface DataPoint {
  timestamp: string;
  value: number;
  quantumState: number;
  complexity: number;
  category: string;
}

export interface Insight {
  id: string;
  type: 'TREND' | 'ANOMALY' | 'QUANTUM_SYNC' | 'RECOMMENDATION' | 'BUG_RISK' | 'PERFORMANCE' | 'FORECAST' | 'SENTIMENT';
  title: string;
  description: string;
  confidence: number;
}

export interface QuantumSimulationState {
  qubits: number;
  superposition: number;
  entanglement: number;
  noiseLevel: number;
}

export type ViewType = 'dashboard' | 'simulation' | 'analysis' | 'settings';

export type AnalysisMode = 'quantum' | 'code' | 'weather' | 'internet';
