#!/bin/bash

# Agent UI Run Script - Production Mode
# This script builds (if needed) and starts the Agent Testing UI in production mode

set -e  # Exit on error

echo "🚀 Agent Testing UI - Starting Application (Production)"
echo "======================================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the agent_ui directory."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  Dependencies not installed. Running setup..."
    echo ""
    ./setup.sh
    echo ""
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Creating default configuration..."
    cat > .env.local << 'EOF'
# Server Configuration
PORT=3005

# ADK Bridge Connection
ADK_BRIDGE_URL=http://localhost:8000

# Application Metadata
NEXT_PUBLIC_APP_NAME="Agent Testing UI"
NEXT_PUBLIC_APP_DESCRIPTION="Testing AI agents with beautiful UI"

# Optional: Development Settings
NEXT_PUBLIC_SHOW_DEV_CONSOLE=false
NEXT_PUBLIC_ENABLE_DEBUG=false
EOF
    echo "✅ Created .env.local"
fi

# Load ALL environment variables from .env.local
if [ -f ".env.local" ]; then
    echo "📝 Loading configuration from .env.local"
    export $(grep -v '^#' .env.local | xargs)
fi

# Default to 3005 if PORT not set
PORT=${PORT:-3005}

# Check if configured port is already in use
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port $PORT is already in use. Killing existing process..."
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# Ensure required directories exist
echo "📁 Ensuring required directories exist..."
mkdir -p conversations
mkdir -p conversations_saved
mkdir -p logs
echo "✅ Directories ready"
echo ""

# Check if valid production build exists (check for BUILD_ID file)
if [ ! -f ".next/BUILD_ID" ]; then
    echo "📦 No valid production build found. Building application..."
    echo ""
    npm run build
    echo ""
    echo "✅ Build complete"
    echo ""
else
    echo "✅ Valid production build found"
    echo ""
fi

echo "🌐 Starting production server on http://localhost:$PORT"
echo ""
echo "💡 Tip: Use ./run-dev.sh for development mode with hot reload"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the production server (all env vars from .env.local are already exported)
npm start

