"use client";

import React, { useState, useEffect, useRef } from "react";
import { CopilotChat } from "@copilotkit/react-ui";
import { useCopilotAction, useCopilotContext } from "@copilotkit/react-core";
import GenericToolCard from "@/components/tools/GenericToolCard";
import ThinkingCard from "@/components/cards/ThinkingCard";
import ThinkingIndicator from "@/components/chat/ThinkingIndicator";
import CustomAssistantMessage from "@/components/chat/CustomAssistantMessage";
import { useSavedConversations } from "@/contexts/SavedConversationsContext";

// Note: "transfer_to_agent" is omitted - it's an internal ADK routing mechanism

function ChatWithMetadata() {
  // Get thread ID from CopilotKit context
  const context = useCopilotContext();
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isAgentWorking, setIsAgentWorking] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const workingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { setCurrentConversationId, setHasMessages, currentView } = useSavedConversations();

  // Extract thread ID from context and set it globally
  useEffect(() => {
    // @ts-ignore - CopilotKit context structure may vary
    const id = context?.threadId || context?.chatId || null;
    if (id && id !== threadId) {
      console.log('[EnhancedChatInterface] Thread ID detected:', id);
      setThreadId(id);
      setCurrentConversationId(id); // Set in global context for SaveButton
    }
  }, [context, threadId, setCurrentConversationId]);

  // Track agent working state from CopilotKit context
  useEffect(() => {
    // @ts-ignore - CopilotKit context structure
    const isLoading = context?.isLoading;
    // @ts-ignore
    const inProgress = context?.inProgress;
    // @ts-ignore
    const isProcessing = context?.isProcessing;
    // @ts-ignore
    const messages = context?.messages || [];
    
    // Check if the last message is from the user (agent should respond)
    const lastMessage = messages[messages.length - 1];
    const isLastMessageFromUser = lastMessage?.role === 'user';
    
    // Check if last assistant message seems incomplete (no text content yet, only thinking/tools)
    const isLastMessageIncomplete = 
      lastMessage?.role === 'assistant' && 
      (!lastMessage?.content || lastMessage?.content.trim() === '');
    
    // Show indicator if:
    // 1. Explicitly loading/processing
    // 2. Last message from user (waiting for response)
    // 3. Last message is incomplete assistant response
    const shouldShowWorking = 
      isLoading || 
      inProgress || 
      isProcessing ||
      isLastMessageFromUser ||
      isLastMessageIncomplete;
    
    if (shouldShowWorking) {
      // Clear any existing timeout
      if (workingTimeoutRef.current) {
        clearTimeout(workingTimeoutRef.current);
      }
      setIsAgentWorking(true);
      console.log('[EnhancedChatInterface] Agent working indicator: ON');
    } else {
      // Add a small delay before hiding to avoid flickering
      if (workingTimeoutRef.current) {
        clearTimeout(workingTimeoutRef.current);
      }
      workingTimeoutRef.current = setTimeout(() => {
        setIsAgentWorking(false);
        console.log('[EnhancedChatInterface] Agent working indicator: OFF');
      }, 800);
    }
    
    return () => {
      if (workingTimeoutRef.current) {
        clearTimeout(workingTimeoutRef.current);
      }
    };
  }, [context]);

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

  // Track if conversation has started (once started, never show empty state again)
  useEffect(() => {
    // @ts-ignore - Check multiple possible locations for messages
    const messages = context?.messages || context?.chatComponentsCache?.messages || [];
    
    // Update hasMessages state for Save button
    setHasMessages(messages.length > 0);
    
    // Only hide empty state when we actually have messages
    if (messages.length > 0) {
      setConversationStarted(true);
      console.log('[EnhancedChatInterface] Conversation started - hiding empty state');
    }
  }, [context, setHasMessages]);

  // @ts-ignore
  const messages = context?.messages || [];
  
  // Show empty state only if no threadId yet (truly fresh start)
  const showEmptyState = !threadId;
  
  // Debug logging
  console.log('[EnhancedChatInterface] threadId:', threadId, 'showEmptyState:', showEmptyState);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-hidden p-4">
        <div className="h-full max-w-6xl mx-auto flex gap-4">
          {/* Main Chat Area */}
          <div className="flex-1 min-w-0 relative">
            {/* Empty State - shows when conversation hasn't started */}
            {showEmptyState && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <div className="text-center space-y-3 mb-20">
                  <h2 className="text-3xl font-semibold text-gray-700 dark:text-gray-300">
                    How can I help you today?
                  </h2>
                  <p className="text-base text-gray-500 dark:text-gray-400">
                    Start by typing a message below
                  </p>
                </div>
              </div>
            )}
            
            <CopilotChat
              className="h-full rounded-2xl"
              labels={{
                title: "Agent Testing UI",
                initial: "",
              }}
              AssistantMessage={CustomAssistantMessage}
            />
            
            {/* Typing Indicator - shows when agent is working */}
            {isAgentWorking && (
              <div className="absolute bottom-28 left-8 z-10 animate-fade-in pointer-events-none">
                <ThinkingIndicator message="Processing" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatWithMetadata;

