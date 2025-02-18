#!/bin/bash

# Exit on error
set -e

echo "Setting up environment..."

# Check if Python virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install/upgrade pip
python -m pip install --upgrade pip

# Install backend dependencies
echo "Installing backend dependencies..."
pip install -r backend/requirements.txt

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Set environment variables
export FLASK_ENV=production
export PORT=5000

# Start backend server
echo "Starting backend server..."
python -m backend.app &
BACKEND_PID=$!

# Start frontend development server
echo "Starting frontend server..."
cd frontend
npm start &
FRONTEND_PID=$!

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "ngrok could not be found. Please install ngrok and try again."
    exit 1
fi

# Setup ngrok for external access
echo "Setting up ngrok tunnel..."
ngrok http 5000 &
NGROK_PID=$!

# Function to cleanup processes on exit
cleanup() {
    echo "Cleaning up..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    kill $NGROK_PID 2>/dev/null || true
}

# Register cleanup function
trap cleanup EXIT

# Wait for user input
echo "Servers are running. Press Ctrl+C to stop..."
wait

#!/bin/bash

# Start the backend server
cd backend
python -m flask run --host=0.0.0.0 &
BACKEND_PID=$!

# Start the frontend server
cd ../frontend
npm start &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
