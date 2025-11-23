"use client";

import React, { useEffect, useState } from "react";
import { useSavedConversations } from "@/contexts/SavedConversationsContext";
import { useToast } from "@/contexts/ToastContext";
import SavedChatCard from "./SavedChatCard";
import { Search, Loader2, Download, X, CheckSquare } from "lucide-react";

export default function SavedChatsList() {
  const { savedConversations, fetchSavedConversations, setViewingConversation } = useSavedConversations();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc'>('date-desc');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isCombining, setIsCombining] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    const loadConversations = async () => {
      setIsLoading(true);
      await fetchSavedConversations();
      setIsLoading(false);
    };
    loadConversations();
  }, [fetchSavedConversations]);

  // Filter conversations by search query
  const filteredConversations = savedConversations.filter(conv => 
    conv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort conversations
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (sortBy === 'date-desc') {
      return b.timestamp - a.timestamp;
    } else {
      return a.timestamp - b.timestamp;
    }
  });

  const handleView = (id: string) => {
    setViewingConversation(id);
  };

  const handleExport = async (id: string) => {
    setLoadingId(id);
    try {
      const response = await fetch(`/api/conversations/saved/${id}/raw`);
      if (!response.ok) {
        throw new Error('Failed to fetch conversation');
      }
      
      const conversation = await response.json();
      
      // Import the download utility
      const { downloadConversationAsEval } = await import('@/lib/evalExport');
      downloadConversationAsEval(id, conversation);
      
      showToast('success', 'Conversation exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      showToast('error', 'Failed to export conversation');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return;
    }
    
    setLoadingId(id);
    try {
      const response = await fetch(`/api/conversations/saved/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete conversation');
      }
      
      // Refresh the list
      await fetchSavedConversations();
      
      showToast('success', 'Conversation deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      showToast('error', 'Failed to delete conversation');
    } finally {
      setLoadingId(null);
    }
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const enterSelectionMode = () => {
    setIsSelectionMode(true);
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  };

  const handleCombineAndExport = async () => {
    if (selectedIds.size === 0) {
      showToast('error', 'Please select at least one conversation');
      return;
    }

    setIsCombining(true);
    try {
      // Fetch all selected conversations
      const conversationPromises = Array.from(selectedIds).map(async (id) => {
        const response = await fetch(`/api/conversations/saved/${id}/raw`);
        if (!response.ok) {
          throw new Error(`Failed to fetch conversation ${id}`);
        }
        return response.json();
      });

      const conversations = await Promise.all(conversationPromises);

      // Combine all invocations from all conversations
      const allInvocations = conversations.flat();

      // Import the conversion utility
      const { convertToEvalSet } = await import('@/lib/evalExport');
      
      // Create a combined eval set
      const evalSetId = Math.random().toString(36).substring(2, 10);
      const timestamp = Date.now() / 1000;
      
      const evalSet = {
        eval_set_id: evalSetId,
        name: evalSetId,
        eval_cases: Array.from(selectedIds).map((id, index) => ({
          eval_id: id,
          conversation: conversations[index].map((inv: any) => {
            const events = inv.intermediate_data?.invocation_events;
            return {
              invocation_id: inv.invocation_id,
              user_content: inv.user_content,
              final_response: inv.final_response,
              intermediate_data: (events && events.length > 0)
                ? { invocation_events: events }
                : {},
              creation_timestamp: inv.creation_timestamp,
            };
          }),
          session_input: {
            app_name: "agent_ui",
            user_id: "user",
          },
          creation_timestamp: timestamp,
        })),
        creation_timestamp: timestamp,
      };

      // Download the combined eval set
      const blob = new Blob([JSON.stringify(evalSet, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${evalSetId}.evalset.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('success', `Combined ${selectedIds.size} conversations into eval set`);
      exitSelectionMode();
    } catch (error) {
      console.error('Combine and export error:', error);
      showToast('error', 'Failed to combine and export conversations');
    } finally {
      setIsCombining(false);
    }
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      {/* Loading Screen */}
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
            <p className="text-lg text-gray-600 dark:text-gray-400">Loading saved conversations...</p>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Saved Conversations
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {savedConversations.length} {savedConversations.length === 1 ? 'conversation' : 'conversations'} saved
            </p>
          </div>
          
          {/* Select Mode Toggle Button */}
          {!isSelectionMode && savedConversations.length > 0 && (
            <button
              onClick={enterSelectionMode}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CheckSquare size={18} />
              <span>Combine to Eval Set</span>
            </button>
          )}
        </div>

        {/* Search and Sort Bar */}
        <div className="mb-6 flex gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by ID or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date-desc' | 'date-asc')}
            className="px-4 py-2 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em',
            }}
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
          </select>
        </div>

        {/* Selection Mode toolbar */}
        {isSelectionMode && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedIds.size > 0 
                  ? `${selectedIds.size} conversation${selectedIds.size === 1 ? '' : 's'} selected`
                  : 'Select conversations to export'
                }
              </span>
            </div>
            <div className="flex items-center gap-3">
              {selectedIds.size > 0 && (
                <button
                  onClick={handleCombineAndExport}
                  disabled={isCombining}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCombining ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      <span>Export as Eval Set</span>
                    </>
                  )}
                </button>
              )}
              <button
                onClick={exitSelectionMode}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        )}

        {/* Multi-select toolbar - REMOVE OLD ONE */}

        {/* Empty State */}
        {savedConversations.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No saved conversations yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start a chat and click the save button to preserve your conversations
            </p>
          </div>
        )}

        {/* Conversations Grid */}
        {sortedConversations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedConversations.map((conversation) => (
              <SavedChatCard
                key={conversation.id}
                id={conversation.id}
                preview={conversation.preview}
                timestamp={conversation.timestamp}
                messageCount={conversation.invocationCount}
                isLoading={loadingId === conversation.id}
                isSelected={selectedIds.has(conversation.id)}
                onView={() => handleView(conversation.id)}
                onExport={() => handleExport(conversation.id)}
                onDelete={() => handleDelete(conversation.id)}
                onToggleSelect={isSelectionMode ? () => toggleSelection(conversation.id) : undefined}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {savedConversations.length > 0 && sortedConversations.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No conversations found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search query
            </p>
          </div>
        )}
      </div>
      )}
    </div>
  );
}

