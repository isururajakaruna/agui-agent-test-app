"use client";

import React from "react";
import { CopilotChat } from "@copilotkit/react-ui";
import { useCopilotAction } from "@copilotkit/react-core";
import Header from "@/components/ui/Header";
import GenericToolCard from "@/components/tools/GenericToolCard";

// List of tools to register (can be expanded dynamically)
const TOOLS_TO_RENDER = [
  "transfer_to_agent",
  "get_market_summary",
  "get_weather",
  "calculate",
  "search_knowledge",
  // Add more tool names here as needed
];

export default function ChatInterface() {
  // Register generic renderer for all tools
  TOOLS_TO_RENDER.forEach((toolName) => {
    useCopilotAction({
      name: toolName,
      available: "disabled", // Backend tool
      parameters: [], // Generic - accepts any parameters
      render: ({ args, result, status }) => (
        <GenericToolCard
          toolName={toolName}
          args={args}
          result={result}
          status={status}
        />
      ),
    });
  });

  return (
    <div className="flex flex-col h-screen w-full">
      <Header />
      <div className="flex-1 overflow-hidden p-4">
        <CopilotChat
          className="h-full rounded-2xl max-w-6xl mx-auto"
          labels={{
            title: "Agent Testing UI",
            initial: "Hi! I'm your AI assistant. How can I help you today?",
          }}
        />
      </div>
    </div>
  );
}

