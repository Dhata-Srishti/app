#!/bin/bash

# Dhata Backend Startup Script

echo "Starting Dhata Backend Server..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Set environment variables
export DWANI_API_KEY=harshringsia18@gmail.com_dwani
export DWANI_API_BASE_URL=https://dwani-pulakeshi.hf.space

# Start the Flask server
echo "Starting Flask server on http://localhost:5001"
python app.py 