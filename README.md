# MotorGear Monitor

A lightweight industrial monitoring dashboard for electric motor and gearbox systems, designed to run locally on Raspberry Pi alongside Node-RED.

## Features

- **Real-time Signal Monitoring**: Track 7 key signals for motor and gearbox health
- **Threshold-based Alerts**: Visual status indicators (normal/warning/alarm)
- **Fault Tolerant**: Gracefully handles missing or delayed signals
- **Node-RED Integration**: Simple REST API for independent signal updates
- **Raspberry Pi Optimized**: Lightweight, low-resource footprint
- **24/7 Operation**: Designed for continuous industrial use

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

## Quick Start (Raspberry Pi)

### Prerequisites

- Raspberry Pi 4 (2GB+ RAM recommended)
- Docker and Docker Compose installed
- Node-RED running (for data input)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/motorgear-monitor.git
   cd motorgear-monitor
   ```

2. **Deploy with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Access the dashboard**
   Open `http://raspberry-pi-ip:8082` in your browser

### Using Portainer

1. In Portainer, go to **Stacks** → **Add Stack**
2. Name: `motorgear-monitor`
3. Build method: **Repository**
4. Repository URL: `https://github.com/yourusername/motorgear-monitor`
5. Click **Deploy the stack**

## Node-RED Integration

### Sending Signal Updates

Each signal can be updated independently via HTTP POST requests. This allows Node-RED to update individual readings as they become available.

**Endpoint:** `POST http://localhost:8082/api/signal`

**Payload:**
```json
{
  "signalId": "motor_voltage",
  "value": 405.5,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Valid Signal IDs

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
    "id": "inject_voltage",
    "type": "inject",
    "payload": "{\"signalId\":\"motor_voltage\",\"value\":400}",
    "payloadType": "json",
    "repeat": "5",
    "wires": [["http_request"]]
  },
  {
    "id": "http_request",
    "type": "http request",
    "method": "POST",
    "url": "http://localhost:8082/api/signal",
    "headers": {"Content-Type": "application/json"},
    "wires": [[]]
  }
]
```

## Configuration

### Threshold Customization

Edit `src/config/signalConfig.ts` to modify:
- Warning and alarm thresholds
- Signal names and units
- Timeout durations

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SIGNAL_TIMEOUT_MS` | 30000 | Time before signal shows as offline |
| `HEARTBEAT_INTERVAL_MS` | 5000 | Connection check interval |

## Architecture

```
┌─────────────────┐     HTTP POST     ┌──────────────────┐
│    Node-RED     │ ────────────────► │  MotorGear       │
│  (Data Source)  │                   │  Monitor         │
└─────────────────┘                   │  (Dashboard)     │
                                      └──────────────────┘
         Both running on Raspberry Pi
              Port 1880 (Node-RED)
              Port 8082 (Dashboard)
```

## Development

### Local Development
```bash
npm install
npm run dev
```

### Build for Production
```bash
npm run build
```

## Troubleshooting

### Dashboard shows "No Data"
- Verify Node-RED is sending data to the correct endpoint
- Check that signal IDs match exactly
- Ensure the dashboard container can reach the API

### High CPU Usage
- Reduce the update frequency in Node-RED
- Check for any infinite loops in your flows

### Container Won't Start
```bash
# Check container logs
docker logs motorgear-monitor

# Verify port availability
netstat -tlnp | grep 8082
```

## Technologies

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Docker + nginx

## License

MIT License

---

Built for industrial automation 🏭
