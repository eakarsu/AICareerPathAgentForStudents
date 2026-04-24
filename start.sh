#!/bin/bash

# ============================================
# AI Career Path Agent - Start Script
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_PORT=3001
FRONTEND_PORT=3000

echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════╗"
echo "║      🚀 AI Career Path Agent for Students       ║"
echo "║              Starting Application                ║"
echo "╚══════════════════════════════════════════════════╝"
echo -e "${NC}"

# ---- Step 1: Clean used ports ----
echo -e "${YELLOW}[1/6] Cleaning used ports ($BACKEND_PORT, $FRONTEND_PORT)...${NC}"
for PORT in $BACKEND_PORT $FRONTEND_PORT; do
    PIDS=$(lsof -ti :$PORT 2>/dev/null || true)
    if [ -n "$PIDS" ]; then
        echo -e "  ${RED}Killing processes on port $PORT: $PIDS${NC}"
        echo "$PIDS" | xargs kill -9 2>/dev/null || true
        sleep 1
    else
        echo -e "  ${GREEN}Port $PORT is free${NC}"
    fi
done

# ---- Step 2: Check PostgreSQL ----
echo -e "${YELLOW}[2/6] Checking PostgreSQL...${NC}"
if command -v pg_isready &>/dev/null; then
    if pg_isready -q 2>/dev/null; then
        echo -e "  ${GREEN}PostgreSQL is running${NC}"
    else
        echo -e "  ${CYAN}Starting PostgreSQL...${NC}"
        if command -v brew &>/dev/null; then
            brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
        fi
        sleep 2
        if ! pg_isready -q 2>/dev/null; then
            echo -e "  ${RED}Could not start PostgreSQL. Please start it manually.${NC}"
            exit 1
        fi
    fi
else
    echo -e "  ${YELLOW}pg_isready not found - assuming PostgreSQL is running${NC}"
fi

# ---- Step 3: Create database ----
echo -e "${YELLOW}[3/6] Setting up database...${NC}"
DB_NAME="career_path_agent"
DB_USER="${DB_USER:-postgres}"

# Try to create the database (ignore if exists)
createdb "$DB_NAME" 2>/dev/null && echo -e "  ${GREEN}Database '$DB_NAME' created${NC}" || echo -e "  ${GREEN}Database '$DB_NAME' already exists${NC}"

# ---- Step 4: Install dependencies ----
echo -e "${YELLOW}[4/6] Installing dependencies...${NC}"
cd "$PROJECT_DIR/backend"
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    echo -e "  ${CYAN}Installing backend dependencies...${NC}"
    npm install --silent 2>&1 | tail -1
else
    echo -e "  ${GREEN}Backend dependencies up to date${NC}"
fi

cd "$PROJECT_DIR/frontend"
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    echo -e "  ${CYAN}Installing frontend dependencies...${NC}"
    npm install --silent 2>&1 | tail -1
else
    echo -e "  ${GREEN}Frontend dependencies up to date${NC}"
fi

# ---- Step 5: Seed database ----
echo -e "${YELLOW}[5/6] Seeding database...${NC}"
cd "$PROJECT_DIR/backend"
node seed.js

# ---- Step 6: Start application with hot reload ----
echo -e "${YELLOW}[6/6] Starting application with hot reload...${NC}"

# Start backend with nodemon for hot reload
cd "$PROJECT_DIR/backend"
echo -e "  ${CYAN}Starting backend on port $BACKEND_PORT (with nodemon hot reload)...${NC}"
npx nodemon server.js &
BACKEND_PID=$!

# Start frontend with Vite HMR
cd "$PROJECT_DIR/frontend"
echo -e "  ${CYAN}Starting frontend on port $FRONTEND_PORT (with Vite HMR)...${NC}"
npx vite --port $FRONTEND_PORT &
FRONTEND_PID=$!

# Trap to clean up on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo -e "${GREEN}Application stopped.${NC}"
    exit 0
}
trap cleanup SIGINT SIGTERM

sleep 3

echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════╗"
echo "║            ✅ Application is running!            ║"
echo "║                                                  ║"
echo "║  🌐 Frontend:  http://localhost:$FRONTEND_PORT        ║"
echo "║  🔧 Backend:   http://localhost:$BACKEND_PORT        ║"
echo "║                                                  ║"
echo "║  📧 Demo Login: demo@student.com / demo123      ║"
echo "║                                                  ║"
echo "║  🔄 Hot reload enabled - changes auto-refresh   ║"
echo "║  Press Ctrl+C to stop                            ║"
echo "╚══════════════════════════════════════════════════╝"
echo -e "${NC}"

# Wait for both processes
wait
