# CUSTOM Events Implementation - Option 1

## ✅ What We Built

A solution to capture thinking steps and token counts that CopilotKit filters out, using **event interception at the Next.js API level**.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  React Frontend                                             │
│                                                             │
│  1. CopilotKit → /api/copilotkit (POST)                    │
│     Gets: Text, Tool Calls, Tool Results                   │
│                                                             │
│  2. useCustomEvents → /api/copilotkit?threadId=xxx (GET)   │
│     Gets: Thinking steps, Session stats                    │
│     Polls every 1 second                                    │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│  Next.js API (/api/copilotkit/route.ts)                    │
│                                                             │
│  InterceptingAgent wraps HttpAgent:                        │
│  ✅ Captures ALL events from bridge                         │
│  ✅ Stores CUSTOM events in memory (Map by threadId)        │
│  ✅ Passes ALL events to CopilotKit (which filters CUSTOM)  │
│                                                             │
│  POST: Handles chat (intercepts & stores CUSTOM events)    │
│  GET: Returns stored CUSTOM events for threadId            │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│  Python Bridge (http://localhost:8000/chat)                │
│  Sends ALL AG-UI Protocol events including CUSTOM          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Files Created/Modified

### 1. `/api/copilotkit/route.ts` ✅ MODIFIED
**What it does:**
- Wraps `HttpAgent` with `InterceptingAgent`
- Captures CUSTOM events BEFORE CopilotKit filters them
- Stores in memory: `Map<threadId, { thinking: [], session_stats: {} }>`
- **POST**: Handles chat requests
- **GET**: Returns stored CUSTOM events for a threadId

**Key Code:**
```typescript
class InterceptingAgent {
  async *run(input) {
    for await (const event of baseAgent.run(input)) {
      // Capture CUSTOM events
      if (event.type === 'CUSTOM') {
        customEventStore.set(threadId, event);
      }
      // Pass ALL to CopilotKit
      yield event;
    }
  }
}
```

### 2. `/hooks/useCustomEvents.ts` ✅ NEW
**What it does:**
- Polls `/api/copilotkit?threadId=xxx` every 1 second
- Returns thinking events and session stats
- Provides computed values: `activeThinking`, `completedThinkingSteps`

**Usage:**
```typescript
const { thinkingEvents, sessionStats, activeThinking } = 
  useCustomEvents(threadId);
```

### 3. `/components/ThinkingIndicator.tsx` ✅ NEW
**What it does:**
- Displays individual thinking step with token count
- Animates when thinking is active
- Shows model name and token breakdown

**Components:**
- `ThinkingIndicator` - Single thinking step
- `ThinkingList` - List of all thinking steps

### 4. `/components/SessionStats.tsx` ✅ NEW
**What it does:**
- Displays final session statistics
- Shows: Total thinking tokens, Tool calls, Duration
- Green success card with icons

### 5. `/components/chat/EnhancedChatInterface.tsx` ✅ NEW
**What it does:**
- Wraps CopilotChat with metadata sidebar
- Uses `useCustomEvents` to fetch thinking/stats
- Displays `ThinkingList` and `SessionStats`
- Responsive layout: Chat + Sidebar

### 6. `/app/page.tsx` ✅ MODIFIED
**What changed:**
- Uses `EnhancedChatInterface` instead of `ChatInterface`

---

## 🎯 How It Works

### Step 1: User Sends Message
```
User types "Generate pitch deck..." 
→ CopilotKit POSTs to /api/copilotkit
→ InterceptingAgent wraps HttpAgent
→ HttpAgent connects to Python bridge
```

### Step 2: Bridge Sends Events
```
Python Bridge streams:
- TEXT_MESSAGE_START
- CUSTOM (thinking: { thoughtsTokenCount: 471 }) ← Intercepted!
- TOOL_CALL_START
- TOOL_CALL_RESULT
- CUSTOM (thinking: { thoughtsTokenCount: 950 }) ← Intercepted!
- CUSTOM (session_stats: { ... }) ← Intercepted!
- RUN_FINISHED
```

### Step 3: Events Split
```
InterceptingAgent:
├─ CUSTOM events → Store in customEventStore
└─ ALL events → Pass to CopilotKit
    └─ CopilotKit → Filters CUSTOM, sends rest to UI
```

### Step 4: Frontend Polls
```
Every 1 second:
useCustomEvents fetches /api/copilotkit?threadId=xxx
Gets: { thinking: [...], session_stats: {...} }
Updates UI with thinking steps & stats
```

---

## 📊 Data Flow Example

### CUSTOM Event from Bridge:
```json
{
  "type": "CUSTOM",
  "name": "thinking",
  "value": {
    "status": "start",
    "thoughtsTokenCount": 471,
    "totalTokenCount": 3047,
    "model": "gemini-2.5-flash"
  }
}
```

### Stored in Next.js:
```json
{
  "thinking": [
    {
      "status": "start",
      "thoughtsTokenCount": 471,
      "totalTokenCount": 3047,
      "model": "gemini-2.5-flash",
      "timestamp": 1732118711910
    },
    {
      "status": "end",
      "timestamp": 1732118711918
    }
  ],
  "session_stats": {
    "totalThinkingTokens": 1421,
    "totalToolCalls": 2,
    "durationSeconds": 16.59
  },
  "lastUpdated": 1732118721804
}
```

### Retrieved by Frontend:
```typescript
const { thinkingEvents, sessionStats } = useCustomEvents(threadId);

// thinkingEvents = [{ thoughtsTokenCount: 471, ... }, ...]
// sessionStats = { totalThinkingTokens: 1421, ... }
```

---

## ✅ What You'll See

### During Chat:
1. **Active Thinking Indicator** (animated, purple)
   - "🧠 Thinking... (471 tokens)"
   - Shows model: "gemini-2.5-flash"

2. **Completed Thinking Steps** (gray)
   - "✨ Extended Thinking (950 tokens)"
   - Lists all completed thinking phases

### After Completion:
3. **Session Statistics** (green card)
   - 💡 Total Thinking: 1,421 tokens
   - 🔧 Tool Calls: 2
   - ⏱️ Duration: 16.6s

---

## 🧪 Testing

### 1. Restart Agent UI
```bash
cd apps/agent_ui
npm run dev
```

### 2. Send Query
```
"Generate complete pitch deck for CLI_SG_001 singapore conservative fund"
```

### 3. Check Browser Console
```
[InterceptingAgent] Starting run for thread: xxx
[InterceptingAgent] Intercepted CUSTOM event: thinking
[useCustomEvents] Starting polling for thread: xxx
```

### 4. Watch Sidebar
- Should see thinking steps appear in real-time
- Should see session stats after completion

---

## 🔧 Configuration

### Polling Interval
Change in `useCustomEvents`:
```typescript
const { ... } = useCustomEvents(threadId, true, 2000); // Poll every 2s
```

### Debug Mode
Enable in `.env.local`:
```
NEXT_PUBLIC_SHOW_DEV_CONSOLE=true
```

Shows thread ID and event counts in sidebar.

---

## 🎨 UI Layout

```
┌────────────────────────────────────────────────────────────┐
│  Header: Agent Testing UI                                  │
├────────────────────────────────────┬───────────────────────┤
│                                    │                       │
│  Chat Area (CopilotKit)            │  Metadata Sidebar     │
│  - User messages                   │                       │
│  - Assistant responses             │  Thinking Steps:      │
│  - Tool call cards                 │  🧠 Thinking... (471) │
│  - Tool results                    │  ✨ Extended (950)    │
│                                    │                       │
│                                    │  Session Complete:    │
│                                    │  💡 1,421 tokens      │
│                                    │  🔧 2 tool calls      │
│                                    │  ⏱️ 16.6s            │
│                                    │                       │
└────────────────────────────────────┴───────────────────────┘
```

---

## ✅ Advantages

1. **Same Thread**: Uses CopilotKit's thread ID (no duplicate sessions)
2. **No Bridge Changes**: Python bridge unchanged
3. **Clean Separation**: Chat UI via CopilotKit, metadata via polling
4. **Production Ready**: Easy to add auth, rate limiting
5. **No CORS**: All through Next.js API routes

---

## 📋 Backup

Original code backed up at:
```
apps/agent_ui_backup_20251120_155008/
```

To restore:
```bash
cd apps
rm -rf agent_ui
mv agent_ui_backup_20251120_155008 agent_ui
```

---

## 🚀 Next Steps

1. **Test with real queries** ✅ (Ready to test now!)
2. **Add error handling** (if polling fails)
3. **Add loading states** (while thinking)
4. **Persist to DB** (optional - store in Redis/DB instead of memory)
5. **Add real-time updates** (WebSocket instead of polling)

---

## 🎉 Success Criteria

- ✅ Thinking steps display in sidebar
- ✅ Token counts shown accurately
- ✅ Session stats appear after completion
- ✅ No duplicate sessions
- ✅ Works with same thread ID as CopilotKit

