# Evaluation Data Analysis: Bridge vs. Required Format

## 📋 **Goal**
Ensure data received at `agent_ui` from the bridge contains enough information to create eval reference files similar to `eval-reference.json`.

---

## 🎯 **Required Data Structure (from eval-reference.json)**

```json
{
  "eval_id": "case15f662",
  "conversation": [
    {
      "invocation_id": "e-92057f23-6f53-407c-b067-b3251d1f776a",
      "user_content": {
        "parts": [{"text": "hi"}],
        "role": "user"
      },
      "final_response": {
        "parts": [{"text": "Hello! ..."}],
        "role": "model"
      },
      "intermediate_data": {
        "invocation_events": [
          {
            "author": "root_agent",
            "content": {
              "parts": [
                {
                  "function_call": {
                    "id": "adk-xxx",
                    "args": {"n": 10},
                    "name": "find_nth_prime"
                  },
                  "thought_signature": "CrQCAd..."
                }
              ],
              "role": "model"
            }
          },
          {
            "author": "root_agent",
            "content": {
              "parts": [
                {
                  "function_response": {
                    "id": "adk-xxx",
                    "name": "find_nth_prime",
                    "response": {"result": 29}
                  }
                }
              ],
              "role": "user"
            }
          }
        ]
      },
      "creation_timestamp": 1763829465.399381
    }
  ],
  "session_input": {
    "app_name": "agent1",
    "user_id": "user"
  },
  "creation_timestamp": 1763829947.579218
}
```

---

## ✅ **What the Bridge Currently Captures**

### 1. **Session/Thread Information** ✅
- **thread_id** - Available via CopilotKit context
- **run_id** - Generated per execution
- **Timestamps** - `session_start_time` tracked in translator

### 2. **User Messages** ✅
- Received in `RunAgentInput` from frontend
- Contains: `messages` array with `role` and `content`
- **Available in:** `main_direct.py` request body

### 3. **Tool Calls (function_call)** ✅
- **Captured in:** `_handle_function_call()` in `protocol_translator.py`
- **Contains:**
  - `tool_call_id` (function_call.id)
  - `tool_name` (function_call.name)
  - `tool_args` (function_call.args)
- **Logged in:** Bridge logs and Agent Engine raw logs

### 4. **Tool Results (function_response)** ✅
- **Captured in:** `_handle_function_response()` in `protocol_translator.py`
- **Contains:**
  - `tool_call_id` (function_response.id)
  - `tool_name` (function_response.name)
  - `response` (function_response.response)
- **Logged in:** Bridge logs and Agent Engine raw logs

### 5. **Thinking Data (thought_signature)** ✅
- **Captured in:** `_handle_text_message()` when `thought_signature` present
- **Contains:**
  - `thoughtsTokenCount` (usage_metadata.thoughts_token_count)
  - `totalTokenCount` (usage_metadata.total_token_count)
  - `model` (model_version)
  - **Missing:** `thought_signature` binary data itself
- **Stored in:** `metadata_store.thinking[]` array

### 6. **Assistant Responses** ✅
- **Captured in:** `_handle_text_message()` as TEXT_MESSAGE_CONTENT
- **Contains:** Text chunks (deltas)
- **Streamed to:** Frontend as SSE events

### 7. **Session Statistics** ✅
- **Captured in:** End of `translate_stream()`
- **Contains:**
  - `totalThinkingTokens`
  - `totalToolCalls`
  - `durationSeconds`
- **Stored in:** `metadata_store.session_stats`

---

## ❌ **What's Missing for Full Eval Format**

| Required Field | Status | Location/Solution |
|----------------|--------|-------------------|
| **eval_id** | ❌ Not generated | Need to generate unique eval ID per session |
| **invocation_id** | ❌ Not tracked | Need to generate per user message (could use run_id) |
| **thought_signature (binary)** | ⚠️ Partial | We track token count but not the actual binary signature |
| **author** field | ❌ Not tracked | Agent Engine has this ("root_agent") but we don't capture it |
| **User message preservation** | ⚠️ Frontend only | Backend doesn't store user messages currently |
| **Complete conversation history** | ❌ Not stored | No persistence of full conversation |

---

## 📊 **Data Flow Analysis**

### **Current Flow:**
```
User Message → Frontend → Bridge → Agent Engine
                ↓
Agent Engine SSE → Bridge (protocol_translator) → Frontend
                                ↓
                          metadata_store (partial)
```

### **What Gets Logged:**
1. ✅ **Bridge Logs** (`logs/events_*.log`):
   - TEXT_MESSAGE_START/CONTENT/END
   - TOOL_CALL_START/ARGS/END
   - TOOL_CALL_RESULT
   - Thinking tokens

2. ✅ **Agent Engine Raw Logs** (`logs/agent_engine_raw_*.log`):
   - Full JSON from Agent Engine
   - Contains `function_call`, `function_response`
   - Contains `thought_signature` (binary)
   - Contains `author` field

3. ⚠️ **Metadata Store** (in-memory):
   - Thinking events (token counts only)
   - Session stats
   - **Missing:** Full message history, tool calls, responses

