"use client";

import { CopilotKit } from "@copilotkit/react-core";
import ChatInterface from "@/components/chat/ChatInterface";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <CopilotKit
        runtimeUrl="/api/copilotkit"
        agent="chat_agent"
        showDevConsole={process.env.NEXT_PUBLIC_SHOW_DEV_CONSOLE === "true"}
      >
        <ChatInterface />
      </CopilotKit>
    </main>
  );
}

