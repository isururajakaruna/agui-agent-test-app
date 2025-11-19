# 🎯 PROJECT SCOPE: Agent UI - Next.js Application

## 📋 Overview

**Name:** `agent_ui`  
**Location:** `/Users/isururajakaruna/ag-ui/dojo/ag-ui/apps/agent_ui`  
**Tech Stack:** Next.js 14 (App Router), TypeScript, CopilotKit, Tailwind CSS  
**Purpose:** Beautiful, modern chat interface for your Agent Engine with full AG-UI Protocol support

---

## 🏗️ Architecture

### Communication Flow
```
User (Browser)
    ↓
Next.js App (Port 3005)
    ↓
API Route (/api/copilotkit)
    ↓
ADK Bridge (Port 8000)
    ↓
GCP Agent Engine (Reasoning Engine)
```

### Technology Stack
- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS + CSS Modules
- **Chat SDK:** CopilotKit 1.10.6
- **Protocol:** AG-UI Protocol
- **State:** React Hooks + CopilotKit State

---

## 📦 Core Dependencies

```json
{
  "dependencies": {
    "@copilotkit/react-core": "^1.10.6",
    "@copilotkit/react-ui": "^1.10.6",
    "@copilotkit/runtime": "^1.10.6",
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.2.0"
  }
}
```

---

## 📁 Project Structure

```
apps/agent_ui/
├── .env.local                    # Environment config
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── README.md
├── PROJECT_SCOPE.md              # This file
│
├── public/
│   ├── logo.svg
│   └── favicon.ico
│
└── src/
    ├── app/
    │   ├── layout.tsx           # Root layout with branding
    │   ├── page.tsx             # Main chat page
    │   ├── globals.css          # Global styles + Tailwind
    │   └── api/
    │       └── copilotkit/
    │           └── route.ts     # CopilotKit API endpoint
    │
    ├── components/
    │   ├── chat/
    │   │   ├── ChatInterface.tsx       # Main chat component
    │   │   ├── ToolCallRenderer.tsx    # Tool call display
    │   │   └── ThinkingIndicator.tsx   # Thinking animation
    │   │
    │   ├── ui/
    │   │   ├── Header.tsx              # App header
    │   │   ├── Sidebar.tsx             # Optional sidebar
    │   │   └── Badge.tsx               # UI components
    │   │
    │   └── tools/
    │       ├── TransferAgentCard.tsx   # transfer_to_agent display
    │       └── MarketSummaryCard.tsx   # get_market_summary display
    │
    ├── lib/
    │   ├── agent-client.ts      # AG-UI Protocol client
    │   └── utils.ts             # Helper functions
    │
    └── types/
        └── agent.ts             # TypeScript types
```

---

## 🎨 UI/UX Features

### 1. Modern Chat Interface
- ✅ Full-screen chat layout
- ✅ Smooth animations & transitions
- ✅ Dark mode support
- ✅ Responsive design (mobile + desktop)
- ✅ Glassmorphism effects
- ✅ Gradient accents

### 2. Tool Call Visualization
- ✅ **transfer_to_agent**: Agent switching card with animation
- ✅ **get_market_summary**: Expandable market data card
- ✅ Loading states with skeleton loaders
- ✅ Success/error indicators
- ✅ Collapsible tool details

### 3. Thinking Indicator
- ✅ Animated dots/pulse when agent is thinking
- ✅ Show thinking token count (if available)
- ✅ Reasoning process visualization

### 4. Message Types
- ✅ User messages (right-aligned, blue)
- ✅ Assistant messages (left-aligned, gradient)
- ✅ System messages (centered, subtle)
- ✅ Tool execution status

### 5. Visual Elements
- ✅ Animated message entrance
- ✅ Typing indicators
- ✅ Smooth scrolling
- ✅ Error boundaries
- ✅ Loading states

---

## 🔧 Technical Features

### 1. AG-UI Protocol Integration

Full support for all AG-UI Protocol event types:

```typescript
// Event Types Handled:
- RUN_STARTED          → Initialize conversation
- TEXT_MESSAGE_START   → Begin message rendering
- TEXT_MESSAGE_CONTENT → Stream message content
- TEXT_MESSAGE_END     → Complete message
- TOOL_CALL_START      → Show tool execution start
- TOOL_CALL_ARGS       → Display tool arguments
- TOOL_CALL_END        → Mark tool call complete
- TOOL_CALL_RESULT     → Show tool results
- RUN_FINISHED         → End conversation
```

### 2. CopilotKit Configuration

```typescript
<CopilotKit
  runtimeUrl="/api/copilotkit"
  agent="insights_copilot_master"
  showDevConsole={false}
>
  <ChatInterface />
</CopilotKit>
```

### 3. Custom Tool Renderers

