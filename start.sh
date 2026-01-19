#!/bin/bash

# Unified Talent Management Hub - Startup Script
# Starts both FastAPI backend and React frontend

echo "🚀 Starting Unified Talent Management Hub..."
echo ""

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Get the directory of the script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Start FastAPI backend
echo -e "${CYAN}Starting FastAPI Backend...${NC}"
cd "$DIR"
uvicorn backend.main:app --reload --port 8000 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 3

# Start React frontend
echo -e "${CYAN}Starting React Frontend...${NC}"
cd "$DIR/frontend"
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo -e "${GREEN}✅ Application started!${NC}"
echo ""
echo "📊 Backend API:  http://localhost:8000"
echo "🖥️  Frontend:     http://localhost:3000"
echo "📚 API Docs:     http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Handle shutdown
trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

# Wait for both processes
wait
