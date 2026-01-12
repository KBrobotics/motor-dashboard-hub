import { Signal } from './types/signals';

export const initialSignals: Signal[] = [
  { id: 'motor_voltage', name: 'Motor Voltage', value: null, unit: 'V', lastUpdate: null, status: 'offline', warningThreshold: 420, alarmThreshold: 450 },
  { id: 'motor_current', name: 'Motor Current', value: null, unit: 'A', lastUpdate: null, status: 'offline', warningThreshold: 15, alarmThreshold: 20 },
  { id: 'motor_power', name: 'Motor Power', value: null, unit: 'W', lastUpdate: null, status: 'offline', warningThreshold: 5000, alarmThreshold: 6000 },
  { id: 'motor_temp', name: 'Motor Winding Temp', value: null, unit: '°C', lastUpdate: null, status: 'offline', warningThreshold: 75, alarmThreshold: 90 },
  { id: 'gearbox_temp', name: 'Gearbox Oil Temp', value: null, unit: '°C', lastUpdate: null, status: 'offline', warningThreshold: 70, alarmThreshold: 85 },
  { id: 'motor_vibration', name: 'Motor Vibration', value: null, unit: 'mm/s', lastUpdate: null, status: 'offline', warningThreshold: 4.5, alarmThreshold: 7.1 },
  { id: 'gearbox_vibration', name: 'Gearbox Vibration', value: null, unit: 'mm/s', lastUpdate: null, status: 'offline', warningThreshold: 4.5, alarmThreshold: 7.1 },
];

export const SIGNAL_TIMEOUT_MS = 30000;
