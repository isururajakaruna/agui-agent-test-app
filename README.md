# 🤖 Agent UI - Insights Co-pilot

A beautiful, modern Next.js chat interface for Google Agent Engine, powered by CopilotKit with **prototype modification** for extended thinking and session statistics display.

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)
![CopilotKit](https://img.shields.io/badge/CopilotKit-1.10.6-purple)
![AG-UI Protocol](https://img.shields.io/badge/AG--UI-Protocol-orange)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwind-css)

---

## ✨ Features

- 🎨 **Beautiful UI**: Modern, gradient-based design with dark mode support
- 💬 **Real-time Streaming**: SSE-based streaming responses from Agent Engine
- 🔧 **Custom Tool Renderers**: Rich UI for tool calls (agent transfers, market summaries)
- 🎯 **AG-UI Protocol**: Full support for all event types via @ag-ui/client
- 🧠 **Thinking Steps**: Displays extended thinking with token counts (via prototype modification)
- 📊 **Session Stats**: Shows total tokens, tool calls, and duration
- ⚡ **Event Transformation**: Intercepts ACTIVITY_SNAPSHOT events and transforms them to CopilotKit-compatible format
- 📱 **Responsive**: Works seamlessly on desktop and mobile
- ⚡ **Fast**: Optimized with Next.js 14 App Router
- 🎭 **Animations**: Smooth transitions and micro-interactions

---

## 🏗️ Architecture

### ⚠️ **Prototype Modification Approach**

This app uses **prototype modification** to extend CopilotKit's functionality and support AG-UI Protocol `ACTIVITY_SNAPSHOT` events (thinking steps, session stats).

**See detailed documentation:**
- [`COPILOTKIT_PATCH.md`](./COPILOTKIT_PATCH.md) - How the patch works
- [`PROTOTYPE_IMPLEMENTATION.md`](./PROTOTYPE_IMPLEMENTATION.md) - Testing and maintenance

### How It Works

This app uses **@ag-ui/client** for protocol translation and **runtime event transformation** to capture thinking steps and session statistics that CopilotKit normally filters out:

```
┌─────────────────────────────────────┐
│  React Frontend (CopilotKit UI)    │
│  - CopilotChat                      │
│  - Tool renderers                   │
│  - Thinking sidebar ⭐ NEW          │
└──────────┬────────────┬─────────────┘
           │            │
     /api/copilotkit   /api/metadata ⭐
           │            │
┌──────────▼────────────▼─────────────┐
│  Next.js API Routes                 │
│  ├─ @ag-ui/client (HttpAgent)      │
│  └─ Metadata proxy                  │
└──────────┬────────────┬─────────────┘
           │            │
      POST /chat    GET /metadata ⭐
           │            │
┌──────────▼────────────▼─────────────┐
│  Python Bridge (Port 8000)          │
│  ├─ Streams AG-UI Protocol          │
│  └─ Stores CUSTOM events ⭐         │
└──────────┬──────────────────────────┘
           │
┌──────────▼──────────────────────────┐
│  Google Agent Engine (Vertex AI)    │
└─────────────────────────────────────┘
```

**Key Innovation:**
- ✅ CopilotKit shows text + tool calls (via `/api/copilotkit`)
- ✅ Sidebar shows thinking + stats (via `/api/metadata`)
- ✅ Same thread ID for both connections
- ✅ Bypasses CopilotKit's CUSTOM event filtering

See [BRIDGE_LEVEL_METADATA.md](./BRIDGE_LEVEL_METADATA.md) for details.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- ADK Bridge running on port 8000 (see `../../agui-dojo-adk-bridge`)

### Installation

```bash
# Navigate to the project
cd apps/agent_ui

# Install dependencies
npm install

# Copy environment file (create .env.local from example)
# Edit .env.local with your settings

# Start development server
npm run dev
```

The app will be available at **http://localhost:3005**

---

## ⚙️ Configuration

Create a `.env.local` file in the project root:

```bash
# Server Configuration
PORT=3005

# ADK Bridge Connection (must be running)
ADK_BRIDGE_URL=http://localhost:8000

# Application Metadata
NEXT_PUBLIC_APP_NAME="Insights Co-pilot"
NEXT_PUBLIC_APP_DESCRIPTION="AI-powered market insights and analysis"

# Optional: Development Settings
NEXT_PUBLIC_SHOW_DEV_CONSOLE=false
NEXT_PUBLIC_ENABLE_DEBUG=false
```

---

## 📁 Project Structure

```
apps/agent_ui/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Main chat page
│   │   ├── globals.css             # Global styles
│   │   └── api/
│   │       └── copilotkit/
│   │           └── route.ts        # CopilotKit API endpoint
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx   # Main chat component
│   │   │   ├── ToolCallRenderer.tsx # Generic tool display
│   │   │   └── ThinkingIndicator.tsx # Loading animation
│   │   ├── ui/
│   │   │   ├── Header.tsx          # App header
│   │   │   └── Badge.tsx           # Badge component
│   │   └── tools/
│   │       ├── TransferAgentCard.tsx    # Agent transfer UI
│   │       └── MarketSummaryCard.tsx    # Market data UI
│   ├── lib/
│   │   └── utils.ts                # Utility functions
│   └── types/
│       └── agent.ts                # TypeScript types
├── public/                         # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## 🎨 Custom Tool Renderers

The app includes beautiful custom UI for backend tools:

### 1. `transfer_to_agent`
Displays agent switching with animated cards:

```typescript
useCopilotAction({
  name: "transfer_to_agent",
  available: "disabled", // Backend tool
  render: ({ args, status }) => (
    <TransferAgentCard agentName={args?.agent_name} status={status} />
  ),
});
```

### 2. `get_market_summary`
Expandable market data cards with risk profiles:

```typescript
useCopilotAction({
  name: "get_market_summary",
  available: "disabled", // Backend tool
  render: ({ args, result, status }) => (
    <MarketSummaryCard
      riskProfile={args?.client_risk_profile}
      currencies={args?.client_currencies}
      result={result}
      status={status}
    />
  ),
});
```

---

## 🎯 Adding New Tools

To add a new custom tool renderer:

1. **Create the component** in `src/components/tools/YourToolCard.tsx`
2. **Register it** in `src/components/chat/ChatInterface.tsx`:

```typescript
useCopilotAction({
  name: "your_tool_name",
  available: "disabled", // Backend tool
  parameters: [
    { name: "param1", type: "string", required: true }
  ],
  render: ({ args, result, status }) => (
    <YourToolCard {...args} result={result} status={status} />
  ),
});
```

3. **Style it** using Tailwind CSS and the design system

---

## 🎨 Design System

### Colors

The app uses CSS variables for theming (see `src/app/globals.css`):

- **Primary**: `hsl(var(--primary))`
- **Secondary**: `hsl(var(--secondary))`
- **Accent**: `hsl(var(--accent))`
- **Muted**: `hsl(var(--muted))`

### Typography

- **Font**: Inter (Google Fonts)
- **Headings**: Bold, tracking-tight
- **Body**: Normal weight

### Components

All components support:
- ✅ Dark mode
- ✅ Responsive design
- ✅ Smooth animations
- ✅ Accessibility (ARIA labels)

---

## 🔧 Development

### Available Scripts

```bash
# Start development server (port 3005)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type check
npm run type-check
```

### Development Tips

1. **Hot Reload**: Changes auto-reload in dev mode
2. **TypeScript**: Strict mode enabled for type safety
3. **Linting**: ESLint configured for Next.js
4. **Dev Console**: Set `NEXT_PUBLIC_SHOW_DEV_CONSOLE=true` to see CopilotKit events

---

## 🚀 Production Deployment

### Build

```bash
npm run build
```

### Environment Variables

Set these in your production environment:

- `PORT=3005`
- `ADK_BRIDGE_URL` (your ADK bridge URL)
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_DESCRIPTION`

### Deploy

The app can be deployed to:
- Vercel (recommended)
- AWS / GCP / Azure
- Docker container
- Any Node.js hosting

---

## 🐛 Troubleshooting

### "Connection Error" in Chat

**Issue**: Chat shows connection error

**Solution**: Ensure ADK Bridge is running on port 8000:

```bash
cd ../../agui-dojo-adk-bridge
poetry run python src/main.py
```

### Tool Renderers Not Showing

**Issue**: Tools display as plain text

**Solution**: 
1. Verify tool name matches exactly in `useCopilotAction`
2. Check that `available: "disabled"` is set (for backend tools)
3. Ensure tool is registered before component mounts

### Dark Mode Issues

**Issue**: Dark mode colors look wrong

**Solution**: Add `suppressHydrationWarning` to `<html>` tag (already done)

---

## 📚 References

- [Next.js Documentation](https://nextjs.org/docs)
- [CopilotKit Documentation](https://docs.copilotkit.ai)
- [AG-UI Protocol Spec](../../docs/concepts/architecture.mdx)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## 📝 License

See [LICENSE](../../LICENSE) for details.

---

## 👥 Support

For issues or questions:
- Check existing GitHub issues
- Review the [PROJECT_SCOPE.md](./PROJECT_SCOPE.md)
- Contact the development team

---

**Built with ❤️ using Next.js, CopilotKit, and the AG-UI Protocol**