```typescript
// Transfer Agent Tool
useCopilotAction({
  name: "transfer_to_agent",
  available: "disabled", // Backend tool
  parameters: [
    { name: "agent_name", type: "string", required: true }
  ],
  render: ({ args, status }) => <TransferAgentCard {...} />
})

// Market Summary Tool
useCopilotAction({
  name: "get_market_summary",
  available: "disabled", // Backend tool
  parameters: [
    { name: "client_risk_profile", type: "string" },
    { name: "client_currencies", type: "string[]" }
  ],
  render: ({ args, result, status }) => <MarketSummaryCard {...} />
})
```

### 4. API Route (Bridge Connection)

```typescript
// src/app/api/copilotkit/route.ts
export async function POST(request: Request) {
  const runtime = new CopilotRuntime({
    agents: [{
      name: "insights_copilot_master",
      url: process.env.ADK_BRIDGE_URL + "/chat"
    }]
  });
  
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter: new ExperimentalEmptyAdapter(),
    endpoint: "/api/copilotkit"
  });
  
  return handleRequest(request);
}
```

---

## 🎯 Key Files to Create

### Phase 1: Configuration (6 files)
1. `.env.local` - Environment variables
2. `package.json` - Dependencies and scripts
3. `tsconfig.json` - TypeScript configuration
4. `next.config.ts` - Next.js configuration
5. `tailwind.config.ts` - Tailwind CSS configuration
6. `postcss.config.js` - PostCSS configuration

### Phase 2: Core Application (4 files)
7. `src/app/layout.tsx` - Root layout with providers
8. `src/app/page.tsx` - Main chat page
9. `src/app/globals.css` - Global styles + Tailwind
10. `src/app/api/copilotkit/route.ts` - CopilotKit API endpoint

### Phase 3: Chat Components (3 files)
11. `src/components/chat/ChatInterface.tsx` - Main chat UI
12. `src/components/chat/ToolCallRenderer.tsx` - Tool visualization
13. `src/components/chat/ThinkingIndicator.tsx` - Thinking animation

### Phase 4: UI Components (3 files)
14. `src/components/ui/Header.tsx` - Application header
15. `src/components/ui/Badge.tsx` - Reusable badge component
16. `src/lib/utils.ts` - Utility functions (cn, etc.)

### Phase 5: Tool Renderers (2 files)
17. `src/components/tools/TransferAgentCard.tsx` - Agent transfer UI
18. `src/components/tools/MarketSummaryCard.tsx` - Market data UI

### Phase 6: Types & Documentation (3 files)
19. `src/types/agent.ts` - TypeScript type definitions
20. `README.md` - Project documentation
21. `.gitignore` - Git ignore rules

**Total: 21 files**

---

## 🎨 Design System

### Color Palette

```css
/* Light Mode */
--background: 0 0% 100%
--foreground: 240 10% 3.9%
--card: 0 0% 100%
--card-foreground: 240 10% 3.9%
--primary: 240 5.9% 10%
--primary-foreground: 0 0% 98%
--secondary: 240 4.8% 95.9%
--secondary-foreground: 240 5.9% 10%
--muted: 240 4.8% 95.9%
--muted-foreground: 240 3.8% 46.1%
--accent: 240 4.8% 95.9%
--accent-foreground: 240 5.9% 10%
--border: 240 5.9% 90%
--input: 240 5.9% 90%
--ring: 240 5.9% 10%

/* Dark Mode */
--background: 240 10% 3.9%
--foreground: 0 0% 98%
--card: 240 10% 3.9%
--card-foreground: 0 0% 98%
--primary: 0 0% 98%
--primary-foreground: 240 5.9% 10%
--secondary: 240 3.7% 15.9%
--secondary-foreground: 0 0% 98%
--muted: 240 3.7% 15.9%
--muted-foreground: 240 5% 64.9%
--accent: 240 3.7% 15.9%
--accent-foreground: 0 0% 98%
--border: 240 3.7% 15.9%
--input: 240 3.7% 15.9%
--ring: 240 4.9% 83.9%

/* Custom Accents */
--accent-blue: 217 91% 60%      /* CopilotKit blue */
--accent-purple: 271 81% 56%    /* Tool calls */
--accent-green: 142 76% 36%     /* Success */
--accent-amber: 43 96% 56%      /* Warnings */
--accent-red: 0 84% 60%         /* Errors */

/* Gradients */
--gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
--gradient-tool: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)
--gradient-success: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)
```

### Typography

- **Headings:** Inter (font-bold, tracking-tight)
- **Body:** Inter (font-normal)
- **Code/Mono:** Fira Code (font-mono)
- **Base Size:** 16px (1rem)

### Spacing Scale

```css
--spacing-xs: 0.25rem   /* 4px */
--spacing-sm: 0.5rem    /* 8px */
--spacing-md: 1rem      /* 16px */
--spacing-lg: 1.5rem    /* 24px */
--spacing-xl: 2rem      /* 32px */
--spacing-2xl: 3rem     /* 48px */
```

### Border Radius

