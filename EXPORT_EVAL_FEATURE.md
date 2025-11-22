# Export Conversations as ADK Eval Feature

## Overview
This feature allows users to export saved conversations in ADK-compatible eval format for evaluation and testing purposes.

## Implementation Details

### 1. Export Utility (`src/lib/evalExport.ts`)
A comprehensive utility library that handles:
- **Conversion**: Transforms saved conversations into ADK eval case format
- **Single Export**: Downloads individual conversations as `.eval.json` files
- **Batch Export**: Downloads multiple conversations as `.evalset.json` files
- **Metadata**: Adds required ADK eval metadata (eval_id, session_input, timestamps)

### 2. ADK Eval Format Structure
The exported files follow the ADK eval structure from `eval-reference-evalset.json`:

```json
{
  "eval_id": "conversation-uuid",
  "conversation": [...invocations...],
  "session_input": {
    "app_name": "agent_ui",
    "user_id": "default-user"
  },
  "creation_timestamp": 1234567890.123
}
```

### 3. Download Locations

#### A. Sidebar (SavedConversationItem)
- **UI**: Blue download icon appears on hover next to the delete button
- **Action**: Downloads the conversation as a single eval case
- **File**: `{conversation-id}.eval.json`

#### B. Conversation View (SavedConversationView)
- **UI**: Blue download button in the header next to delete
- **Action**: Downloads the currently viewed conversation as an eval case
- **File**: `{conversation-id}.eval.json`

### 4. API Endpoint
**New Route**: `/api/conversations/saved/:id/raw`
- Returns the raw, unmodified conversation JSON
- Used by download handlers to get the complete conversation structure
- Preserves all `intermediate_data`, `invocation_events`, and metadata

## User Experience

### Download from Sidebar
1. Navigate to saved conversations in the sidebar
2. Hover over any conversation item
3. Click the blue **download icon** (appears next to delete)
4. File downloads automatically as `{id}.eval.json`

### Download from Conversation View
1. Open a saved conversation
2. Click the blue **Download** button in the header (next to delete)
3. File downloads automatically as `{id}.eval.json`

## File Format
The downloaded eval file contains:
- **eval_id**: The conversation UUID
- **conversation**: Complete array of invocations with:
  - `user_content`: User messages
  - `final_response`: Agent responses
  - `intermediate_data`: Tool calls, thinking events, etc.
  - `invocation_id`: Unique ID for each turn
  - `creation_timestamp`: Unix timestamp
- **session_input**: App metadata
  - `app_name`: "agent_ui"
  - `user_id`: "default-user" (can be customized)
- **creation_timestamp**: Export time

## Use Cases
1. **Evaluation**: Import conversations into ADK eval pipelines
2. **Testing**: Use real conversations as test cases
3. **Analysis**: Analyze agent behavior and responses
4. **Sharing**: Share conversation data with team members
5. **Backup**: Archive important conversations in eval format

## Future Enhancements
- Batch export: Select multiple conversations and export as `.evalset.json`
- Custom metadata: Allow users to specify `app_name` and `user_id`
- Export filtering: Export only specific invocations or time ranges
- Import: Re-import eval files back into saved conversations

