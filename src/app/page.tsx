"use client";

import { CopilotKit } from "@copilotkit/react-core";
import EnhancedChatInterface from "@/components/chat/EnhancedChatInterface";
import { SavedConversationsProvider, useSavedConversations } from "@/contexts/SavedConversationsContext";
import { Sidebar } from "@/components/conversations/Sidebar";
import { SavedConversationView } from "@/components/conversations/SavedConversationView";

function AppContent() {
  const { currentView } = useSavedConversations();

  return (
    <>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex min-h-screen flex-col">
        {currentView === 'saved-conversation' ? (
          <SavedConversationView />
        ) : (
          <CopilotKit
            runtimeUrl="/api/copilotkit"
            agent="chat_agent"
            showDevConsole={process.env.NEXT_PUBLIC_SHOW_DEV_CONSOLE === "true"}
          >
            <EnhancedChatInterface />
          </CopilotKit>
        )}
      </main>
    </>
  );
}

export default function Home() {
  return (
    <SavedConversationsProvider>
      <AppContent />
    </SavedConversationsProvider>
  );
}

