#!/bin/bash

echo "🚀 Starting Dhata Backend Services..."

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed. Please install Go to run the transport service."
    exit 1
fi

# Function to handle cleanup
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    # Kill background processes
    kill $GO_PID 2>/dev/null
    kill $PYTHON_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start the Go transport server
echo "🚌 Starting Transport Help API Server (Go) on port 8083..."
cd "$(dirname "$0")"

# Initialize Go modules if needed
if [ ! -f "go.sum" ]; then
    echo "📦 Initializing Go modules..."
    go mod init transport-server 2>/dev/null || true
    go mod tidy
fi

# Start Go server in background
go run transport-server.go &
GO_PID=$!

# Give Go server time to start
sleep 2

# Check if Go server started successfully
if ! kill -0 $GO_PID 2>/dev/null; then
    echo "❌ Failed to start Go transport server"
    exit 1
fi

echo "✅ Transport Help API Server started successfully"

# Start the Python Flask server
echo "🐍 Starting Python Flask Server on port 5000..."

# Check if virtual environment exists
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d ".venv" ]; then
    source .venv/bin/activate
fi

# Install requirements if needed
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt >/dev/null 2>&1
fi

# Start Python server in background
python app.py &
PYTHON_PID=$!

# Give Python server time to start
sleep 2

# Check if Python server started successfully
if ! kill -0 $PYTHON_PID 2>/dev/null; then
    echo "❌ Failed to start Python Flask server"
    kill $GO_PID 2>/dev/null
    exit 1
fi

echo "✅ Python Flask Server started successfully"
echo ""
echo "🎉 All services are running!"
echo "📍 Available APIs:"
echo "   • Python Flask API: http://localhost:5000"
echo "   • Transport Help API: http://localhost:8083/api/transport"
echo ""
echo "🚌 Transport Help Endpoints:"
echo "   • POST /api/transport/search-buses"
echo "   • POST /api/transport/bus-route"
echo "   • POST /api/transport/bmtc-buses"
echo "   • GET  /api/transport/health"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for either process to exit
wait 