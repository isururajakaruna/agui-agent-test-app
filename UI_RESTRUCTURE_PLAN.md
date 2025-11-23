# Agent UI - Major UI Restructure Plan

## 🎯 Objective
Improve navigation and organization by introducing a permanent left sidebar with two main sections:
1. **Chat** - Active conversation interface
2. **Saved Chats** - List and manage saved conversations

---

## 📐 New Layout Structure

```
┌───────────────────────────────────────────────────────────────┐
│  Agent Testing UI      Session: abc123    ● Connected         │
├────┬──────────────────────────────────────────────────────────┤
│    │                                                           │
│ 💬 │                                                           │
│    │              Main Content Area                            │
│ 📁 │         (Dynamic: Chat or Saved List)                    │
│    │                                                           │
│    │                                                           │
└────┴──────────────────────────────────────────────────────────┘
```

---

## 🗂️ Components Breakdown

### **1. Permanent Left Sidebar** (New)
**File:** `src/components/navigation/PermanentSidebar.tsx`

**Features:**
- Width: 60px
- Always visible (not collapsible)
- Two navigation icons:
  - 💬 **Chat** - Navigate to active chat
  - 📁 **Saved** - Navigate to saved chats list
- Active state highlighting
- Tooltips on hover

**Props:**
```typescript
interface PermanentSidebarProps {
  activeView: 'chat' | 'saved';
  onNavigate: (view: 'chat' | 'saved') => void;
}
```

---

### **2. Saved Chats List View** (New)
**File:** `src/components/saved/SavedChatsList.tsx`

**Features:**
- Grid/List layout of all saved conversations
- Each card displays:
  - Conversation preview (first user message)
  - Timestamp (relative: "2 hours ago", "Yesterday")
  - Conversation ID (first 8 chars)
  - Message count badge
- Action buttons (per card):
  - 👁️ View (opens in viewer)
  - 📥 Export (downloads `.evalset.json`)
  - 🗑️ Delete (with confirmation)
- Search bar (filter by ID or content)
- Sort dropdown (Date: Newest/Oldest, Name: A-Z)
- Empty state: "No saved conversations yet"

**Props:**
```typescript
interface SavedChatsListProps {
  onViewConversation: (id: string) => void;
}
```

---

### **3. Saved Chat Card** (New)
**File:** `src/components/saved/SavedChatCard.tsx`

**Features:**
- Compact card design
- Hover effects
- Action buttons visible on hover
- Loading states for export/delete

**Props:**
```typescript
interface SavedChatCardProps {
  id: string;
  title: string;
  preview: string;
  timestamp: number;
  messageCount: number;
  onView: () => void;
  onExport: () => void;
  onDelete: () => void;
}
```

---

### **4. Updated Header** (Modified)
**File:** `src/components/ui/Header.tsx`

**Changes:**
- Remove hamburger menu icon (sidebar is permanent)
- Keep session ID display (only when in Chat view)
- Keep Connected status
- Save button conditional:
  - Visible: Chat view with active session
  - Hidden: Saved view

---

### **5. Main Layout Wrapper** (New)
**File:** `src/components/layout/MainLayout.tsx`

**Features:**
- Manages routing between Chat and Saved views
- Renders PermanentSidebar + dynamic content
- Handles navigation state

**Structure:**
```typescript
<div className="flex h-screen">
  <PermanentSidebar activeView={view} onNavigate={setView} />
  <div className="flex-1 flex flex-col">
    <Header ... />
    <main className="flex-1 overflow-auto">
      {view === 'chat' ? <ChatView /> : <SavedChatsList />}
    </main>
  </div>
</div>
```

---

### **6. Updated Context** (Modified)
**File:** `src/contexts/SavedConversationsContext.tsx`

**Changes:**
- Remove `sidebarOpen`, `toggleSidebar` (no longer collapsible)
- Add `currentView: 'chat' | 'saved'`
- Add `setCurrentView(view: 'chat' | 'saved')`
- Keep existing `viewingConversationId`, `savedConversations`, etc.

---

## 🔄 Navigation Flow

