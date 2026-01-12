import { useState, useCallback, useEffect } from 'react';
import { Signal, SignalStatus, SignalUpdate, SystemStatus } from '@/types/signals';
import { initialSignals, SIGNAL_TIMEOUT_MS, HEARTBEAT_INTERVAL_MS } from '@/config/signalConfig';
import { useWebSocket } from './useWebSocket';

function calculateStatus(value: number, thresholds: Signal['thresholds']): SignalStatus {
  const { warning, alarm, direction } = thresholds;
  
  if (direction === 'above') {
    if (value >= alarm) return 'alarm';
    if (value >= warning) return 'warning';
    return 'normal';
  } else {
    if (value <= alarm) return 'alarm';
    if (value <= warning) return 'warning';
    return 'normal';
  }
}

// Get WebSocket URL from current location or use default
function getWebSocketUrl(): string {
  // Check for custom WebSocket URL in localStorage (for configuration)
  const customUrl = localStorage.getItem('wsUrl');
  if (customUrl) {
    return customUrl;
  }
  
  // Default: Connect to Node-RED WebSocket on same host
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.hostname;
  
  // Node-RED typically runs on port 1880, WebSocket endpoint at /ws/signals
  return `${protocol}//${host}:1880/ws/signals`;
}

export function useSignals() {
  const [signals, setSignals] = useState<Signal[]>(initialSignals);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    isConnected: false,
    lastHeartbeat: null,
    signalsReceived: 0,
  });
  const [demoMode, setDemoMode] = useState(false);

  // Update a single signal
  const updateSignal = useCallback((update: SignalUpdate) => {
    const now = new Date();
    
    setSignals((prev) =>
      prev.map((signal) => {
        if (signal.id === update.signalId) {
          const status = calculateStatus(update.value, signal.thresholds);
          return {
            ...signal,
            value: update.value,
            lastUpdate: update.timestamp ? new Date(update.timestamp) : now,
            status,
          };
        }
        return signal;
      })
    );

    setSystemStatus((prev) => ({
      ...prev,
      isConnected: true,
      lastHeartbeat: now,
      signalsReceived: prev.signalsReceived + 1,
    }));
  }, []);

  // WebSocket connection
  const wsUrl = getWebSocketUrl();
  const { isConnected, reconnect } = useWebSocket({
    url: wsUrl,
    onSignalUpdate: updateSignal,
    reconnectInterval: 5000,
  });

  // Update connection status from WebSocket
  useEffect(() => {
    setSystemStatus((prev) => ({
      ...prev,
      isConnected: isConnected || demoMode,
    }));
  }, [isConnected, demoMode]);

  // Check for stale signals and mark them offline
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      
      setSignals((prev) =>
        prev.map((signal) => {
          if (signal.lastUpdate) {
            const age = now.getTime() - signal.lastUpdate.getTime();
            if (age > SIGNAL_TIMEOUT_MS && signal.status !== 'offline') {
              return { ...signal, status: 'offline' };
            }
          }
          return signal;
        })
      );

      // Check system connection status
      setSystemStatus((prev) => {
        if (prev.lastHeartbeat && !demoMode) {
          const age = now.getTime() - prev.lastHeartbeat.getTime();
          if (age > HEARTBEAT_INTERVAL_MS * 2) {
            return { ...prev, isConnected: false };
          }
        }
        return prev;
      });
    }, HEARTBEAT_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [demoMode]);

  // Demo mode: Simulate data when WebSocket is not connected
  useEffect(() => {
    if (!demoMode) return;

    const demoInterval = setInterval(() => {
      const signalIds = [
        'motor_voltage',
        'motor_current',
        'motor_power',
        'motor_temp',
        'gearbox_temp',
        'motor_vibration',
        'gearbox_vibration',
      ];

      // Randomly update 1-3 signals
      const numUpdates = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numUpdates; i++) {
        const randomIndex = Math.floor(Math.random() * signalIds.length);
        const signalId = signalIds[randomIndex];

        let value: number;
        switch (signalId) {
          case 'motor_voltage':
            value = 380 + Math.random() * 50;
            break;
          case 'motor_current':
            value = 8 + Math.random() * 10;
            break;
          case 'motor_power':
            value = 3000 + Math.random() * 3000;
            break;
          case 'motor_temp':
            value = 45 + Math.random() * 40;
            break;
          case 'gearbox_temp':
            value = 40 + Math.random() * 35;
            break;
          case 'motor_vibration':
            value = 1 + Math.random() * 6;
            break;
          case 'gearbox_vibration':
            value = 1 + Math.random() * 6;
            break;
          default:
            value = Math.random() * 100;
        }

        updateSignal({ signalId, value: Math.round(value * 10) / 10 });
      }
    }, 2000);

    return () => clearInterval(demoInterval);
  }, [demoMode, updateSignal]);

  // Enable demo mode automatically after 10 seconds if not connected
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isConnected && !demoMode) {
        console.log('[Demo] No WebSocket connection, enabling demo mode');
        setDemoMode(true);
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [isConnected, demoMode]);

  const toggleDemoMode = useCallback(() => {
    setDemoMode((prev) => !prev);
  }, []);

  return {
    signals,
    systemStatus,
    updateSignal,
    demoMode,
    toggleDemoMode,
    reconnect,
    wsUrl,
  };
}
