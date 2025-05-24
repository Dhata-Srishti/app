# Mobile API Setup Guide

This guide explains how to configure your React Native app to work with backend services on mobile devices (Expo Go / native builds).

## Backend Services Overview

Your application uses **two separate backend services**:

1. **Main Backend Service** (Flask) - Port 5001
   - Handles AI chat, translation, TTS, vision queries, etc.
   - Configured via `EXPO_PUBLIC_API_URL`

2. **Transport Backend Service** (Go) - Port 8083  
   - Handles bus search, routes, BMTC/KSRTC data
   - Configured via `EXPO_PUBLIC_TRANSPORT_API_URL`

## Prerequisites

1. **Find Your Development Machine's IP Address**

   **On macOS/Linux:**
   ```bash
   ifconfig | grep inet
   # Look for your WiFi interface (usually en0 on macOS)
   # Example output: inet 192.168.1.100 netmask 0xffffff00 broadcast 192.168.1.255
   ```

   **On Windows:**
   ```cmd
   ipconfig
   # Look for your WiFi adapter's IPv4 Address
   ```

2. **Ensure Network Connectivity**
   - Your mobile device must be on the **same WiFi Network** as your development machine
   - Make sure your firewall allows connections on ports 5001 and 8083

## Environment Variable Configuration

### Method 1: Using .env File (Recommended)

Create a `.env` file in your project root:

```bash
# .env file
# Replace 192.168.1.100 with your actual development machine IP

# Main Backend Service (Flask) - Port 5001
EXPO_PUBLIC_API_URL=http://192.168.1.100:5001

# Transport Backend Service (Go) - Port 8083  
EXPO_PUBLIC_TRANSPORT_API_URL=http://192.168.1.100:8083
```

### Method 2: Using app.json/app.config.js

Add to your `app.json` under the `expo` section:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://192.168.1.100:5001",
      "transportApiUrl": "http://192.168.1.100:8083"
    }
  }
}
```

Then access via `Constants.expoConfig.extra.apiUrl` (requires `expo-constants`).

### Method 3: Export Before Starting Expo

```bash
export EXPO_PUBLIC_API_URL=http://192.168.1.100:5001
export EXPO_PUBLIC_TRANSPORT_API_URL=http://192.168.1.100:8083
expo start
```

## Starting Your Backend Services

Make sure both backend services are running:

```bash
# Terminal 1: Start main backend service (Flask)
cd your-flask-backend-directory
python app.py  # Should start on port 5001

# Terminal 2: Start transport backend service (Go)
cd backend
go run transport-server.go  # Should start on port 8083
```

## Testing the Setup

1. **Start your Expo app:**
   ```bash
   expo start
   ```

2. **Open the app on your mobile device** using Expo Go

3. **Navigate to the Transport Help tab**

4. **Use the "Test Connection" button** (visible in development mode)
   - This will verify that your mobile app can reach the transport service
   - It will show helpful error messages if something is misconfigured

## Platform-Specific Behavior

### Web Version
- Automatically uses `localhost:5001` for main API
- Automatically uses `localhost:8083` for transport API
- No environment variables needed for web development

### Mobile Version (Expo Go / Native)
- Uses environment variables `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_TRANSPORT_API_URL`
- Falls back to helpful error messages if environment variables are not set
- Requires your development machine's IP address

## Troubleshooting

### "Connection Test Failed" Error

1. **Check Network Connectivity:**
   ```bash
   # From your mobile device, try pinging your dev machine
   ping 192.168.1.100
   ```

2. **Verify Backend Services are Running:**
   ```bash
   # Check if services are listening on the correct ports
   lsof -i :5001  # Main backend
   lsof -i :8083  # Transport backend
   ```

3. **Check Firewall Settings:**
   - Ensure your firewall allows incoming connections on ports 5001 and 8083
   - On macOS: System Preferences > Security & Privacy > Firewall
   - On Windows: Windows Defender Firewall settings

4. **Verify Environment Variables:**
   ```bash
   # Check if variables are set correctly
   echo $EXPO_PUBLIC_API_URL
   echo $EXPO_PUBLIC_TRANSPORT_API_URL
   ```

### "Network request failed" Error

- Double-check your IP address
- Ensure both your mobile device and development machine are on the same WiFi Network
- Try restarting the Expo development server after setting environment variables

### Android HTTP Traffic Issues

For production Android builds (API level 28+), you may need to allow HTTP traffic:

Create `android/app/src/main/res/xml/Network_security_config.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<Network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">192.168.1.100</domain>
    </domain-config>
</Network-security-config>
```

And add to `android/app/src/main/AndroidManifest.xml`:
```xml
<application
    android:NetworkSecurityConfig="@xml/Network_security_config"
    ...>
```

## Example Setup Script

Create a `setup-mobile.sh` script:

```bash
#!/bin/bash
# setup-mobile.sh

# Get your IP address automatically (macOS/Linux)
IP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1)

echo "Setting up environment for IP: $IP"

# Create .env file
cat > .env << EOF
EXPO_PUBLIC_API_URL=http://$IP:5001
EXPO_PUBLIC_TRANSPORT_API_URL=http://$IP:8083
EOF

echo "Environment variables set:"
echo "EXPO_PUBLIC_API_URL=http://$IP:5001"
echo "EXPO_PUBLIC_TRANSPORT_API_URL=http://$IP:8083"

echo "Starting Expo..."
expo start
```

Make it executable: `chmod +x setup-mobile.sh` and run: `./setup-mobile.sh` 