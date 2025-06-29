#!/bin/bash

echo "🚀 Starting Serviplay Development Environment"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Kill processes on ports if running
kill_port() {
    local port=$1
    if check_port $port; then
        print_warning "Port $port is in use, killing processes..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Clean up ports
kill_port 3000
kill_port 3001

print_status "Starting Backend Server (Port 3001)..."

# Start backend in background
cd /mnt/c/xampp/htdocs/Serviplay/backend
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

print_status "Starting Frontend Server (Port 3000)..."

# Start frontend
cd /mnt/c/xampp/htdocs/Serviplay/frontend
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 3

print_status "✅ Development servers started!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:3001"
echo "🏥 Health:   http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    print_status "Stopping development servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    kill_port 3000
    kill_port 3001
    print_status "✅ All servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup INT TERM

# Wait for user input
wait