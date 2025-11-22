'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface SavedConversation {
  id: string;
  filename: string;
  preview: string;
  timestamp: number;
  invocationCount: number;
}

interface SavedConversationsContextType {
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
  refreshSavedConversations: () => Promise<void>;
  
  // Current session
  currentConversationId: string | null;
  setCurrentConversationId: (id: string | null) => void;
}

const SavedConversationsContext = createContext<SavedConversationsContextType | undefined>(undefined);

export function SavedConversationsProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'chat' | 'saved-conversation'>('chat');
  const [viewingConversationId, setViewingConversationIdState] = useState<string | null>(null);
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const fetchSavedConversations = useCallback(async () => {
    try {
      const response = await fetch('/api/conversations/saved');
      const data = await response.json();
      setSavedConversations(data.conversations || []);
    } catch (error) {
      console.error('[SavedConversationsContext] Failed to fetch saved conversations:', error);
      setSavedConversations([]);
    }
  }, []);

  const refreshSavedConversations = useCallback(async () => {
    await fetchSavedConversations();
  }, [fetchSavedConversations]);

  const setViewingConversation = useCallback((id: string | null) => {
    setViewingConversationIdState(id);
    setCurrentView(id ? 'saved-conversation' : 'chat');
  }, []);

  const setSidebarOpen = useCallback((open: boolean) => {
    setIsSidebarOpen(open);
    
    // Fetch conversations when opening sidebar
    if (open) {
      fetchSavedConversations();
    }
  }, [fetchSavedConversations]);

  return (
    <SavedConversationsContext.Provider
      value={{
        isSidebarOpen,
        setSidebarOpen,
        currentView,
        viewingConversationId,
        setViewingConversation,
        savedConversations,
        fetchSavedConversations,
        refreshSavedConversations,
        currentConversationId,
        setCurrentConversationId,
      }}
    >
      {children}
    </SavedConversationsContext.Provider>
  );
}

export function useSavedConversations() {
  const context = useContext(SavedConversationsContext);
  if (context === undefined) {
    throw new Error('useSavedConversations must be used within a SavedConversationsProvider');
  }
  return context;
}

