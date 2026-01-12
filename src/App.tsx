import { useState, useEffect, useCallback } from 'react';
import { Signal, SignalStatus, SystemStatus } from './types/signals';
import { initialSignals, SIGNAL_TIMEOUT_MS } from './config';

function getStatus(value: number, warning: number, alarm: number): SignalStatus {
  if (value >= alarm) return 'alarm';
  if (value >= warning) return 'warning';
  return 'normal';
}

function getWsUrl(): string {
  const custom = localStorage.getItem('wsUrl');
  if (custom) return custom;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.hostname}:1880/ws/signals`;
}

export default function App() {
  const [signals, setSignals] = useState<Signal[]>(initialSignals);
  const [status, setStatus] = useState<SystemStatus>({ isConnected: false, lastHeartbeat: null, signalsReceived: 0 });
  const [demoMode, setDemoMode] = useState(false);
  const wsUrl = getWsUrl();

  const updateSignal = useCallback((id: string, value: number) => {
    const now = new Date();
    setSignals(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, value, lastUpdate: now, status: getStatus(value, s.warningThreshold, s.alarmThreshold) };
      }
      return s;
    }));
    setStatus(prev => ({ ...prev, isConnected: true, lastHeartbeat: now, signalsReceived: prev.signalsReceived + 1 }));
  }, []);

  // WebSocket connection
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);
        ws.onopen = () => setStatus(prev => ({ ...prev, isConnected: true }));
        ws.onclose = () => {
          setStatus(prev => ({ ...prev, isConnected: demoMode }));
          reconnectTimer = setTimeout(connect, 5000);
        };
        ws.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.signalId && data.value !== undefined) {
              updateSignal(data.signalId, data.value);
            }
          } catch {}
        };
      } catch {}
    };

    connect();
    return () => { ws?.close(); clearTimeout(reconnectTimer); };
  }, [wsUrl, updateSignal, demoMode]);

  // Demo mode
  useEffect(() => {
    if (!demoMode) return;
    const interval = setInterval(() => {
      const ids = ['motor_voltage', 'motor_current', 'motor_power', 'motor_temp', 'gearbox_temp', 'motor_vibration', 'gearbox_vibration'];
      const values: Record<string, () => number> = {
        motor_voltage: () => 380 + Math.random() * 50,
        motor_current: () => 8 + Math.random() * 10,
        motor_power: () => 3000 + Math.random() * 3000,
        motor_temp: () => 45 + Math.random() * 40,
        gearbox_temp: () => 40 + Math.random() * 35,
        motor_vibration: () => 1 + Math.random() * 6,
        gearbox_vibration: () => 1 + Math.random() * 6,
      };
      const id = ids[Math.floor(Math.random() * ids.length)];
      updateSignal(id, Math.round(values[id]() * 10) / 10);
    }, 1500);
    return () => clearInterval(interval);
  }, [demoMode, updateSignal]);

  // Auto-enable demo after 10s if not connected
  useEffect(() => {
    const t = setTimeout(() => { if (!status.isConnected) setDemoMode(true); }, 10000);
    return () => clearTimeout(t);
  }, [status.isConnected]);

  // Stale signal check
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setSignals(prev => prev.map(s => {
        if (s.lastUpdate && now - s.lastUpdate.getTime() > SIGNAL_TIMEOUT_MS && s.status !== 'offline') {
          return { ...s, status: 'offline' };
        }
        return s;
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (d: Date | null) => d ? d.toLocaleTimeString('en-US', { hour12: false }) : '--:--:--';
  const formatValue = (v: number | null, unit: string) => {
    if (v === null) return '---';
    if (unit === 'W' && v >= 1000) return (v / 1000).toFixed(2);
    return v >= 100 ? v.toFixed(0) : v.toFixed(1);
  };
  const getUnit = (unit: string, v: number | null) => (unit === 'W' && v !== null && v >= 1000) ? 'kW' : unit;

  const motorSignals = signals.filter(s => s.id.startsWith('motor'));
  const gearboxSignals = signals.filter(s => s.id.startsWith('gearbox'));

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold">MotorGear Monitor</h1>
              <p className="text-xs text-slate-400">{demoMode ? 'Demo Mode' : 'Industrial Dashboard'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setDemoMode(!demoMode)}
              className={`px-3 py-1.5 rounded text-xs font-medium ${demoMode ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
              Demo
            </button>

            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${status.isConnected ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-slate-500'}`} />
              <span className={`text-sm ${status.isConnected ? 'text-emerald-400' : 'text-slate-500'}`}>
                {status.isConnected ? 'Connected' : 'Offline'}
              </span>
            </div>

            <div className="text-slate-400 text-sm font-mono">{formatTime(status.lastHeartbeat)}</div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-1">
          <p className="text-xs text-slate-500 font-mono">WS: {wsUrl}</p>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto p-4">
        {/* Motor Section */}
        <section className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/50 to-transparent" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Electric Motor</h2>
            <div className="h-px flex-1 bg-gradient-to-l from-cyan-500/50 to-transparent" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {motorSignals.map(s => <SignalCard key={s.id} signal={s} formatValue={formatValue} getUnit={getUnit} />)}
          </div>
        </section>

        {/* Gearbox Section */}
        <section className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/50 to-transparent" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Gearbox</h2>
            <div className="h-px flex-1 bg-gradient-to-l from-cyan-500/50 to-transparent" />
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            {gearboxSignals.map(s => <SignalCard key={s.id} signal={s} formatValue={formatValue} getUnit={getUnit} />)}
          </div>
        </section>

        {/* Info */}
        <section className="bg-slate-800 rounded-lg border border-slate-700 p-4 text-sm">
          <h3 className="font-semibold text-cyan-400 mb-2">Node-RED WebSocket</h3>
          <p className="text-slate-400 text-xs mb-2">Send JSON: <code className="text-cyan-300">{`{"signalId": "motor_voltage", "value": 405.5}`}</code></p>
          <p className="text-slate-500 text-xs">IDs: motor_voltage, motor_current, motor_power, motor_temp, gearbox_temp, motor_vibration, gearbox_vibration</p>
        </section>
      </main>
    </div>
  );
}

