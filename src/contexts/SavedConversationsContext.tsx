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
  // Navigation
  currentView: 'chat' | 'saved';
  setCurrentView: (view: 'chat' | 'saved') => void;
  
  // Viewing specific saved conversation
  viewingConversationId: string | null;
  setViewingConversation: (id: string | null) => void;
  
  // Saved conversations list
  savedConversations: SavedConversation[];
  fetchSavedConversations: () => Promise<void>;
  refreshSavedConversations: () => Promise<void>;
  
  // Current session
  currentConversationId: string | null;
  setCurrentConversationId: (id: string | null) => void;
  hasMessages: boolean;
  setHasMessages: (has: boolean) => void;
}

const SavedConversationsContext = createContext<SavedConversationsContextType | undefined>(undefined);

export function SavedConversationsProvider({ children }: { children: React.ReactNode }) {
  const [currentView, setCurrentViewState] = useState<'chat' | 'saved'>('chat');
  const [viewingConversationId, setViewingConversationIdState] = useState<string | null>(null);
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [hasMessages, setHasMessages] = useState<boolean>(false);

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
    // When viewing a specific conversation, stay in saved view
    if (id) {
      setCurrentViewState('saved');
    }
  }, []);

  const setCurrentView = useCallback((view: 'chat' | 'saved') => {
    setCurrentViewState(view);
    
    // Fetch conversations when navigating to saved view
    if (view === 'saved') {
      fetchSavedConversations();
      // Clear viewing conversation when going to list view
      if (viewingConversationId) {
        setViewingConversationIdState(null);
      }
    }
  }, [fetchSavedConversations, viewingConversationId]);

  return (
    <SavedConversationsContext.Provider
      value={{
        currentView,
        setCurrentView,
        viewingConversationId,
        setViewingConversation,
        savedConversations,
        fetchSavedConversations,
        refreshSavedConversations,
        currentConversationId,
        setCurrentConversationId,
        hasMessages,
        setHasMessages,
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
