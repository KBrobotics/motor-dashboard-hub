import { SystemStatus } from '@/types/signals';
import { Cpu, Wifi, WifiOff, Clock, PlayCircle, RefreshCw } from 'lucide-react';

interface StatusBarProps {
  systemStatus: SystemStatus;
  demoMode: boolean;
  onToggleDemo: () => void;
  onReconnect: () => void;
  wsUrl: string;
}

function formatTimestamp(date: Date | null): string {
  if (!date) return '--:--:--';
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function StatusBar({ systemStatus, demoMode, onToggleDemo, onReconnect, wsUrl }: StatusBarProps) {
  const { isConnected, lastHeartbeat, signalsReceived } = systemStatus;

  return (
    <header className="header-bar sticky top-0 z-50 px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/30">
            <Cpu className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              MotorGear Monitor
            </h1>
            <p className="text-xs text-muted-foreground">
              {demoMode ? 'Demo Mode' : 'Industrial Dashboard'}
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Demo Mode Toggle */}
          <button
            onClick={onToggleDemo}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${
              demoMode 
                ? 'bg-status-warning/20 text-status-warning' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Demo</span>
          </button>

          {/* Reconnect Button */}
          {!isConnected && !demoMode && (
            <button
              onClick={onReconnect}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reconnect</span>
            </button>
          )}

          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <div className="status-dot status-dot-online" />
                <Wifi className="w-4 h-4 text-status-normal" />
                <span className="text-sm font-medium text-status-normal hidden sm:inline">
                  {demoMode ? 'Demo' : 'Connected'}
                </span>
              </>
            ) : (
              <>
                <div className="status-dot status-dot-offline" />
                <WifiOff className="w-4 h-4 text-status-offline" />
                <span className="text-sm font-medium text-status-offline hidden sm:inline">
                  Disconnected
                </span>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-border hidden sm:block" />

          {/* Last Update */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-mono">
              {formatTimestamp(lastHeartbeat)}
            </span>
          </div>

          {/* Signal Counter */}
          <div className="hidden md:flex items-center gap-2 text-muted-foreground">
            <span className="text-xs uppercase tracking-wide">Signals</span>
            <span className="font-mono text-sm text-primary">
              {signalsReceived.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      
      {/* WebSocket URL indicator (small) */}
      <div className="max-w-7xl mx-auto mt-2">
        <p className="text-xs text-muted-foreground/60 font-mono truncate">
          WS: {wsUrl}
        </p>
      </div>
    </header>
  );
}
