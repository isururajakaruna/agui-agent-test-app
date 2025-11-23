# Feedback and Rating Feature for Saved Conversations

## Overview
Implemented a user feedback system that allows rating (1-5 stars) and commenting on agent responses **only in saved conversations**, not in live chat.

## Implementation Details

### 1. Data Structure
Feedback is stored in the `final_response` object of each invocation in the conversation JSON:

```json
{
  "invocation_id": "e-...",
  "user_content": { ... },
  "final_response": {
    "parts": [ ... ],
    "role": "model",
    "_user_rating": 4,        // Number 1-5
    "_user_feedback": "Great response with helpful details"  // String (optional)
  },
  "intermediate_data": { ... }
}
```

### 2. Components Created

#### `SavedMessageFeedback.tsx`
- **Location:** `apps/agent_ui/src/components/conversations/SavedMessageFeedback.tsx`
- **Purpose:** UI component for adding/editing feedback on saved agent messages
- **Features:**
  - Collapsed state: Shows existing rating stars + summary
  - Expanded state: Star rating selector (1-5) + comment textarea
  - Save/Cancel buttons
  - Success feedback animation

#### `SavedConversationView.tsx` (Updated)
- **Integration:** Added `<SavedMessageFeedback>` component below each agent message
- **Props passed:**
  - `conversationId`: The saved conversation ID
  - `invocationId`: The specific invocation ID for this message
  - `existingRating`: Current rating (if any)
  - `existingComment`: Current feedback text (if any)
  - `onUpdate`: Callback to refresh the conversation after saving

### 3. API Endpoints

#### `POST /api/conversations/saved/feedback`
- **Location:** `apps/agent_ui/src/app/api/conversations/saved/feedback/route.ts`
- **Purpose:** Save user rating and feedback to the conversation JSON file
- **Body:**
  ```json
  {
    "conversationId": "abc123",
    "invocationId": "e-uuid",
    "rating": 4,
    "comment": "Optional feedback text"
  }
  ```
- **Validation:**
  - `rating` must be 1-5
  - Updates the `_user_rating` and `_user_feedback` properties
  - Writes back to `conversations_saved/<conversationId>.json`

#### `GET /api/conversations/saved/[id]` (Updated)
- **Location:** `apps/agent_ui/src/app/api/conversations/saved/[id]/route.ts`
- **Changes:** Now extracts and returns `user_rating` and `user_feedback` from `final_response`
- **Response includes:**
  ```json
  {
    "invocation_id": "...",
    "user_message": "...",
    "agent_message": "...",
    "timestamp": 123456,
    "user_rating": 4,          // if exists
    "user_feedback": "..."     // if exists
  }
  ```

### 4. User Flow

1. **View Saved Conversation:**
   - User navigates to "Saved Chats" → clicks "View" on a conversation
   - Each agent response shows existing rating (if any) below the message

2. **Add Feedback:**
   - Click "Add feedback" link below an agent message
   - Feedback panel expands with star rating and comment field
   - Select rating (1-5 stars), optionally add comment
   - Click "Save Feedback"

3. **Edit Feedback:**
   - If feedback exists, shows "Edit feedback" instead
   - Opens pre-filled with existing rating and comment
   - Can update and save again

4. **Persistence:**
   - Feedback is immediately saved to the JSON file
   - Appears in all future views of this conversation
   - Included in exported eval sets (as properties of `final_response`)

## Files Modified/Created

### Created:
- `apps/agent_ui/src/components/conversations/SavedMessageFeedback.tsx`
- `apps/agent_ui/src/app/api/conversations/saved/feedback/route.ts`

### Modified:
- `apps/agent_ui/src/components/conversations/SavedConversationView.tsx`
- `apps/agent_ui/src/app/api/conversations/saved/[id]/route.ts`

### Cleaned Up (Reverted):
- `apps/agent_ui/src/components/chat/CustomAssistantMessage.tsx` (removed live chat feedback)
- `apps/agent_ui/src/lib/ConversationRecorder.ts` (reverted message ID mapping)

## Design Decisions

1. **Saved Conversations Only:** Feedback is only available in the saved conversation view, not during live chat. This ensures users provide thoughtful feedback after reviewing the full conversation.

2. **Per-Invocation Feedback:** Each agent response can have its own rating/comment, allowing granular evaluation of different parts of the conversation.

3. **Simple Data Structure:** Feedback is stored as top-level properties (`_user_rating`, `_user_feedback`) in the `final_response` object, prefixed with `_` to indicate they are metadata, not part of the agent's response.

4. **5-Star Rating System:** Standard, intuitive rating system (1-5 stars) with optional text feedback.

5. **In-Place Editing:** Users can view and edit feedback directly in the conversation view without modal dialogs.

## Future Enhancements
- Export feedback data in eval format for analysis
- Aggregate rating statistics across conversations
- Filter/sort conversations by rating
- Add feedback to exported eval sets as evaluation metrics

