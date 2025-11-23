'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, User, Bot, Download } from 'lucide-react';
import { useSavedConversations } from '@/contexts/SavedConversationsContext';
import { EditableMessage } from './EditableMessage';
import { SavedMessageFeedback } from './SavedMessageFeedback';
import { ToolCallBadge } from './ToolCallBadge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { downloadConversationAsEval } from '@/lib/evalExport';

interface ToolCall {
  name: string;
  args: any;
  result?: any;
}

interface SimplifiedInvocation {
  invocation_id: string;
  user_message: string;
  agent_message: string;
  timestamp: number;
  user_rating?: number;
  user_feedback?: string;
  tool_calls?: ToolCall[];
}

export function SavedConversationView() {
  const { viewingConversationId, setViewingConversation, refreshSavedConversations } = useSavedConversations();
  const [invocations, setInvocations] = useState<SimplifiedInvocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingInvocationId, setEditingInvocationId] = useState<string | null>(null); // Track which invocation is being edited
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (viewingConversationId) {
      fetchConversation();
    }
  }, [viewingConversationId]);

  const fetchConversation = async () => {
    if (!viewingConversationId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/conversations/saved/${viewingConversationId}`);
      const data = await response.json();
      
      if (data.invocations) {
        setInvocations(data.invocations);
      }
    } catch (error) {
      console.error('[SavedConversationView] Error:', error);
      alert('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (invocationId: string, newMessage: string) => {
    if (!viewingConversationId) return;

    try {
      const response = await fetch(`/api/conversations/saved/${viewingConversationId}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invocationId,
          newAgentMessage: newMessage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setInvocations(prev => 
          prev.map(inv => 
            inv.invocation_id === invocationId 
              ? { ...inv, agent_message: newMessage }
              : inv
          )
        );
      } else {
        alert(`Failed to save edit: ${data.error}`);
      }
    } catch (error) {
      console.error('[SavedConversationView] Edit error:', error);
      alert('Failed to save edit');
    }
  };

  const handleDownload = async () => {
    if (!viewingConversationId) return;

    try {
      console.log('[SavedConversationView] Downloading conversation:', viewingConversationId);
      
      // Fetch the raw conversation data
      const response = await fetch(`/api/conversations/saved/${viewingConversationId}/raw`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('[SavedConversationView] Raw data received:', data);
      
      // The saved file is an array of invocations directly
      if (Array.isArray(data)) {
        console.log('[SavedConversationView] Calling downloadConversationAsEval with', data.length, 'invocations');
        downloadConversationAsEval(viewingConversationId, data);
        console.log('[SavedConversationView] Download initiated');
      } else {
        console.error('[SavedConversationView] Invalid data structure - expected array, got:', typeof data);
        alert('Invalid conversation format - expected array of invocations');
      }
    } catch (error) {
      console.error('[SavedConversationView] Download error:', error);
      alert(`Failed to download conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!viewingConversationId) return;

    setShowDeleteConfirm(false);

    try {
      const response = await fetch(`/api/conversations/saved/${viewingConversationId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await refreshSavedConversations();
        setViewingConversation(null); // Go back to chat
      } else {
        alert(`Failed to delete: ${data.error}`);
      }
    } catch (error) {
      console.error('[SavedConversationView] Delete error:', error);
      alert('Failed to delete conversation');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  const handleBackToChat = () => {
    setViewingConversation(null);
  };

  if (!viewingConversationId) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 sticky top-0 z-10 bg-white dark:bg-gray-900 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToChat}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Back to chat"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Saved Conversation
            </h2>
            <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
              {viewingConversationId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Download button */}
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            title="Download as eval"
          >
            <Download size={20} className="text-blue-600 dark:text-blue-400" />
          </button>
          
          {/* Delete button */}
          <button
            onClick={handleDeleteClick}
            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            title="Delete conversation"
          >
            <Trash2 size={20} className="text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>

      {/* Messages - Scrollable area */}
      <div className="flex-1 overflow-y-auto p-6" style={{ height: 'calc(100vh - 73px)' }}>
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Loading...
          </div>
        ) : invocations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No messages in this conversation
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {invocations.map((inv) => (
              <div key={inv.invocation_id} className="space-y-4">
                {/* User message FIRST - RIGHT with avatar */}
                {inv.user_message && (
                  <div className="flex justify-end items-start gap-3">
                    {/* Message */}
                    <div className="max-w-[70%] px-4 py-3 rounded-lg bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100">
                      <p className="text-sm whitespace-pre-wrap">{inv.user_message}</p>
                    </div>
                    
                    {/* User Avatar */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-700 flex items-center justify-center">
                      <User size={18} className="text-blue-600 dark:text-blue-300" />
                    </div>
                  </div>
                )}

                {/* Agent response SECOND (editable) - LEFT with avatar */}
                {inv.agent_message && (
                  <div className="flex justify-start items-start gap-3 w-full">
                    {/* Agent Avatar */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Bot size={18} className="text-gray-600 dark:text-gray-300" />
                    </div>
                    
                    {/* Message + Tool Calls + Feedback - takes remaining space but respects max-width in EditableMessage */}
                    <div className="flex-1 flex flex-col justify-start relative">
                      {/* Tool Call Badges */}
                      {inv.tool_calls && inv.tool_calls.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {inv.tool_calls.map((toolCall, idx) => (
                            <ToolCallBadge
                              key={`${inv.invocation_id}-tool-${idx}`}
                              toolName={toolCall.name}
                              args={toolCall.args}
                              result={toolCall.result}
                            />
                          ))}
                        </div>
                      )}
                      
                      <EditableMessage
                        message={inv.agent_message}
                        invocationId={inv.invocation_id}
                        onSave={(newMessage) => handleSaveEdit(inv.invocation_id, newMessage)}
                        onEditingChange={(isEditing) => {
                          // Update editing state - hide feedback when editing
                          setEditingInvocationId(isEditing ? inv.invocation_id : null);
                        }}
                      />
                      
                      {/* Feedback component - flows naturally below message, hidden when editing */}
                      {viewingConversationId && editingInvocationId !== inv.invocation_id && (
                        <SavedMessageFeedback
                          conversationId={viewingConversationId}
                          invocationId={inv.invocation_id}
                          existingRating={inv.user_rating}
                          existingComment={inv.user_feedback}
                          onUpdate={fetchConversation}
                          hasToolCalls={inv.tool_calls && inv.tool_calls.length > 0}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Conversation"
        message={`Are you sure you want to delete this conversation? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}