### **User Journey 1: Chat → Save → View Saved**
1. User is in Chat view (default)
2. Chats with agent
3. Clicks "Save" button in header
4. Toast: "Conversation saved!"
5. User clicks 📁 icon in left sidebar
6. Navigates to Saved Chats List
7. Sees their saved conversation at the top
8. Clicks 👁️ View
9. Opens in SavedConversationView (existing component)

### **User Journey 2: Browse Saved Chats → Export**
1. User clicks 📁 icon in left sidebar
2. Sees grid of saved conversations
3. Uses search to filter
4. Hovers over a card
5. Clicks 📥 Export
6. `.evalset.json` file downloads
7. Toast: "Exported <filename>.evalset.json"

### **User Journey 3: Delete Saved Chat**
1. User is in Saved Chats List
2. Hovers over a card
3. Clicks 🗑️ Delete
4. Modal: "Are you sure? This cannot be undone."
5. Confirms
6. Card fades out and is removed
7. Toast: "Conversation deleted"

---

## 🎨 Visual Design

### **Color Scheme:**
- **Active Navigation Item:** Blue gradient (`bg-blue-500`)
- **Hover State:** Light gray (`hover:bg-gray-100`)
- **Card Background:** White with subtle shadow
- **Action Buttons:** 
  - View: Blue (`text-blue-500`)
  - Export: Green (`text-green-500`)
  - Delete: Red (`text-red-500`)

### **Spacing:**
- Sidebar width: `60px`
- Main content padding: `24px`
- Card gap: `16px`
- Button spacing: `8px`

### **Typography:**
- Card title: `text-base font-semibold`
- Preview: `text-sm text-gray-600 line-clamp-2`
- Timestamp: `text-xs text-gray-400`
- Conversation ID: `text-xs font-mono text-gray-500`

---

## 📦 File Structure (New/Modified)

```
apps/agent_ui/src/
├── components/
│   ├── layout/
│   │   └── MainLayout.tsx           ✨ NEW
│   ├── navigation/
│   │   └── PermanentSidebar.tsx     ✨ NEW
│   ├── saved/
│   │   ├── SavedChatsList.tsx       ✨ NEW
│   │   ├── SavedChatCard.tsx        ✨ NEW
│   │   ├── SavedConversationView.tsx (existing)
│   │   └── EditableMessage.tsx       (existing)
│   ├── chat/
│   │   └── EnhancedChatInterface.tsx (existing)
│   └── ui/
│       └── Header.tsx                🔧 MODIFIED
├── contexts/
│   └── SavedConversationsContext.tsx 🔧 MODIFIED
└── app/
    └── page.tsx                      🔧 MODIFIED
```

---

## 🚀 Implementation Steps

### **Phase 1: Core Navigation Structure**
1. Create `PermanentSidebar.tsx`
2. Create `MainLayout.tsx`
3. Update `SavedConversationsContext.tsx` (add view state)
4. Update `page.tsx` to use `MainLayout`

### **Phase 2: Saved Chats List**
5. Create `SavedChatsList.tsx`
6. Create `SavedChatCard.tsx`
7. Implement grid layout and search/sort

### **Phase 3: Actions & Integration**
8. Implement Export functionality (reuse existing logic)
9. Implement Delete functionality (with confirmation)
10. Implement View navigation
11. Update Header to hide/show save button conditionally

### **Phase 4: Polish**
12. Add loading states
13. Add empty states
14. Add animations (fade in/out for cards)
15. Add toasts for user feedback
16. Test all navigation flows

---

## ✅ Success Criteria

- ✅ Left sidebar always visible with 2 icons
- ✅ Chat view works as before
- ✅ Saved Chats List displays all saved conversations
- ✅ Export downloads correct `.evalset.json` file
- ✅ Delete removes conversation (with confirmation)
- ✅ View opens conversation in viewer
- ✅ Search filters conversations
- ✅ Sort orders conversations correctly
- ✅ Navigation is smooth and intuitive
- ✅ Mobile responsive (sidebar stacks or collapses)

---

## 🎯 Next Steps

Ready to implement? Let's start with Phase 1!

