# CopilotKit ACTIVITY_SNAPSHOT Patch

## ⚠️ Warning: Prototype Modification

This application uses **prototype modification** to extend CopilotKit's functionality to support AG-UI Protocol `ACTIVITY_SNAPSHOT` events, which CopilotKit doesn't natively support.

---

## What This Patch Does

### Problem
CopilotKit's GraphQL layer only supports these event types:
- `TEXT_MESSAGE_*` → `TextMessageOutput`
- `TOOL_CALL_*` → `ActionExecutionMessageOutput`
- `TOOL_CALL_RESULT` → `ResultMessageOutput`

It **filters out** AG-UI Protocol events like:
- ❌ `ACTIVITY_SNAPSHOT` / `ACTIVITY_DELTA`
- ❌ `CUSTOM`
- ❌ `THINKING_START` / `THINKING_END`

### Solution
The patch **intercepts** events from `@ag-ui/client`'s `HttpAgent` **before** they reach CopilotKit's GraphQL layer and **transforms** them:

```
Bridge → HttpAgent → [PATCH INTERCEPTS HERE] → CopilotKit GraphQL → Browser
                             ↓
                     Transform ACTIVITY_SNAPSHOT
                          to TEXT_MESSAGE
```

---

## Implementation

### File: `src/lib/copilotkit-activity-patch.ts`

```typescript
// Overrides HttpAgent.prototype.run()
HttpAgent.prototype.run = function(input) {
  // Intercept events from bridge
  for await (const event of originalRun.call(this, input)) {
    if (event.type === 'ACTIVITY_SNAPSHOT') {
      // Transform to TEXT_MESSAGE events
      yield* transformActivityToTextMessages(event);
    } else {
      // Pass through unchanged
      yield event;
    }
  }
};
```

### Applied In: `src/app/page.tsx`

```typescript
useEffect(() => {
  patchCopilotKitForActivity(); // Applied on app startup
}, []);
```

---

## What Gets Transformed

### 1. ACTIVITY_SNAPSHOT (THINKING)

**Input:**
```json
{
  "type": "ACTIVITY_SNAPSHOT",
  "messageId": "thinking-123",
  "activityType": "THINKING",
  "content": {
    "status": "in_progress",
    "thoughtsTokenCount": 183,
    "totalTokenCount": 3114,
    "model": "gemini-2.5-flash"
  }
}
```

**Output (to CopilotKit):**
```json
[
  {"type": "TEXT_MESSAGE_START", "messageId": "thinking-123", "role": "assistant"},
  {"type": "TEXT_MESSAGE_CONTENT", "messageId": "thinking-123", "delta": "🧠 **Extended Thinking**\n\n💭 Thought tokens: 183\n📊 Total tokens: 3,114\n🤖 Model: gemini-2.5-flash"},
  {"type": "TEXT_MESSAGE_END", "messageId": "thinking-123"}
]
```

**UI Result:**
```
┌─────────────────────────────────────┐
│ 🧠 Extended Thinking                │
│                                     │
│ 💭 Thought tokens: 183              │
│ 📊 Total tokens: 3,114              │
│ 🤖 Model: gemini-2.5-flash          │
└─────────────────────────────────────┘
```

### 2. ACTIVITY_SNAPSHOT (SESSION_STATS)

**Input:**
```json
{
  "type": "ACTIVITY_SNAPSHOT",
  "messageId": "stats-123",
  "activityType": "SESSION_STATS",
  "content": {
    "totalThinkingTokens": 1410,
    "totalToolCalls": 2,
    "durationSeconds": 18.83
  }
}
```

**Output:**
```
📈 **Session Statistics**

💭 Total thinking tokens: 1,410
🔧 Total tool calls: 2
⏱️ Duration: 18.83s
```

---

## Risks & Maintenance

### ⚠️ Version Compatibility

**Only tested with:** `@copilotkit/runtime v1.10.6`

If CopilotKit updates:
1. Internal APIs may change
2. The patch may break
3. Test thoroughly after updates

### 🔍 Signs of Breakage

```bash
# Console errors like:
[COPILOTKIT PATCH] ❌ Failed to apply patch: TypeError: Cannot read property 'run' of undefined

# Or thinking stops displaying
# Or app crashes on startup
```

### 🛠️ If Patch Breaks

**Option 1: Update the patch**
- Check CopilotKit changelog for API changes
- Update `copilotkit-activity-patch.ts`
- Test thoroughly

**Option 2: Revert to TEXT_MESSAGE approach**
- Comment out `patchCopilotKitForActivity()` in `page.tsx`
- Modify Python bridge to send `TEXT_MESSAGE` events instead
- See: `ACTIVITY_EVENT_ANALYSIS.md` Option 3

---

## Testing

### 1. Check Patch Applied

```bash
# Browser console should show:
[COPILOTKIT PATCH] Applying ACTIVITY_SNAPSHOT patch...
[COPILOTKIT PATCH] ✅ ACTIVITY_SNAPSHOT patch applied successfully
```

### 2. Check Event Transformation

```bash
# Send a query to the agent
# Browser console should show:
[COPILOTKIT PATCH] Intercepting HttpAgent.run()
[COPILOTKIT PATCH] Transforming ACTIVITY_SNAPSHOT: THINKING
[COPILOTKIT PATCH] Transforming ACTIVITY_SNAPSHOT: SESSION_STATS
```

### 3. Check UI Display

Thinking and session stats should appear as formatted chat bubbles with:
- 🧠 Icons
- Token counts
- Model information

---

## Debugging

### Enable Verbose Logging

All patch logs are prefixed with `[COPILOTKIT PATCH]`.

### View Raw Events (Before Transformation)

Check Next.js logs at `/apps/agent_ui/logs/bridge-events-*.log`

### View Bridge Events

Check Python bridge logs at `/agui-dojo-adk-bridge/logs/events_*.log`

---

## Alternatives to This Patch

If this approach becomes too complex to maintain:

### Option 1: Use TEXT_MESSAGE Events (Recommended)

Modify Python bridge to send thinking as `TEXT_MESSAGE` events directly:

```python
yield {"type": "TEXT_MESSAGE_START", "messageId": "thinking-123", "role": "assistant"}
yield {"type": "TEXT_MESSAGE_CONTENT", "messageId": "thinking-123", 
       "delta": "🧠 Thinking (183 tokens)..."}
yield {"type": "TEXT_MESSAGE_END", "messageId": "thinking-123"}
```

**Pros:**
- No prototype modification needed
- Works with any CopilotKit version
- Simple and maintainable

**Cons:**
- Must modify Python bridge
- Thinking appears as chat messages (not separate UI)

### Option 2: Build Custom UI

Replace CopilotKit UI with custom React components that consume AG-UI Protocol directly.

**Pros:**
- Full control
- Support ALL AG-UI events
- No CopilotKit limitations

**Cons:**
- More development work
- Lose CopilotKit's UI features

---

## References

- AG-UI Protocol Events: `docs/concepts/events.mdx`
- Similar approach: [CopilotKit Issue #... (Anthropic thinking)](https://github.com/CopilotKit/CopilotKit/issues/...)
- Event flow analysis: `ACTIVITY_EVENT_ANALYSIS.md`

---

## Changelog

### 2025-11-20
- Initial implementation
- Support for THINKING and SESSION_STATS activity types
- Tested with @copilotkit/runtime v1.10.6