function SignalCard({ signal, formatValue, getUnit }: { signal: Signal; formatValue: (v: number | null, u: string) => string; getUnit: (u: string, v: number | null) => string }) {
  const { name, value, unit, lastUpdate, status } = signal;
  
  const borderColor = {
    normal: 'border-emerald-500/50',
    warning: 'border-amber-500/60',
    alarm: 'border-red-500/70',
    offline: 'border-slate-600',
  }[status];

  const valueColor = {
    normal: 'text-emerald-400',
    warning: 'text-amber-400',
    alarm: 'text-red-400',
    offline: 'text-slate-500',
  }[status];

  const glow = {
    normal: 'shadow-emerald-500/20',
    warning: 'shadow-amber-500/20',
    alarm: 'shadow-red-500/30',
    offline: '',
  }[status];

  const ago = lastUpdate ? `${Math.floor((Date.now() - lastUpdate.getTime()) / 1000)}s ago` : 'No data';

  return (
    <div className={`bg-slate-800 rounded-lg border ${borderColor} ${glow} shadow-lg overflow-hidden`}>
      <div className="bg-slate-750 px-3 py-2 border-b border-slate-700/50">
        <span className="text-xs font-medium text-slate-300">{name}</span>
      </div>
      <div className="px-3 py-4 text-center">
        {value === null ? (
          <span className="text-xl font-mono text-slate-500">No Data</span>
        ) : (
          <div>
            <span className={`text-3xl font-mono font-bold ${valueColor}`}>{formatValue(value, unit)}</span>
            <span className="text-sm text-slate-400 ml-1">{getUnit(unit, value)}</span>
          </div>
        )}
      </div>
      <div className="px-3 py-1.5 border-t border-slate-700/50 flex justify-between items-center">
        <span className="text-xs text-slate-500">{ago}</span>
        <span className={`text-xs font-medium uppercase px-1.5 py-0.5 rounded ${
          status === 'normal' ? 'bg-emerald-500/20 text-emerald-400' :
          status === 'warning' ? 'bg-amber-500/20 text-amber-400' :
          status === 'alarm' ? 'bg-red-500/20 text-red-400' :
          'bg-slate-700 text-slate-500'
        }`}>{status}</span>
      </div>
    </div>
  );
}
