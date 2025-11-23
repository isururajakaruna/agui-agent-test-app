# Saved Conversations Feature - Implementation Plan

## 🎯 **Overview**

Add the ability for users to save, view, and edit conversations with a dedicated UI.

---

## 📂 **Folder Structure**

```
apps/agent_ui/
├── conversations/          # Temporary (auto-saved during chat)
│   └── case123abc.json
└── conversations_saved/    # Permanent (user-saved conversations)
    ├── case123abc.json
    ├── case123abc_copy1.json
    ├── case123abc_copy2.json
    └── ...
```

### Behavior:
- **`conversations/`**: Auto-created during chat, can be cleaned up periodically
- **`conversations_saved/`**: User-saved conversations, persisted permanently
- **Duplicates**: If saving multiple times, append `_copy1`, `_copy2`, etc.

---

## 🎨 **UI Components**

### 1. **Save Button (Chat Window)**
- **Location**: Top-right of chat interface (near session ID)
- **Icon**: 💾 Save icon (from `lucide-react`)
- **Behavior**:
  - Copies current conversation from `conversations/` → `conversations_saved/`
  - Shows toast notification: "Conversation saved!"
  - If already saved, creates `_copyN` version
  - Button shows visual feedback (animation on save)

### 2. **Left Sidebar Menu**
- **Location**: Collapsible left sidebar (slide-in/out)
- **Trigger**: Menu icon (☰) in top-left corner
- **Width**: ~300px when open, 0px when closed
- **Contents**:
  - Header: "Saved Conversations"
  - List of saved conversations with:
    - Conversation ID (truncated)
    - First user message (preview)
    - Timestamp
    - Delete icon (trash)

### 3. **Saved Conversation View**
- **Layout**: Simplified chat interface
- **Display**:
  - **User messages**: Left-aligned, blue bubble
  - **Agent messages**: Right-aligned, gray bubble
  - **NO tool calls, thinking, or intermediate events**
- **Edit Mode**:
  - Hover over agent message → shows edit icon (pencil)
  - Click to enter edit mode (contentEditable or textarea)
  - Save button (✓) appears when editing
  - Cancel button (✗) to discard changes
- **Header**:
  - Conversation ID
  - "Back to Chat" button
  - Delete conversation button

---

## 🔧 **Backend API Routes**

### 1. **`POST /api/conversations/save`**
```typescript
// Request body
{
  conversationId: string;  // e.g., "case123abc"
}

// Response
{
  success: boolean;
  savedAs: string;  // e.g., "case123abc_copy1.json"
}
```

**Logic**:
- Check if conversation exists in `conversations/`
- If destination file exists in `conversations_saved/`, find next `_copyN`
- Copy file from temp to saved
- Return new filename

### 2. **`GET /api/conversations/saved`**
```typescript
// Response
{
  conversations: [
    {
      id: "case123abc",
      filename: "case123abc.json",
      preview: "Generate complete pitch deck...",
      timestamp: 1763837836.629,
      invocationCount: 3
    }
  ]
}
```

**Logic**:
- List all files in `conversations_saved/`
- Parse each JSON to extract metadata
- Return sorted by timestamp (newest first)

### 3. **`GET /api/conversations/saved/:id`**
```typescript
// Response
{
  id: "case123abc",
  invocations: [
    {
      invocation_id: "e-...",
      user_message: "text",
      agent_message: "text",
      timestamp: 1763837836.629
    }
  ]
}
```

**Logic**:
- Read JSON file from `conversations_saved/`
- Extract only `user_content.parts[0].text` and `final_response.parts[0].text`
- Return simplified structure

### 4. **`PUT /api/conversations/saved/:id/edit`**
```typescript
// Request body
{
  invocationId: string;  // "e-..."
  newAgentMessage: string;
}

// Response
{
  success: boolean;
}
```

**Logic**:
- Read JSON file from `conversations_saved/`
- Find invocation by `invocation_id`
- Update `final_response.parts[0].text`
- Write back to file

### 5. **`DELETE /api/conversations/saved/:id`**
```typescript
// Response
{
  success: boolean;
}
```

**Logic**:
- Delete file from `conversations_saved/`

---

## 📦 **Frontend Components**

### 1. **`SaveConversationButton.tsx`**
- Button component with save icon
- Calls `POST /api/conversations/save`
- Shows loading state and success feedback
- Props: `conversationId`

### 2. **`Sidebar.tsx`**
- Collapsible sidebar with animation
- Fetches saved conversations on open
- List of `SavedConversationItem` components
- Props: `isOpen`, `onClose`, `onSelectConversation`

