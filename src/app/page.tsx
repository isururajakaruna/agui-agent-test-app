"use client";

import { CopilotKit } from "@copilotkit/react-core";
import EnhancedChatInterface from "@/components/chat/EnhancedChatInterface";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <CopilotKit
        runtimeUrl="/api/copilotkit"
        agent="chat_agent"
        showDevConsole={process.env.NEXT_PUBLIC_SHOW_DEV_CONSOLE === "true"}
      >
        <EnhancedChatInterface />
      </CopilotKit>
    </main>
  );
}

