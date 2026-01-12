#!/bin/bash
# MotorGear Monitor - Build and Deploy Script
# Run this on your development machine, NOT on the Raspberry Pi

set -e

echo "=== MotorGear Monitor Build Script ==="
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed"
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the project
echo "Building project..."
npm run build

echo ""
echo "=== Build Complete ==="
echo ""
echo "Next steps:"
echo ""
echo "1. Copy the 'dist' folder to your Raspberry Pi:"
echo "   scp -r dist pi@<raspberry-pi-ip>:/home/pi/motorgear-monitor/"
echo ""
echo "2. Also copy nginx.conf and docker-compose.yml:"
echo "   scp nginx.conf docker-compose.yml pi@<raspberry-pi-ip>:/home/pi/motorgear-monitor/"
echo ""
echo "3. On the Raspberry Pi, run:"
echo "   cd /home/pi/motorgear-monitor"
echo "   docker-compose up -d"
echo ""
echo "4. Access the dashboard at: http://<raspberry-pi-ip>:8082"
echo ""