### 3. **`SavedConversationItem.tsx`**
- Single item in saved conversations list
- Shows preview, timestamp, delete button
- Click to open conversation
- Props: `conversation`, `onSelect`, `onDelete`

### 4. **`SavedConversationView.tsx`**
- Simplified chat view for saved conversations
- Renders user/agent messages only
- Inline edit mode for agent messages
- Save edits back to file
- Props: `conversationId`

### 5. **`EditableMessage.tsx`**
- Agent message bubble with hover-to-edit
- Contenteditable or textarea for editing
- Save (✓) and Cancel (✗) buttons when editing
- Props: `message`, `onSave`, `invocationId`

---

## 🗂️ **State Management**

### Global State (Context or Zustand)
```typescript
interface SavedConversationsState {
  // Sidebar
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  
  // Current view
  currentView: 'chat' | 'saved-conversation';
  viewingConversationId: string | null;
  setViewingConversation: (id: string | null) => void;
  
  // Saved conversations list
  savedConversations: SavedConversation[];
  fetchSavedConversations: () => Promise<void>;
  
  // Current session
  currentConversationId: string | null;
  setCurrentConversationId: (id: string) => void;
}
```

---

## 🎬 **User Flow**

### Flow 1: Save Current Conversation
1. User is chatting with agent
2. User clicks save button (💾)
3. System copies conversation to `conversations_saved/`
4. Toast notification: "Conversation saved!"
5. User continues chatting
6. User clicks save again → creates `_copy1` version

### Flow 2: View Saved Conversation
1. User clicks menu icon (☰)
2. Sidebar slides in from left
3. User sees list of saved conversations
4. User clicks a conversation
5. Sidebar closes
6. Main view switches to simplified chat view
7. User sees only user/agent messages (no tools/thinking)

### Flow 3: Edit Agent Response
1. User is viewing saved conversation
2. User hovers over agent message
3. Edit icon (pencil) appears
4. User clicks edit icon
5. Message becomes editable (contenteditable/textarea)
6. Save (✓) and Cancel (✗) buttons appear
7. User edits text
8. User clicks ✓ → saves to JSON
9. Toast: "Message updated!"

### Flow 4: Return to Chat
1. User is viewing saved conversation
2. User clicks "Back to Chat" button
3. View switches back to main chat interface
4. Current session resumes

---

## 🎨 **Design Specs**

### Colors
- **Sidebar**: `bg-gray-50 dark:bg-gray-900`
- **User messages**: `bg-blue-100 text-blue-900`
- **Agent messages**: `bg-gray-100 text-gray-900`
- **Edit mode**: `border-blue-500 bg-blue-50`
- **Hover state**: `bg-gray-50`

### Animations
- **Sidebar slide**: `transition-transform duration-300 ease-in-out`
- **Save button**: Pulse animation on success
- **Edit mode**: Smooth border color transition

### Icons (from `lucide-react`)
- Save: `Save` icon
- Menu: `Menu` icon
- Edit: `Pencil` icon
- Delete: `Trash2` icon
- Check: `Check` icon
- Cancel: `X` icon
- Back: `ArrowLeft` icon

---

## 🔐 **Security & Validation**

1. **Filename sanitization**: Prevent path traversal (only alphanumeric + `_`)
2. **JSON validation**: Validate structure before saving edits
3. **Rate limiting**: Limit save operations to prevent abuse
4. **Max file size**: Limit conversation JSON size (e.g., 10MB)

---

## ✅ **Testing Checklist**

- [ ] Save conversation creates file in `conversations_saved/`
- [ ] Multiple saves create `_copy1`, `_copy2`, etc.
- [ ] Sidebar opens/closes smoothly
- [ ] Saved conversations list displays correctly
- [ ] Clicking conversation switches to view mode
- [ ] Edit mode activates on hover + click
- [ ] Saving edits updates JSON correctly
- [ ] Delete removes conversation
- [ ] "Back to Chat" returns to main interface
- [ ] Current session ID is tracked correctly

---

## 📝 **Implementation Order**

1. ✅ Create folder structure (`conversations_saved/`)
2. ✅ Backend API routes (5 routes)
3. ✅ Save button component
4. ✅ Sidebar component
5. ✅ Saved conversations list
6. ✅ Saved conversation view
7. ✅ Editable message component
8. ✅ State management
9. ✅ Testing & polish
10. ✅ Update `.gitignore` for `conversations_saved/`

---

## 🚀 **Future Enhancements**

- Search/filter saved conversations
- Export conversation as PDF/Markdown
- Share conversation (generate shareable link)
- Tag/categorize conversations
- Bulk delete
- Conversation rename


