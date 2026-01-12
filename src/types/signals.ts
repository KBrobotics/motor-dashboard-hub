export type SignalStatus = 'normal' | 'warning' | 'alarm' | 'offline';

export interface SignalThresholds {
  warning: number;
  alarm: number;
  direction: 'above' | 'below'; // 'above' means warning/alarm when value exceeds threshold
}

export interface Signal {
  id: string;
  name: string;
  value: number | null;
  unit: string;
  lastUpdate: Date | null;
  status: SignalStatus;
  thresholds: SignalThresholds;
  icon: string;
}

export interface SignalUpdate {
  signalId: string;
  value: number;
  timestamp?: string;
}

export interface SystemStatus {
  isConnected: boolean;
  lastHeartbeat: Date | null;
  signalsReceived: number;
}
