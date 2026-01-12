# MotorGear Monitor

Industrial monitoring dashboard for electric motor and gearbox systems.

## Deployment Options

### Option 1: Lovable Publish (Recommended for Testing)
1. Click **Publish** in Lovable
2. Access the URL from any browser
3. Dashboard auto-connects to `ws://<hostname>:1880/ws/signals`

### Option 2: Build & Deploy to Raspberry Pi

**On your computer** (not the Pi):
```bash
# Clone and build
git clone <your-repo-url>
cd motorgear-monitor
npm install
npm run build

# Copy to Pi
scp -r dist nginx.conf docker-compose.yml pi@<PI_IP>:/home/pi/motorgear/
```

**On Raspberry Pi:**
```bash
cd /home/pi/motorgear
docker-compose up -d
```

Access at `http://<PI_IP>:8082`

### Option 3: Simple HTTP Server (No Docker)

**On Pi after copying dist folder:**
```bash
# Using Python
cd /home/pi/motorgear/dist
python3 -m http.server 8082

# Or using Node
npx serve -l 8082
```

---

## Node-RED WebSocket Setup

Add a **websocket out** node in Node-RED:
- Type: Listen on
- Path: `/ws/signals`

Send JSON messages:
```json
{"signalId": "motor_voltage", "value": 405.5}
```

Valid signal IDs:
- `motor_voltage`, `motor_current`, `motor_power`
- `motor_temp`, `gearbox_temp`
- `motor_vibration`, `gearbox_vibration`

## Custom WebSocket URL

In browser console:
```javascript
localStorage.setItem('wsUrl', 'ws://192.168.1.100:1880/ws/signals');
location.reload();
```

---

Built for industrial automation 🏭
