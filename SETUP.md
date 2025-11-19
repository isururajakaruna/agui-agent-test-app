# 🚀 Agent Testing UI - Setup Guide

Quick setup and run instructions for the Agent Testing UI application.

## 📋 Prerequisites

- **Node.js 18+** ([Download](https://nodejs.org/))
- **pnpm** (will be auto-installed if missing)
- **ADK Bridge** running on port 8000

---

## ⚡ Quick Start

### 1️⃣ First Time Setup

```bash
cd /Users/isururajakaruna/ag-ui/dojo/ag-ui/apps/agent_ui
./setup.sh
```

This will:
- ✅ Check Node.js version
- ✅ Install pnpm if needed
- ✅ Install all dependencies
- ✅ Create `.env.local` configuration

### 2️⃣ Run the Application

```bash
./run.sh
```

This will:
- ✅ Check if ADK Bridge is running (port 8000)
- ✅ Kill any existing process on port 3005
- ✅ Start the development server
- ✅ Open on http://localhost:3005

---

## 🔧 Manual Setup (if needed)

```bash
# Install dependencies
pnpm install --filter agent-ui

# Start development server
npm run dev
```

---

## 🌐 Access Points

- **Agent UI**: http://localhost:3005
- **ADK Bridge**: http://localhost:8000 (must be running)

---

## 🛠️ Configuration

Edit `.env.local` to customize:

```bash
# Server port
PORT=3005

# ADK Bridge URL
ADK_BRIDGE_URL=http://localhost:8000

# Application branding
NEXT_PUBLIC_APP_NAME="Agent Testing UI"
NEXT_PUBLIC_APP_DESCRIPTION="Testing AI agents with beautiful UI"

# Debug settings
NEXT_PUBLIC_SHOW_DEV_CONSOLE=false
NEXT_PUBLIC_ENABLE_DEBUG=false
```

---

## 🐛 Troubleshooting

### Port 3005 already in use
```bash
# Kill existing process
lsof -ti:3005 | xargs kill -9
```

### ADK Bridge not running
```bash
# Start the bridge first
cd ../../adk-local-test-agent
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Dependencies issues
```bash
# Clean reinstall
rm -rf node_modules
./setup.sh
```

### Build errors
```bash
# Type check
npm run type-check

# Linting
npm run lint
```

---

## 📂 Project Structure

```
agent_ui/
├── setup.sh              ← Setup script
├── run.sh                ← Run script
├── SETUP.md              ← This file
├── README.md             ← Full documentation
├── .env.local            ← Configuration (auto-created)
├── package.json
├── src/
│   ├── app/              ← Next.js pages
│   ├── components/       ← React components
│   │   ├── chat/        ← Chat interface
│   │   ├── ui/          ← UI components
│   │   └── tools/       ← Tool renderers
│   ├── lib/             ← Utilities
│   └── types/           ← TypeScript types
└── public/              ← Static assets
```

---

## 🎯 Features

- ✅ Generic tool call rendering
- ✅ Collapsible JSON viewer
- ✅ Click to expand in modal
- ✅ Syntax-highlighted JSON
- ✅ Copy to clipboard
- ✅ Tooltips on hover
- ✅ Dark mode support
- ✅ Responsive design

---

## 📝 Notes

- This is a **pnpm workspace** project
- Use `pnpm` commands at workspace root
- Use `npm` commands in this directory
- Auto-reloads on file changes (hot reload)

---

## 🆘 Need Help?

1. Check if ADK Bridge is running: `curl http://localhost:8000`
2. Check server logs in terminal
3. Check browser console (F12)
4. Review `PROJECT_SCOPE.md` for architecture details
5. Review `README.md` for full documentation

---

**Built with Next.js 14, CopilotKit, and AG-UI Protocol** 🚀

