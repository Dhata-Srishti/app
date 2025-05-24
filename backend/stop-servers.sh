#!/bin/bash

echo "🛑 Stopping Dhata Backend Services..."

# Kill processes using port 8083 (Go transport server)
echo "Stopping Go Transport Server (port 8083)..."
GO_PIDS=$(lsof -ti:8083)
if [ ! -z "$GO_PIDS" ]; then
    echo $GO_PIDS | xargs kill -9
    echo "✅ Stopped Go Transport Server"
else
    echo "ℹ️  No process found on port 8083"
fi

# Kill processes using port 5000 (Python Flask server)
echo "Stopping Python Flask Server (port 5000)..."
PYTHON_PIDS=$(lsof -ti:5000)
if [ ! -z "$PYTHON_PIDS" ]; then
    echo $PYTHON_PIDS | xargs kill -9
    echo "✅ Python Flask Server stopped"
else
    echo "ℹ️  No process found on port 5000"
fi

echo "🎉 All servers stopped successfully!" 