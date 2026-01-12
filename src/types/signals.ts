export type SignalStatus = 'normal' | 'warning' | 'alarm' | 'offline';

export interface Signal {
  id: string;
  name: string;
  value: number | null;
  unit: string;
  lastUpdate: Date | null;
  status: SignalStatus;
  warningThreshold: number;
  alarmThreshold: number;
}

export interface SystemStatus {
  isConnected: boolean;
  lastHeartbeat: Date | null;
  signalsReceived: number;
}
