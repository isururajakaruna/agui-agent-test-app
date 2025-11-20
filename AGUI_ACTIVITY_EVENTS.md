# AG-UI Protocol Native Implementation: ACTIVITY Events

## ✅ What We Implemented

Using **AG-UI Protocol's native `ACTIVITY_SNAPSHOT` events** instead of `CUSTOM` events for thinking steps and session statistics.

**Reference:** [AG-UI Protocol Events Documentation](http://docs.ag-ui.com/sdk/js/core/events)

---

## 🎯 Why ACTIVITY Events?

### From the AG-UI Protocol Docs:

> **ActivitySnapshotEvent**: "Delivers a complete snapshot of an activity message... activity discriminator such as 'PLAN' or 'SEARCH'"

`ACTIVITY` events are designed for exactly this use case - showing structured, ongoing activities like:
- Planning steps
- Search operations
- **Extended thinking** (our use case)
- **Session statistics** (our use case)

---

## 📊 What Changed

### Before (CUSTOM events):
```python
yield {
    "type": "CUSTOM",
    "name": "thinking",
    "value": {...}
}
```
**Problem:** CopilotKit's GraphQL layer filters out CUSTOM events

### After (ACTIVITY events):
```python
yield {
    "type": "ACTIVITY_SNAPSHOT",
    "messageId": "thinking-123",
    "activityType": "THINKING",
    "content": {
        "status": "in_progress",
        "thoughtsTokenCount": 471,
        ...
    }
}
```
**Benefit:** Native AG-UI Protocol event that CopilotKit should support

---

## 🔧 Bridge Changes

### File: `protocol_translator.py`

#### 1. Thinking Start Events
```python
# OLD: CUSTOM event
yield {
    "type": "CUSTOM",
    "name": "thinking",
    "value": {"status": "start", ...}
}

# NEW: ACTIVITY_SNAPSHOT event
yield {
    "type": "ACTIVITY_SNAPSHOT",
    "messageId": f"thinking-{thread_id}-{timestamp}",
    "activityType": "THINKING",
    "content": {
        "status": "in_progress",
        "thoughtsTokenCount": 471,
        "totalTokenCount": 3047,
        "model": "gemini-2.5-flash"
    },
    "replace": True
}
```

#### 2. Thinking Complete Events
```python
# OLD: CUSTOM event
yield {
    "type": "CUSTOM",
    "name": "thinking",
    "value": {"status": "end"}
}

# NEW: ACTIVITY_SNAPSHOT event
yield {
    "type": "ACTIVITY_SNAPSHOT",
    "messageId": f"thinking-{thread_id}-complete-{timestamp}",
    "activityType": "THINKING",
    "content": {"status": "completed"},
    "replace": False
}
```

#### 3. Session Statistics
```python
# OLD: CUSTOM event
yield {
    "type": "CUSTOM",
    "name": "session_stats",
    "value": {
        "totalThinkingTokens": 1421,
        ...
    }
}

# NEW: ACTIVITY_SNAPSHOT event
yield {
    "type": "ACTIVITY_SNAPSHOT",
    "messageId": f"session-stats-{thread_id}-{run_id}",
    "activityType": "SESSION_STATS",
    "content": {
        "totalThinkingTokens": 1421,
        "totalToolCalls": 5,
        "durationSeconds": 16.59
    },
    "replace": True
}
```

---

## 🎨 Frontend Components

### File: `ActivityRenderer.tsx` ✅ NEW

Renders two types of activities:

#### 1. THINKING Activities
```tsx
<ActivityRenderer 
  activityType="THINKING"
  content={{
    status: "in_progress",
    thoughtsTokenCount: 471,
    totalTokenCount: 3047,
    model: "gemini-2.5-flash"
  }}
  messageId="thinking-123"
/>
```

**Visual:**
- 🧠 Purple indicator (animated pulse when active)
- Token count badge
- Model name
- Total token display

#### 2. SESSION_STATS Activities
```tsx
<ActivityRenderer 
  activityType="SESSION_STATS"
  content={{
    totalThinkingTokens: 1421,
    totalToolCalls: 5,
    durationSeconds: 16.59,
    threadId: "abc-123"
  }}
  messageId="session-stats-123"
/>
```

**Visual:**
- ✅ Green success card
- Grid layout with 3 metrics
- Brain/Wrench/Clock icons
- Thread ID footer

---

## 🧪 Testing

### 1. Restart the Bridge
```bash
cd /Users/isururajakaruna/ag-ui/dojo/ag-ui/agui-dojo-adk-bridge
lsof -ti:8000 | xargs kill -9
./run_direct.sh
```

### 2. Expected Bridge Logs
```
📤 Sent ACTIVITY_SNAPSHOT for thinking (messageId: thinking-...)
📤 Sent ACTIVITY_SNAPSHOT for thinking completion
📤 Sent ACTIVITY_SNAPSHOT for session stats (messageId: session-stats-...)
```

### 3. Refresh Frontend
```
http://localhost:3005
```

### 4. Send Test Query
```
"Generate complete pitch deck for CLI_SG_001 singapore conservative fund"
```

### 5. Check Browser Network Tab

Look for the `/api/copilotkit` response - it should now include:

```json
{
  "__typename": "ActivityMessageOutput",
  "id": "thinking-...",
  "activityType": "THINKING",
  "content": {
    "status": "in_progress",
    "thoughtsTokenCount": 471,
    ...
  }
}
```

---

## 📡 Data Flow

```
Agent Engine (thinking detected)
  ↓
Bridge: protocol_translator.py
  ├─ Creates ACTIVITY_SNAPSHOT event
  ├─ activityType: "THINKING"
  └─ Streams via SSE
  ↓
@ag-ui/client (HttpAgent)
  ├─ Parses SSE events
  └─ Converts to AG-UI Protocol format
  ↓
CopilotKit Runtime
  ├─ Receives ACTIVITY_SNAPSHOT
  ├─ Maps to ActivityMessageOutput
  └─ Passes to frontend (GraphQL)
  ↓
React Frontend
  ├─ Receives ActivityMessage
  └─ Renders via ActivityRenderer
```

---

## ✅ Benefits of This Approach

### 1. **Native AG-UI Protocol**
- ✅ Uses standard event types
- ✅ Follows protocol design
- ✅ Better for future compatibility

### 2. **No CopilotKit Filtering**
- ✅ `ACTIVITY_SNAPSHOT` has GraphQL schema
- ✅ Should pass through CopilotKit
- ✅ No workarounds needed

### 3. **Structured Data**
- ✅ `activityType` discriminator
- ✅ Typed `content` object
- ✅ Can use `ACTIVITY_DELTA` for updates

### 4. **Better Semantics**
- ✅ "Activities" are exactly what they are
- ✅ Not generic "custom" events
- ✅ Clear intent and purpose

---

## 🔍 Troubleshooting

### If Activities Don't Show Up:

#### Check 1: Bridge Logs
```bash
tail -f /Users/isururajakaruna/ag-ui/dojo/ag-ui/agui-dojo-adk-bridge/logs/events_*.log
```
Should see: `📤 Sent ACTIVITY_SNAPSHOT`

#### Check 2: Browser Network
Look at `/api/copilotkit` response for:
```json
{
  "__typename": "ActivityMessageOutput",
  ...
}
```

#### Check 3: CopilotKit Version
If CopilotKit doesn't support ActivityMessage, we may need to:
- Update CopilotKit version
- Use custom message renderer
- Fall back to metadata polling approach

---

## 🎯 Next Steps

### If It Works:
- ✅ Activities display in chat
- ✅ Remove metadata polling (`useCustomEvents`)
- ✅ Remove `/api/metadata` endpoint
- ✅ Clean architecture

### If It Doesn't Work:
- **Plan B:** Keep metadata polling as fallback
- **Plan C:** Use TEXT_MESSAGE events (Option B from earlier)
- **Plan D:** Check CopilotKit ActivityMessage support

---

## 📚 References

- [AG-UI Protocol Events](http://docs.ag-ui.com/sdk/js/core/events)
- [ActivitySnapshotEvent Spec](http://docs.ag-ui.com/sdk/js/core/events#activitysnapshotevent)
- [ActivityDeltaEvent Spec](http://docs.ag-ui.com/sdk/js/core/events#activitydeltaevent)

---

## ✅ Status: Ready to Test!

**Bridge updated** ✅  
**Frontend component created** ✅  
**Documentation complete** ✅

**Restart the bridge and test!** 🚀