```css
--radius-sm: 0.375rem   /* 6px */
--radius-md: 0.5rem     /* 8px */
--radius-lg: 0.75rem    /* 12px */
--radius-xl: 1rem       /* 16px */
--radius-2xl: 1.5rem    /* 24px */
--radius-full: 9999px   /* Full circle */
```

---

## 🚀 Startup Commands

```bash
# Install dependencies
npm install
# or
pnpm install

# Development (Port 3005)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint

# Type check
npm run type-check
```

---

## ⚙️ Environment Variables

### `.env.local`
```bash
# Server Configuration
PORT=3005

# ADK Bridge Connection
ADK_BRIDGE_URL=http://localhost:8000

# Application Metadata
NEXT_PUBLIC_APP_NAME="Insights Co-pilot"
NEXT_PUBLIC_APP_DESCRIPTION="AI-powered market insights and analysis"

# Optional: Development Settings
NEXT_PUBLIC_SHOW_DEV_CONSOLE=false
NEXT_PUBLIC_ENABLE_DEBUG=false
```

---

## ✨ Unique Features

### 1. Real-time Event Logging (Optional)
- Show AG-UI Protocol events in dev console
- Event viewer panel (collapsible)
- Event filtering and search

### 2. Session History
- Save conversations to localStorage
- Export chat as JSON/Markdown
- Session management UI

### 3. Agent Status Indicator
- Show current agent (insights_copilot_master, research_agent, etc.)
- Agent switching animation
- Agent capability badges

### 4. Performance Metrics
- Response time tracking
- Token usage display (if available from usage_metadata)
- Thinking time visualization
- Event timeline

### 5. Accessibility
- ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management

---

## 🎯 Success Criteria

### Functional Requirements
- ✅ Connect to ADK Bridge on port 8000
- ✅ Handle all AG-UI Protocol events
- ✅ Display text messages correctly
- ✅ Render tool calls with custom UI
- ✅ Show thinking indicators
- ✅ Handle errors gracefully
- ✅ Support streaming responses

### UI/UX Requirements
- ✅ Beautiful, modern design
- ✅ Smooth animations (<16ms/frame)
- ✅ Responsive layout (mobile + desktop)
- ✅ Dark mode support
- ✅ Fast interactions (<100ms perceived)
- ✅ Clear visual hierarchy
- ✅ Intuitive navigation

### Performance Requirements
- ✅ First Contentful Paint < 1.5s
- ✅ Time to Interactive < 3s
- ✅ Lighthouse score > 90
- ✅ Zero cumulative layout shift
- ✅ Optimized bundle size

### Code Quality
- ✅ TypeScript strict mode
- ✅ ESLint compliance
- ✅ Component documentation
- ✅ Reusable components
- ✅ Clean architecture

---

## 📊 Implementation Timeline

### Phase 1: Setup (15 minutes)
- Create project structure
- Configure Next.js, TypeScript, Tailwind
- Set up environment variables
- Install dependencies

### Phase 2: Core Features (30 minutes)
- Implement ChatInterface component
- Create CopilotKit integration
- Set up API route
- Basic message display

### Phase 3: Tool Renderers (20 minutes)
- TransferAgentCard component
- MarketSummaryCard component
- ToolCallRenderer wrapper
- Tool status indicators

### Phase 4: Styling & Polish (20 minutes)
- Apply design system
- Add animations
- Implement dark mode
- Responsive design

### Phase 5: Testing & Refinement (15 minutes)
- Test all AG-UI events
- Fix edge cases
- Performance optimization
- Final polish

**Total Estimated Time: ~1.5 hours**

---

## 🔐 Security Considerations

1. **Environment Variables**
   - Never expose bridge URL client-side
   - Use server-side API routes only

2. **Input Validation**
   - Sanitize user inputs
   - Validate message formats

3. **Error Handling**
   - Graceful degradation
   - User-friendly error messages
   - Error boundary components

4. **Rate Limiting** (Future)
   - Implement rate limiting on API routes
   - Prevent abuse

---

## 🚧 Future Enhancements

### Phase 2 Features
- [ ] Multi-agent conversation threads
- [ ] Voice input/output
- [ ] File upload support
- [ ] Share conversations
- [ ] Collaborative chat

### Phase 3 Features
- [ ] Analytics dashboard
- [ ] A/B testing framework
- [ ] Custom agent configuration
- [ ] Plugin system
- [ ] Mobile app (React Native)

---

## 📚 References

- [Next.js Documentation](https://nextjs.org/docs)
- [CopilotKit Docs](https://docs.copilotkit.ai)
- [AG-UI Protocol Spec](../../docs/concepts/architecture.mdx)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

## 📝 Notes

- This application is designed to work with the ADK Bridge running on port 8000
- Ensure the bridge is running before starting the Next.js app
- All tool renderers are customizable and can be extended
- The design system follows modern web best practices
- Dark mode is implemented using CSS variables for easy theming

---

**Last Updated:** November 20, 2025  
**Version:** 1.0.0  
**Status:** 📋 Scoped - Ready for Implementation

