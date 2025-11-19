#!/bin/bash

# Agent UI Run Script
# This script starts the Agent Testing UI application

set -e  # Exit on error

echo "🚀 Agent Testing UI - Starting Application"
echo "=========================================="
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

# Load PORT from .env.local
if [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | grep PORT | xargs)
fi

# Default to 3005 if not set
PORT=${PORT:-3005}

# Check if port 8000 is available (ADK Bridge should be running)
if ! lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Warning: ADK Bridge doesn't appear to be running on port 8000"
    echo "   The chat will not work without the bridge."
    echo "   Please start the ADK Bridge first."
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Aborted"
        exit 1
    fi
fi

# Check if configured port is already in use
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port $PORT is already in use. Killing existing process..."
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    sleep 1
fi

echo "🌐 Starting server on http://localhost:$PORT"
echo "📡 Connecting to ADK Bridge at http://localhost:8000"
echo ""
echo "📝 Configuration:"
echo "   - Port: $PORT (from .env.local)"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the development server (Next.js will read PORT from environment)
npm run dev

