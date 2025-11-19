#!/bin/bash

# Agent UI Setup Script
# This script sets up the Agent Testing UI application

set -e  # Exit on error

echo "🚀 Agent Testing UI - Setup Script"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the agent_ui directory."
    exit 1
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed."
    echo "   Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js version must be 18 or higher (current: $(node -v))"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check for npm
echo "✅ npm version: $(npm -v)"
echo ""

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
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
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "📦 Installing dependencies..."
echo "   This may take a few minutes..."
echo ""

# Install dependencies
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. (Optional) Edit .env.local to configure PORT and ADK_BRIDGE_URL"
echo "   2. Run './run.sh' to start the application"
echo "   3. Open http://localhost:3005 in your browser (or your configured port)"
echo ""

