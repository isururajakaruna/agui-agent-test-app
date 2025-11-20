# Testing Guide: Prototype Modification

## 🎯 Quick Start

### 1. Start the Python Bridge

```bash
cd agui-dojo-adk-bridge
./run_direct.sh
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### 2. Start the Next.js App

**Terminal 2:**
```bash
cd apps/agent_ui
./run.sh
```

**Expected output:**
```
✓ Ready in 2.5s
○ Local:   http://localhost:3005
[App] Applying CopilotKit ACTIVITY patch...
[COPILOTKIT PATCH] Applying ACTIVITY_SNAPSHOT patch...
[COPILOTKIT PATCH] ✅ ACTIVITY_SNAPSHOT patch applied successfully
```

### 3. Open Browser

Navigate to: `http://localhost:3005`

---

## ✅ What to Test

### Test 1: Patch Applied

**Check:** Browser console should show:
```
[App] Applying CopilotKit ACTIVITY patch...
[COPILOTKIT PATCH] Applying ACTIVITY_SNAPSHOT patch...
[COPILOTKIT PATCH] ✅ ACTIVITY_SNAPSHOT patch applied successfully
[App] ✅ CopilotKit patched successfully for ACTIVITY events
```

✅ **Pass:** All log messages appear  
❌ **Fail:** Error messages or no logs

---

### Test 2: Send a Query

**Action:** Send this query in the chat:
```
Create a pitch deck for CLI_SG_001, a conservative fund in Singapore
```

**Check:** Browser console should show:
```
[COPILOTKIT PATCH] Intercepting HttpAgent.run()
[COPILOTKIT PATCH] Converting Observable to AsyncGenerator
[COPILOTKIT PATCH] Processing AsyncGenerator
[COPILOTKIT PATCH] Transforming ACTIVITY_SNAPSHOT: THINKING
[COPILOTKIT PATCH] Transforming ACTIVITY_SNAPSHOT: THINKING
[COPILOTKIT PATCH] Transforming ACTIVITY_SNAPSHOT: SESSION_STATS
```

✅ **Pass:** Events are being transformed  
❌ **Fail:** No transformation logs

---

### Test 3: Thinking Display

**Check:** You should see formatted thinking messages like:

```
┌───────────────────────────────────────┐
│ 🧠 Extended Thinking                  │
│                                       │
│ 💭 Thought tokens: 183                │
│ 📊 Total tokens: 3,114                │
│ ✨ Candidates: 103                    │
│ 📝 Prompt: 2,828                      │
│ 🤖 Model: gemini-2.5-flash            │
└───────────────────────────────────────┘
```

✅ **Pass:** Thinking appears as formatted chat bubbles  
❌ **Fail:** No thinking messages or plain text

---

### Test 4: Session Stats Display

**Check:** At the end of the conversation, you should see:

```
┌───────────────────────────────────────┐
│ 📈 Session Statistics                 │
│                                       │
│ 💭 Total thinking tokens: 1,410       │
│ 🔧 Total tool calls: 5                │
│ ⏱️ Duration: 18.83s                   │
└───────────────────────────────────────┘
```

✅ **Pass:** Session stats appear  
❌ **Fail:** No session stats

---

### Test 5: Tool Calls Still Work

**Check:** Tool calls should still display with the green cards:
- ✅ `transfer_to_agent`
- ✅ `get_market_summary`
- ✅ `load_client_profile`
- ✅ `match_products_to_market_view`
- ✅ `generate_pitch_deck_presentation`

✅ **Pass:** All tool calls display correctly  
❌ **Fail:** Missing tool calls or errors

---

### Test 6: Normal Text Messages Work

**Check:** Agent text responses appear as normal chat bubbles

✅ **Pass:** Text displays correctly  
❌ **Fail:** Text missing or garbled

---

## 🐛 Troubleshooting

### Issue: Patch Not Applied

**Console shows:**
```
[COPILOTKIT PATCH] ❌ Failed to apply patch
```

**Solutions:**
1. Check `@ag-ui/client` installed:
   ```bash
   npm list @ag-ui/client
   ```
2. Clear cache:
   ```bash
   rm -rf .next node_modules
   npm install
   npm run dev
   ```

---

### Issue: No Thinking Displayed

**Console shows patch applied ✅ but no thinking in UI**

**Debug:**
1. Check bridge is sending events:
   ```bash
   grep ACTIVITY_SNAPSHOT agui-dojo-adk-bridge/logs/events_*.log
   ```
   
2. Check Next.js received them:
   ```bash
   grep ACTIVITY_SNAPSHOT apps/agent_ui/logs/bridge-events-*.log
   ```

3. Check transformation:
   - Open browser DevTools → Console
   - Look for `[COPILOTKIT PATCH] Transforming ACTIVITY_SNAPSHOT`

---

### Issue: Observable Conversion Error

**Console shows:**
```
[COPILOTKIT PATCH] Converting Observable to AsyncGenerator
TypeError: ...
```

**This means:**
- HttpAgent.run() is returning an Observable (RxJS)
- Our conversion isn't working

**Solution:**
Check if the conversion logic in `copilotkit-activity-patch.ts` needs updating for your version of `@ag-ui/client`.

---

## 📊 Verification Checklist

After testing, verify:

- [ ] Patch applies without errors
- [ ] Events are intercepted
- [ ] ACTIVITY_SNAPSHOT events are transformed
- [ ] Thinking displays in UI (formatted)
- [ ] Session stats display in UI
- [ ] Tool calls still work
- [ ] Text messages still work
- [ ] No console errors
- [ ] No visual glitches

---

## 📝 Test Results Template

```markdown
## Test Results - [Date]

### Environment
- Node version: 
- CopilotKit version: 
- @ag-ui/client version: 

### Test 1: Patch Applied
- [ ] Pass  [ ] Fail
- Notes:

### Test 2: Query Sent
- [ ] Pass  [ ] Fail
- Notes:

### Test 3: Thinking Display
- [ ] Pass  [ ] Fail
- Notes:

### Test 4: Session Stats
- [ ] Pass  [ ] Fail
- Notes:

### Test 5: Tool Calls
- [ ] Pass  [ ] Fail
- Notes:

### Test 6: Text Messages
- [ ] Pass  [ ] Fail
- Notes:

### Overall Result
- [ ] All tests passed
- [ ] Some failures (see notes)
- [ ] Major issues

### Screenshots
[Attach screenshots of thinking display, session stats, tool calls]
```

---

## 🎯 Success Criteria

The implementation is successful if:

1. ✅ Patch applies without errors
2. ✅ At least 1 thinking message displays
3. ✅ Session stats display at end
4. ✅ No console errors
5. ✅ Tool calls work normally
6. ✅ Text messages work normally

If all 6 criteria are met → **SUCCESS!** 🎉

---

## 📞 Support

If issues persist:
1. Check `COPILOTKIT_PATCH.md` for detailed debugging
2. Review `PROTOTYPE_IMPLEMENTATION.md` for architecture details
3. Compare with `ACTIVITY_EVENT_ANALYSIS.md` for expected behavior

