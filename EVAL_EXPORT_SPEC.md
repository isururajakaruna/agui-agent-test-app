# Eval Export Format - Final Specifications

## ✅ **Complete ADK-Compatible Structure**

### **Top Level (eval_set):**
```json
{
  "eval_set_id": "abc12345",  // Random 8-char alphanumeric
  "name": "abc12345",          // Same as eval_set_id
  "eval_cases": [...],
  "creation_timestamp": 1234567890.123
}
```

### **Eval Case Level:**
```json
{
  "eval_id": "full-conversation-uuid",
  "conversation": [...],
  "session_input": {
    "app_name": "agent_ui",
    "user_id": "user"  // ✅ Fixed: was "default-user"
  },
  "creation_timestamp": 1234567890.123
}
```

### **Invocation Level:**
```json
{
  "invocation_id": "e-uuid",
  "user_content": {
    "parts": [{"text": "..."}],
    "role": "user"
  },
  "final_response": {
    "parts": [{"text": "..."}],
    "role": "model"
  },
  "intermediate_data": {},  // ✅ Empty object (no invocation_events)
  "creation_timestamp": 1234567890.123
}
```

## 📦 **File Naming:**
- Filename: `<eval_set_id>.evalset.json`
- Example: `abc12345.evalset.json`
- The `eval_set_id` is randomly generated, NOT derived from conversation ID

## 🔧 **Key Implementation Details:**

1. **eval_set_id Generation:**
   - Random 8-character alphanumeric string
   - Uses characters: `a-z` and `0-9`
   - Generated fresh for each export

2. **session_input.user_id:**
   - Default value: `"user"`
   - NOT `"default-user"`

3. **intermediate_data:**
   - Always an empty object `{}`
   - `invocation_events` are stripped out (internal execution details)

4. **Eval format purpose:**
   - Input/output pairs for evaluation
   - User queries + Agent responses
   - No internal execution traces

## ✅ **Validation:**
All levels verified against ADK reference:
- ✅ Level 0: eval_set structure
- ✅ Level 1: eval_case structure  
- ✅ Level 2: invocation structure
- ✅ Level 3: user_content / final_response
- ✅ Level 4: parts array
- ✅ Value formats (timestamps, IDs, roles)

## 📊 **Comparison Results:**
```
INVOCATION STRUCTURE COMPARISON
✅ PERFECT MATCH - All properties present
✅ CORRECT: intermediate_data is empty {}
✅ All roles match ("user", "model")
✅ All types match (string, number, object, array)
```

## 🚀 **Usage:**
Users can now:
1. Save conversations in the UI
2. Download as ADK-compatible eval sets
3. Use directly with ADK eval tools
4. No manual conversion needed

