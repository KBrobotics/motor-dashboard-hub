# MotorGear Monitor

A lightweight industrial monitoring dashboard for electric motor and gearbox systems, designed to run locally on Raspberry Pi alongside Node-RED.

## Features

- **Real-time Signal Monitoring**: Track 7 key signals via WebSocket
- **Threshold-based Alerts**: Visual status indicators (normal/warning/alarm)
- **Fault Tolerant**: Gracefully handles missing or delayed signals
- **Node-RED WebSocket Integration**: Direct browser-to-Node-RED communication
- **Raspberry Pi Optimized**: Lightweight, low-resource footprint
- **24/7 Operation**: Designed for continuous industrial use
- **Demo Mode**: Auto-enables when no WebSocket connection is available

## Monitored Signals

| Signal | Unit | Warning | Alarm |
|--------|------|---------|-------|
| Motor Voltage | V | 420 | 450 |
| Motor Current | A | 15 | 20 |
| Motor Power | W | 5000 | 6000 |
| Motor Winding Temp | °C | 75 | 90 |
| Gearbox Oil Temp | °C | 70 | 85 |
| Motor Vibration | mm/s | 4.5 | 7.1 |
| Gearbox Vibration | mm/s | 4.5 | 7.1 |

## Quick Start

### Option 1: Use Lovable's Published URL

1. Click **Publish** in Lovable to deploy the dashboard
2. Access the published URL from any device on your network
3. Configure the WebSocket URL (see below)

### Option 2: Local Deployment on Raspberry Pi

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/motorgear-monitor.git
   cd motorgear-monitor
   ```

2. **Install and build**
   ```bash
   npm install
   npm run build
   ```

3. **Serve the `dist` folder** using nginx, Apache, or a simple HTTP server:
   ```bash
   npx serve dist -l 8082
   ```

4. **Access the dashboard** at `http://raspberry-pi-ip:8082`

## Node-RED WebSocket Setup

### 1. Add WebSocket Nodes to Node-RED

In Node-RED, add a **websocket out** node:
- Type: `Listen on`
- Path: `/ws/signals`

### 2. Send Signal Data

Connect your sensor data to a **function** node that formats the message:

```javascript
// Format signal for dashboard
msg.payload = {
    signalId: "motor_voltage",  // Signal ID
    value: msg.payload,          // Numeric value
    timestamp: new Date().toISOString()  // Optional
};
return msg;
```

### 3. Valid Signal IDs

- `motor_voltage` - Motor voltage in Volts
- `motor_current` - Motor current in Amperes
- `motor_power` - Motor power in Watts
- `motor_temp` - Motor winding temperature in °C
- `gearbox_temp` - Gearbox oil temperature in °C
- `motor_vibration` - Motor vibration in mm/s
- `gearbox_vibration` - Gearbox vibration in mm/s

### Example Node-RED Flow

```json
[
    {
        "id": "inject1",
        "type": "inject",
        "repeat": "5",
        "payload": "400",
        "payloadType": "num",
        "wires": [["func1"]]
    },
    {
        "id": "func1",
        "type": "function",
        "func": "msg.payload = {signalId: 'motor_voltage', value: parseFloat(msg.payload)}; return msg;",
        "wires": [["ws1"]]
    },
    {
        "id": "ws1",
        "type": "websocket out",
        "path": "/ws/signals",
        "wholemsg": "true"
    }
]
```

## Custom WebSocket URL

By default, the dashboard connects to:
```
ws://<current-hostname>:1880/ws/signals
```

To use a custom URL, open browser DevTools console and run:
```javascript
localStorage.setItem('wsUrl', 'ws://192.168.1.100:1880/ws/signals');
location.reload();
```

## Architecture

```
┌─────────────────┐     WebSocket      ┌──────────────────┐
│    Node-RED     │ ◄───────────────►  │    Browser       │
│  (Port 1880)    │                    │  (Dashboard)     │
└─────────────────┘                    └──────────────────┘
         │                                      │
         └──────────────────────────────────────┘
              Both on local network / same Pi
```

## Demo Mode

The dashboard automatically enables **Demo Mode** after 10 seconds if no WebSocket connection is established. This shows simulated data for testing.

Toggle Demo Mode manually using the button in the header.

## Development

```bash
npm install
npm run dev
```

## Technologies

- React + TypeScript + Vite
- Tailwind CSS
- WebSocket for real-time communication

## License

MIT License

---

Built for industrial automation 🏭
