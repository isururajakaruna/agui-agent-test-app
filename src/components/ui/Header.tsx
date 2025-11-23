"use client";

import React, { useState } from "react";
import { Bot, RefreshCw } from "lucide-react";
import { useSavedConversations } from "@/contexts/SavedConversationsContext";
import SaveConversationButton from "@/components/conversations/SaveConversationButton";

interface HeaderProps {
  sessionId?: string | null;
}

export default function Header({ sessionId }: HeaderProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { currentView } = useSavedConversations();
  
  // Get connection details from environment (dynamically configured)
  const bridgeUrl = process.env.NEXT_PUBLIC_ADK_BRIDGE_URL || process.env.ADK_BRIDGE_URL || "http://localhost:8000";
  
  // Parse URL to extract host, port, and protocol
  let bridgeHost = "localhost";
  let bridgePort = "8000";
  let protocol = "http";
  
  try {
    const url = new URL(bridgeUrl);
    bridgeHost = url.hostname;
    bridgePort = url.port || (url.protocol === 'https:' ? '443' : '80');
    protocol = url.protocol.replace(':', '');
  } catch (e) {
    // Fallback to defaults if URL parsing fails
    console.warn('Using default bridge connection details');
  }
  
  return (
    <header className="border-b bg-white dark:bg-gray-900 shadow-sm">
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Bot className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Agent Testing UI
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Refresh button (only show in chat view) */}
          {currentView === 'chat' && (
            <button
              onClick={() => window.location.reload()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Start new conversation"
            >
              <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100" />
            </button>
          )}
          
          {/* Session ID with copy button (only show in chat view with active session) */}
          {currentView === 'chat' && sessionId && (
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
              <span className="font-mono hidden sm:inline">{sessionId}</span>
              <span className="font-mono inline sm:hidden">{sessionId.slice(0, 12)}...</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sessionId);
                  console.log('Session ID copied:', sessionId);
                }}
                className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                title="Copy full session ID"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          )}
          
          {/* Save button (only show in chat view with active session) */}
          {currentView === 'chat' && sessionId && (
            <SaveConversationButton conversationId={sessionId} />
          )}
          
          {/* Connected status with tooltip (only show in chat view) */}
          {currentView === 'chat' && (
            <div 
              className="relative flex items-center gap-2 cursor-help"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Connected
              </span>
              
              {/* Tooltip */}
              {showTooltip && (
                <div className="absolute top-full right-0 mt-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg p-3 w-64 z-50">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Bridge Host:</span>
                      <span className="font-mono">{bridgeHost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Port:</span>
                      <span className="font-mono">{bridgePort}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Transport:</span>
                      <span className="font-mono">{protocol.toUpperCase()}/SSE</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Protocol:</span>
                      <span className="font-mono">AG-UI</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className="text-green-400 font-semibold">● Active</span>
                    </div>
                  </div>
                  {/* Tooltip arrow */}
                  <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
