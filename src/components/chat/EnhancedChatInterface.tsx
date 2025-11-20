"use client";

import React, { useState, useEffect } from "react";
import { CopilotChat } from "@copilotkit/react-ui";
import { useCopilotAction, useCopilotContext } from "@copilotkit/react-core";
import Header from "@/components/ui/Header";
import GenericToolCard from "@/components/tools/GenericToolCard";
import ThinkingCard from "@/components/cards/ThinkingCard";

// Note: "transfer_to_agent" is omitted - it's an internal ADK routing mechanism

function ChatWithMetadata() {
  // Get thread ID from CopilotKit context
  const context = useCopilotContext();
  const [threadId, setThreadId] = useState<string | null>(null);

  // Extract thread ID from context
  useEffect(() => {
    // @ts-ignore - CopilotKit context structure may vary
    const id = context?.threadId || context?.chatId || null;
    if (id && id !== threadId) {
      console.log('[EnhancedChatInterface] Thread ID detected:', id);
      setThreadId(id);
    }
  }, [context, threadId]);

  // Register generic renderer for all tools
  useCopilotAction({
    name: "get_market_summary",
    available: "disabled",
    parameters: [],
    render: ({ args, result, status }) => (
      <GenericToolCard toolName="get_market_summary" args={args} result={result} status={status} />
    ),
  });

  useCopilotAction({
    name: "load_client_profile",
    available: "disabled",
    parameters: [],
    render: ({ args, result, status }) => (
      <GenericToolCard toolName="load_client_profile" args={args} result={result} status={status} />
    ),
  });

  useCopilotAction({
    name: "match_products_to_market_view",
    available: "disabled",
    parameters: [],
    render: ({ args, result, status }) => (
      <GenericToolCard toolName="match_products_to_market_view" args={args} result={result} status={status} />
    ),
  });

  useCopilotAction({
    name: "generate_pitch_deck_presentation",
    available: "disabled",
    parameters: [],
    render: ({ args, result, status }) => (
      <GenericToolCard toolName="generate_pitch_deck_presentation" args={args} result={result} status={status} />
    ),
  });

  useCopilotAction({
    name: "get_weather",
    available: "disabled",
    parameters: [],
    render: ({ args, result, status }) => (
      <GenericToolCard toolName="get_weather" args={args} result={result} status={status} />
    ),
  });

  useCopilotAction({
    name: "calculate",
    available: "disabled",
    parameters: [],
    render: ({ args, result, status }) => (
      <GenericToolCard toolName="calculate" args={args} result={result} status={status} />
    ),
  });

  useCopilotAction({
    name: "search_knowledge",
    available: "disabled",
    parameters: [],
    render: ({ args, result, status }) => (
      <GenericToolCard toolName="search_knowledge" args={args} result={result} status={status} />
    ),
  });

  // Register custom renderer for thinking_step (ACTIVITY_SNAPSHOT with THINKING)
  useCopilotAction({
    name: "thinking_step",
    available: "disabled",
    parameters: [],
    render: ({ args }) => <ThinkingCard args={args} />,
  });

  // Session stats card removed - not needed for UI

  return (
    <div className="flex flex-col h-screen w-full">
      <Header />
      <div className="flex-1 overflow-hidden p-4">
        <div className="h-full max-w-6xl mx-auto flex gap-4">
          {/* Main Chat Area */}
          <div className="flex-1 min-w-0">
            <CopilotChat
              className="h-full rounded-2xl"
              labels={{
                title: "Agent Testing UI",
                initial: "Hi! I'm your AI assistant. How can I help you today?",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatWithMetadata;

