import { useSignals } from '@/hooks/useSignals';
import { StatusBar } from '@/components/StatusBar';
import { SignalCard } from '@/components/SignalCard';

export function Dashboard() {
  const { signals, systemStatus } = useSignals();

  // Group signals by category
  const motorSignals = signals.filter((s) =>
    ['motor_voltage', 'motor_current', 'motor_power', 'motor_temp', 'motor_vibration'].includes(s.id)
  );
  const gearboxSignals = signals.filter((s) =>
    ['gearbox_temp', 'gearbox_vibration'].includes(s.id)
  );

  return (
    <div className="min-h-screen bg-background">
      <StatusBar systemStatus={systemStatus} />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Motor Section */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
              Electric Motor
            </h2>
            <div className="h-px flex-1 bg-gradient-to-l from-primary/50 to-transparent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {motorSignals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </div>
        </section>

        {/* Gearbox Section */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
              Gearbox
            </h2>
            <div className="h-px flex-1 bg-gradient-to-l from-primary/50 to-transparent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 max-w-2xl mx-auto lg:max-w-none lg:mx-0">
            {gearboxSignals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </div>
        </section>

        {/* API Info */}
        <section className="mt-12 p-4 rounded-lg bg-card border border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <h3 className="text-sm font-semibold text-foreground">Node-RED Integration</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Send POST requests to update individual signals. Each signal can be updated independently.
          </p>
          <div className="font-mono text-xs bg-background/50 rounded p-3 overflow-x-auto">
            <code className="text-primary">POST /api/signal</code>
            <pre className="text-muted-foreground mt-2">{`{
  "signalId": "motor_voltage",
  "value": 405.5,
  "timestamp": "2024-01-15T10:30:00Z"  // optional
}`}</pre>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Valid signal IDs: <code className="text-primary">motor_voltage</code>, <code className="text-primary">motor_current</code>, <code className="text-primary">motor_power</code>, <code className="text-primary">motor_temp</code>, <code className="text-primary">gearbox_temp</code>, <code className="text-primary">motor_vibration</code>, <code className="text-primary">gearbox_vibration</code>
          </p>
        </section>

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-muted-foreground">
          <p>MotorGear Monitor • Industrial Monitoring Dashboard</p>
          <p className="mt-1">Designed for Raspberry Pi • Node-RED Integration</p>
        </footer>
      </main>
    </div>
  );
}