---

## 🔧 **Recommendations**

### **Option 1: Enhanced Metadata Store** (Recommended)
Store complete conversation data in the bridge:

```python
# In metadata_store.py
def add_user_message(self, thread_id, invocation_id, content, timestamp):
    self._store[thread_id]["messages"].append({
        "type": "user",
        "invocation_id": invocation_id,
        "content": content,
        "timestamp": timestamp
    })

def add_tool_call(self, thread_id, tool_call_id, name, args, timestamp):
    self._store[thread_id]["tool_calls"].append({
        "id": tool_call_id,
        "name": name,
        "args": args,
        "timestamp": timestamp
    })

def add_tool_result(self, thread_id, tool_call_id, name, response, timestamp):
    self._store[thread_id]["tool_results"].append({
        "id": tool_call_id,
        "name": name,
        "response": response,
        "timestamp": timestamp
    })

def add_assistant_message(self, thread_id, content, timestamp):
    self._store[thread_id]["assistant_messages"].append({
        "content": content,
        "timestamp": timestamp
    })
```

### **Option 2: Parse Existing Logs** (Simpler)
Since we already log everything to files, create a log parser:

```python
# New file: eval_generator.py
def parse_bridge_logs(log_file: str) -> dict:
    """Parse bridge logs to extract eval data."""
    pass

def parse_agent_engine_logs(log_file: str) -> dict:
    """Parse Agent Engine logs to extract raw events."""
    pass

def generate_eval_json(thread_id: str, bridge_log: str, engine_log: str) -> dict:
    """Combine logs to create eval-reference.json format."""
    pass
```

### **Option 3: Frontend Aggregation** (Current State)
Agent UI already receives all events. Add a recorder:

```typescript
// In agent_ui
class ConversationRecorder {
  recordUserMessage(message: string) { ... }
  recordToolCall(name: string, args: any, id: string) { ... }
  recordToolResult(id: string, result: any) { ... }
  recordThinking(tokens: number) { ... }
  exportToEvalFormat() { ... }
}
```

---

## ✅ **Current State: What You CAN Already Do**

### **From Bridge Logs:**
1. ✅ Extract tool calls (name, args, id)
2. ✅ Extract tool results (name, response, id)
3. ✅ Extract thinking token counts
4. ✅ Extract assistant text responses
5. ✅ Track session duration and stats

### **From Agent Engine Raw Logs:**
1. ✅ Get complete Agent Engine JSON
2. ✅ Get `thought_signature` binary data
3. ✅ Get `author` field
4. ✅ Get exact event structure

### **From Frontend:**
1. ✅ User messages (sent to bridge)
2. ✅ Thread ID (from CopilotKit)
3. ✅ Message timestamps

---

## 🎯 **Minimal Implementation for Eval Export**

If you want eval export **now**, here's the quickest path:

### **1. Frontend: Add Download Button**
```typescript
function exportConversationToEval() {
  const evalData = {
    eval_id: `case${generateRandomId()}`,
    conversation: copilotMessages.map(msg => ({
      invocation_id: msg.id,
      user_content: { parts: [{ text: msg.content }], role: "user" },
      // ... build from CopilotKit message history
    })),
    session_input: { app_name: "agent_ui", user_id: "user" },
    creation_timestamp: Date.now() / 1000
  };
  
  // Download as JSON
  downloadJSON(evalData, `eval-${evalData.eval_id}.json`);
}
```

### **2. Backend: Add Export Endpoint**
```python
@app.get("/export/{thread_id}")
async def export_eval(thread_id: str):
    """Export conversation in eval-reference.json format."""
    metadata = metadata_store.get_metadata(thread_id)
    
    # Parse logs to build eval structure
    eval_data = {
        "eval_id": f"case{thread_id[:8]}",
        "conversation": build_conversation_from_metadata(metadata),
        "session_input": {"app_name": "agent_ui", "user_id": "user"},
        "creation_timestamp": time.time()
    }
    
    return eval_data
```

---

## 📝 **Summary**

| Data Point | Currently Available? | Where? | Action Needed |
|------------|---------------------|---------|---------------|
| User messages | ✅ Yes | Frontend | Store in backend |
| Assistant responses | ✅ Yes | Bridge logs | Aggregate per message |
| Tool calls | ✅ Yes | Bridge logs | Already captured |
| Tool results | ✅ Yes | Bridge logs | Already captured |
| Thinking tokens | ✅ Yes | Metadata store | Already captured |
| Thought signature | ✅ Yes | Agent Engine logs | Parse from logs |
| Timestamps | ✅ Yes | All logs | Already captured |
| Invocation IDs | ❌ No | - | Generate per message |
| Author field | ✅ Yes | Agent Engine logs | Parse from logs |

**Verdict:** ✅ **You have ALL the raw data needed!** You just need to:
1. Store user messages in backend
2. Aggregate events per invocation (user message)
3. Add an export endpoint or log parser

Would you like me to implement Option 1 (Enhanced Metadata Store) or Option 2 (Log Parser)?

