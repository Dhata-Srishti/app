# 🚌 Transport Help Feature Integration

This document describes the integration of the Transport Help feature into the Dhata app, providing bus search and route information for both BMTC (local Bangalore buses) and KSRTC (intercity buses).

## 📋 Overview

The Transport Help feature has been integrated as a new "Network" tab in the Dhata app, providing:

1. **Bus Search**: Find buses between two locations (automatically detects BMTC vs KSRTC)
2. **Route Information**: Get detailed route information for specific bus numbers
3. **Real-time Data**: Attempts to fetch real data from KSRTC and BMTC APIs with fallback to mock data

## 🏗️ Architecture

### Backend (Go)
- **File**: `backend/transport-server.go`
- **Port**: 8081
- **Framework**: Gorilla Mux with CORS support
- **Features**:
  - KSRTC API integration for intercity buses
  - BMTC route information
  - Mock data fallback for reliability
  - RESTful API endpoints

### Frontend (React Native)
- **File**: `app/(tabs)/network.tsx`
- **Features**:
  - Two-tab interface (Search Buses / Bus Route)
  - Real-time search with loading states
  - Categorized results (Luxury, Express, Local buses)
  - Responsive UI matching app theme

## 🚀 Getting Started

### Prerequisites
- Go 1.21 or higher
- Python 3.x (for existing Flask backend)
- Node.js and npm/yarn (for React Native frontend)

### Starting the Backend

#### Option 1: Use the startup script (Recommended)
```bash
cd backend
./start-servers.sh
```

This will start both:
- Python Flask server on port 5000
- Go Transport server on port 8081

#### Option 2: Start Go server manually
```bash
cd backend
go mod tidy
go run transport-server.go
```

### Stopping the Backend
```bash
cd backend
./stop-servers.sh
```

This will stop both servers and free up ports 5000 and 8081.

### API Endpoints

#### 1. Health Check
```
GET /api/transport/health
```

#### 2. Search Buses
```
POST /api/transport/search-buses
Content-Type: application/json

{
  "from": "MG Road",
  "to": "Silk Board",
  "date": "25-12-2024"  // Optional, for KSRTC buses
}
```

#### 3. Get Bus Route
```
POST /api/transport/bus-route
Content-Type: application/json

{
  "busNumber": "500D"
}
```

#### 4. Get BMTC Buses Between Locations
```
POST /api/transport/bmtc-buses
Content-Type: application/json

{
  "from": "Hebbal",
  "to": "Electronic City"
}
```

## 🎯 Features

### Automatic Service Detection
The system automatically determines whether to use BMTC or KSRTC based on the locations:

**BMTC Locations** (within Bangalore):
- MG Road, Majestic, Silk Board, Hebbal
- Whitefield, Electronic City, Jayanagar
- Indiranagar, Marathahalli, BTM Layout
- Koramangala, HSR Layout, JP Nagar
- And many more...

**KSRTC** (intercity travel):
- Any locations not recognized as Bangalore locations

### Bus Categories

#### BMTC Buses
- Shows bus numbers, routes, and key stops
- Includes popular routes like 500D, 500C, 401K

#### KSRTC Buses
- **Luxury Buses**: AC Volvo, Sleeper coaches
- **Express Buses**: Fast intercity services
- **Local Buses**: Ordinary and Sarige services

### Mock Data
Comprehensive mock data ensures the app works even when external APIs are unavailable:
- 15+ BMTC routes with detailed stop information
- Sample KSRTC services with timings, fares, and ratings

## 🔧 Configuration

### API Base URL
The frontend is configured to connect to the Go backend at:
```typescript
const API_BASE_URL = 'http://localhost:8081/api/transport';
```

For production, update this to your deployed Go server URL.

### CORS Configuration
The Go server is configured to accept requests from any origin:
```go
AllowedOrigins: []string{"*"}
```

For production, restrict this to your frontend domain.

## 📱 Frontend Usage

1. **Navigate to Network Tab**: Tap the "Network" tab in the bottom navigation
2. **Search Buses**: 
   - Enter "From" and "To" locations
   - Optionally enter date for KSRTC buses
   - Tap "Search Buses"
3. **View Route**: 
   - Switch to "Bus Route" tab
   - Enter bus number (e.g., "500D")
   - Tap "Get Route"

## 🛠️ Development

### Adding New BMTC Routes
Edit the `routes` map in `GetBMTCBusesBetweenLocations()` function:

```go
routes := map[string][]string{
    "new location": {"bus1", "bus2", "bus3"},
    // ...
}
```

### Adding New Mock Routes
Edit the `mockRoutes` map in `MockBMTCBusRoute()` function:

```go
mockRoutes := map[string]BMTCResponse{
    "NEW_BUS": {
        BusNumber: "NEW_BUS",
        From:      "Start Location",
        To:        "End Location",
        Stops:     []string{"Stop1", "Stop2", "Stop3"},
    },
}
```

### Customizing UI
The frontend uses the same color scheme as the main app:
- Primary: `#f57f17` (orange)
- Background: `#fff1de` (cream)
- Text: `#5D4037` (brown)

## 🔍 Testing

### Test the Go Server
```bash
# Health check
curl http://localhost:8081/api/transport/health

# Search buses
curl -X POST http://localhost:8081/api/transport/search-buses \
  -H "Content-Type: application/json" \
  -d '{"from":"MG Road","to":"Silk Board"}'

# Get bus route
curl -X POST http://localhost:8081/api/transport/bus-route \
  -H "Content-Type: application/json" \
  -d '{"busNumber":"500D"}'
```

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use error**
   ```
   listen tcp :8081: bind: address already in use
   ```
   **Solution**: Use the stop script to kill existing processes:
   ```bash
   cd backend
   ./stop-servers.sh
   ./start-servers.sh
   ```

   **Alternative manual fix**:
   ```bash
   # Find and kill processes using the ports
   lsof -ti:8081 | xargs kill -9  # Kill Go server
   lsof -ti:5000 | xargs kill -9  # Kill Python server
   ```

2. **Go server won't start**
   - Check if Go is installed: `go version`
   - Ensure port 8081 is available
   - Check for compilation errors: `go build transport-server.go`

3. **Frontend can't connect to backend**
   - Verify Go server is running on port 8081
   - Check network connectivity
   - Ensure CORS is properly configured

4. **No search results**
   - Check if location names are spelled correctly
   - Try common locations like "MG Road", "Silk Board"
   - Mock data should always return results

### Server Management

**Start servers**:
```bash
cd backend
./start-servers.sh
```

**Stop servers**:
```bash
cd backend
./stop-servers.sh
```

**Check server status**:
```bash
# Check Go server
curl http://localhost:8081/api/transport/health

# Check if ports are in use
lsof -i:8081  # Go server
lsof -i:5000  # Python server
```

### Logs
The Go server provides detailed logging:
- API requests and responses
- External API calls to KSRTC/BMTC
- Error messages and debugging info

## 📈 Future Enhancements

1. **Real-time Bus Tracking**: Integrate with live bus tracking APIs
2. **Fare Calculator**: Add fare estimation based on distance
3. **Offline Support**: Cache frequently searched routes
4. **Push Notifications**: Alert users about bus delays or route changes
5. **Maps Integration**: Show bus routes on interactive maps
6. **User Preferences**: Save favorite routes and locations

## 🤝 Contributing

When adding new features:
1. Follow the existing code structure
2. Add appropriate error handling
3. Include mock data for reliability
4. Update this documentation
5. Test both BMTC and KSRTC scenarios

## 📄 License

This Transport Help feature is part of the Dhata app and follows the same licensing terms. 