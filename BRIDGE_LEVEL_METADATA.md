# Bridge-Level Metadata Storage

## ✅ Implementation Complete!

**Problem:** CopilotKit's GraphQL layer filters out CUSTOM events (thinking steps, token counts) before they reach the frontend.

**Solution:** Store metadata at the Python bridge level and expose via a separate HTTP endpoint.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  React Frontend                                             │
│                                                             │
│  1. CopilotKit → /api/copilotkit (POST)                    │
│     Gets: Text, Tool Calls, Tool Results                   │
│     (No interception - clean passthrough)                   │
│                                                             │
│  2. useCustomEvents → /api/metadata (GET)                  │
│     Polls every 1 second for thinking + session stats      │
└──────────────────┬──────────────┬───────────────────────────┘
                   │              │
       ┌───────────▼──────┐   ┌───▼────────────────────┐
       │ /api/copilotkit  │   │  /api/metadata         │
       │ (Direct proxy)   │   │  (Proxy to bridge)     │
       └───────────┬──────┘   └───┬────────────────────┘
                   │              │
┌──────────────────▼──────────────▼───────────────────────────┐
│  Python Bridge (http://localhost:8000)                      │
│                                                             │
│  POST /chat                                                 │
│  ├─ Streams AG-UI Protocol events to CopilotKit            │
│  └─ Stores CUSTOM events in MetadataStore (by threadId)    │
│                                                             │
│  GET /metadata/{thread_id}                                 │
│  └─ Returns { thinking: [...], session_stats: {...} }      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Files Created/Modified

### Python Bridge

#### 1. `metadata_store.py` ✅ NEW
**What it does:**
- In-memory storage for CUSTOM events (thinking, session_stats)
- Organized by `thread_id`
- Auto-cleanup of old threads (60 min TTL)

**API:**
```python
metadata_store.add_thinking(thread_id, thinking_event)
metadata_store.set_session_stats(thread_id, stats)
metadata_store.get_metadata(thread_id)  # Returns all metadata
```

#### 2. `protocol_translator.py` ✅ MODIFIED
**Changes:**
- Accepts `metadata_store` parameter in `__init__`
- Stores thinking events as they're generated
- Stores session stats at end of run

#### 3. `main_direct.py` ✅ MODIFIED
**Changes:**
- Imports `metadata_store`
- Passes `metadata_store` to `AGUIProtocolTranslator`
- Adds `GET /metadata/{thread_id}` endpoint

---

### Next.js Agent UI

#### 4. `/api/metadata/route.ts` ✅ NEW
**What it does:**
- Proxies requests to bridge's `/metadata/{threadId}`
- Simple GET endpoint: `/api/metadata?threadId=xxx`

#### 5. `/api/copilotkit/route.ts` ✅ CLEANED UP
**Changes:**
- Removed Proxy interception code
- Back to simple, direct agent
- Added comment explaining metadata is at bridge level

#### 6. `useCustomEvents.ts` ✅ MODIFIED
**Changes:**
- Updated `fetchCustomEvents` to poll `/api/metadata` instead of `/api/copilotkit`

---

## 📊 Data Flow

### 1. User Sends Message
```
Browser → /api/copilotkit → Bridge POST /chat
```

### 2. Bridge Processes & Stores
```
Bridge:
  1. Streams events from Agent Engine
  2. Translates to AG-UI Protocol
  3. AS IT GENERATES EVENTS:
     - CUSTOM (thinking) → Store in metadata_store
     - CUSTOM (session_stats) → Store in metadata_store
  4. Streams ALL events to CopilotKit (including CUSTOM)
```

### 3. CopilotKit Filters
```
CopilotKit GraphQL:
  - TEXT_MESSAGE_* → ✅ Pass to frontend
  - TOOL_CALL_* → ✅ Pass to frontend  
  - CUSTOM → ❌ Filter out (NOT in GraphQL schema)
```

### 4. Frontend Polls for Metadata
```
Every 1 second:
  Browser → /api/metadata?threadId=xxx
          → Bridge GET /metadata/{threadId}
          → Returns stored CUSTOM events
```

---

## 🎯 Example Response

### From `/metadata/{threadId}`:
```json
{
  "thinking": [
    {
      "status": "start",
      "thoughtsTokenCount": 471,
      "totalTokenCount": 3047,
      "candidatesTokenCount": 2576,
      "promptTokenCount": 471,
      "model": "gemini-2.5-flash",
      "timestamp": "2025-11-20T15:55:11.947Z"
    },
    {
      "status": "end",
      "timestamp": "2025-11-20T15:55:11.957Z"
    }
  ],
  "session_stats": {
    "totalThinkingTokens": 1421,
    "totalToolCalls": 5,
    "durationSeconds": 16.59,
    "threadId": "58eb2626-8598-437f-8fb1-0a3933b62228",
    "runId": "abc-123-def-456"
  },
  "lastUpdated": "2025-11-20T15:55:28.506Z"
}
```

---

## ✅ Advantages

1. **No CopilotKit Interference** - Metadata stored before CopilotKit sees it
2. **Clean Separation** - Main chat flow unchanged
3. **Same Thread ID** - Uses CopilotKit's thread ID (no duplicate sessions!)
4. **Simple HTTP** - Standard GET requests, easy to debug
5. **Bridge Owns Data** - Bridge is source of truth for metadata
6. **Easy to Extend** - Add more metadata types without touching Next.js

---

## 🧪 Testing

### 1. Restart Bridge
```bash
cd agui-dojo-adk-bridge
./run_direct.sh
```

### 2. Restart Agent UI
```bash
cd apps/agent_ui
npm run dev
```

### 3. Send Query
```
"Generate complete pitch deck for CLI_SG_001 singapore conservative fund"
```

### 4. Check Browser Console
```
[useCustomEvents] Starting polling for thread: xxx
```

### 5. Check Browser Network Tab
- `/api/copilotkit` - Should show chat SSE stream
- `/api/metadata?threadId=xxx` - Should poll every 1 second

### 6. Watch Sidebar
- Should see thinking steps appear
- Should see session stats after completion

### 7. Check Bridge Logs
```
[MetadataStore] Initialized thread: xxx
[MetadataStore] Added thinking event to thread xxx
[MetadataStore] Set session stats for thread xxx
Metadata requested for thread: xxx
```

---

## 🔧 Configuration

### Polling Interval
```typescript
// apps/agent_ui/src/hooks/useCustomEvents.ts
useCustomEvents(threadId, true, 2000); // Poll every 2s
```

### Metadata TTL
```python
# agui-dojo-adk-bridge/src/metadata_store.py
metadata_store = MetadataStore(ttl_minutes=120)  # 2 hour TTL
```

---

## 📝 API Reference

### Bridge Endpoints

#### POST /chat
- Streams AG-UI Protocol events
- Stores CUSTOM events in metadata_store
- Same as before

#### GET /metadata/{thread_id}
- **NEW** endpoint
- Returns all metadata for a thread
- Response:
  ```json
  {
    "thinking": [],
    "session_stats": null,
    "lastUpdated": null
  }
  ```

### Next.js Endpoints

#### POST /api/copilotkit
- Proxies to bridge `/chat`
- No changes from original implementation

#### GET /api/metadata
- **NEW** endpoint
- Query param: `threadId`
- Proxies to bridge `/metadata/{threadId}`

---

## 🎉 Success Criteria

- ✅ Chat works normally (text + tool calls)
- ✅ No errors in console
- ✅ Sidebar displays thinking steps
- ✅ Sidebar displays session stats
- ✅ Same thread ID for both chat and metadata
- ✅ No interference with CopilotKit

---

## 🚀 Ready to Test!

The implementation is complete. Just restart both services and try it out!

