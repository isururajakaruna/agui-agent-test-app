'use client';

import React from 'react';
import { Trash2, MessageSquare, Download } from 'lucide-react';
import { SavedConversation } from '@/contexts/SavedConversationsContext';
import { downloadConversationAsEval } from '@/lib/evalExport';

interface SavedConversationItemProps {
  conversation: SavedConversation;
  onSelect: () => void;
  onDelete: () => void;
}

export function SavedConversationItem({ 
  conversation, 
  onSelect, 
  onDelete 
}: SavedConversationItemProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onSelect
    
    if (confirm(`Delete conversation "${conversation.id}"?`)) {
      onDelete();
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onSelect
    
    try {
      console.log('[SavedConversationItem] Downloading conversation:', conversation.id);
      
      // Fetch the raw conversation data
      const response = await fetch(`/api/conversations/saved/${conversation.id}/raw`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('[SavedConversationItem] Raw data received:', data);
      
      // The saved file is an array of invocations directly
      if (Array.isArray(data)) {
        console.log('[SavedConversationItem] Calling downloadConversationAsEval with', data.length, 'invocations');
        downloadConversationAsEval(conversation.id, data);
        console.log('[SavedConversationItem] Download initiated');
      } else {
        console.error('[SavedConversationItem] Invalid data structure - expected array, got:', typeof data);
        alert('Invalid conversation format - expected array of invocations');
      }
    } catch (error) {
      console.error('[SavedConversationItem] Download error:', error);
      alert(`Failed to download conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div
      onClick={onSelect}
      className="
        group p-3 rounded-lg border border-gray-200 dark:border-gray-700
        hover:bg-gray-50 dark:hover:bg-gray-800
        cursor-pointer transition-all duration-200
        hover:shadow-md
      "
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* ID with tooltip */}
          <div className="flex items-center gap-2 mb-1 relative group/id">
            <MessageSquare size={14} className="text-gray-400 flex-shrink-0" />
            <span 
              className="text-xs font-mono text-gray-600 dark:text-gray-400 truncate cursor-help"
              title={conversation.id}
            >
              {conversation.id.slice(0, 12)}...
            </span>
            
            {/* Tooltip on hover */}
            <div className="
              absolute left-0 top-full mt-1 
              bg-gray-900 text-white text-xs font-mono 
              px-2 py-1 rounded shadow-lg z-50
              opacity-0 group-hover/id:opacity-100
              pointer-events-none
              transition-opacity duration-200
              whitespace-nowrap
            ">
              {conversation.id}
            </div>
          </div>

          {/* Preview */}
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-2">
            {conversation.preview}
          </p>

          {/* Metadata */}
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span>{conversation.invocationCount} messages</span>
            <span>•</span>
            <span>{formatTimestamp(conversation.timestamp)}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
          {/* Download button */}
          <button
            onClick={handleDownload}
            className="
              p-1.5 rounded-lg
              hover:bg-blue-100 dark:hover:bg-blue-900/30
              transition-colors
            "
            title="Download as eval"
          >
            <Download size={14} className="text-blue-600 dark:text-blue-400" />
          </button>
          
          {/* Delete button */}
          <button
            onClick={handleDelete}
            className="
              p-1.5 rounded-lg
              hover:bg-red-100 dark:hover:bg-red-900/30
              transition-colors
            "
            title="Delete conversation"
          >
            <Trash2 size={14} className="text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

