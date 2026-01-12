import { Signal } from '@/types/signals';
import { cn } from '@/lib/utils';
import {
  Zap,
  Activity,
  Gauge,
  Thermometer,
  Droplets,
  Waves,
  Radio,
  AlertTriangle,
  Clock,
} from 'lucide-react';

interface SignalCardProps {
  signal: Signal;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  Activity,
  Gauge,
  Thermometer,
  Droplets,
  Waves,
  Radio,
};

function formatValue(value: number | null, unit: string): string {
  if (value === null) return '---';
  
  // Format based on unit type
  if (unit === 'W' && value >= 1000) {
    return (value / 1000).toFixed(2);
  }
  
  if (value >= 100) {
    return value.toFixed(0);
  }
  
  return value.toFixed(1);
}

function getDisplayUnit(unit: string, value: number | null): string {
  if (unit === 'W' && value !== null && value >= 1000) {
    return 'kW';
  }
  return unit;
}

function formatLastUpdate(date: Date | null): string {
  if (!date) return 'No data';
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  
  if (diffSec < 5) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function SignalCard({ signal }: SignalCardProps) {
  const { name, value, unit, lastUpdate, status, icon } = signal;
  
  const IconComponent = iconMap[icon] || Gauge;
  const displayValue = formatValue(value, unit);
  const displayUnit = getDisplayUnit(unit, value);
  
  const cardClass = cn('signal-card', {
    'signal-card-normal': status === 'normal',
    'signal-card-warning': status === 'warning',
    'signal-card-alarm': status === 'alarm',
    'signal-card-offline': status === 'offline',
  });
  
  const valueClass = cn('signal-value', {
    'signal-value-normal': status === 'normal',
    'signal-value-warning': status === 'warning',
    'signal-value-alarm': status === 'alarm',
    'signal-value-offline': status === 'offline',
  });

  return (
    <div className={cardClass}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-card-header border-b border-border/50">
        <div className="flex items-center gap-2">
          <IconComponent
            className={cn('w-4 h-4', {
              'text-status-normal': status === 'normal',
              'text-status-warning': status === 'warning',
              'text-status-alarm': status === 'alarm',
              'text-muted-foreground': status === 'offline',
            })}
          />
          <span className="text-sm font-medium text-foreground truncate">
            {name}
          </span>
        </div>
        
        {status === 'alarm' && (
          <AlertTriangle className="w-4 h-4 text-status-alarm animate-pulse" />
        )}
        {status === 'warning' && (
          <AlertTriangle className="w-4 h-4 text-status-warning" />
        )}
      </div>

      {/* Value */}
      <div className="px-4 py-6 flex flex-col items-center justify-center min-h-[120px]">
        {status === 'offline' && value === null ? (
          <div className="text-center">
            <span className="text-2xl font-mono text-muted-foreground">No Data</span>
          </div>
        ) : (
          <div className="text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span className={valueClass}>{displayValue}</span>
              <span className="text-lg font-medium text-muted-foreground ml-1">
                {displayUnit}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border/30 bg-card-header/50">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatLastUpdate(lastUpdate)}</span>
          </div>
          <div
            className={cn('px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide', {
              'bg-status-normal/20 text-status-normal': status === 'normal',
              'bg-status-warning/20 text-status-warning': status === 'warning',
              'bg-status-alarm/20 text-status-alarm': status === 'alarm',
              'bg-muted text-muted-foreground': status === 'offline',
            })}
          >
            {status}
          </div>
        </div>
      </div>
    </div>
  );
}
