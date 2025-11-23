"use client";

import React, { useState } from "react";
import { Eye, Download, Trash2, MessageSquare, Loader2, Copy, Check } from "lucide-react";

interface SavedChatCardProps {
  id: string;
  preview: string;
  timestamp: number;
  messageCount: number;
  isLoading?: boolean;
  isSelected?: boolean;
  onView: () => void;
  onExport: () => void;
  onDelete: () => void;
  onToggleSelect?: () => void;
}

export default function SavedChatCard({
  id,
  preview,
  timestamp,
  messageCount,
  isLoading = false,
  isSelected = false,
  onView,
  onExport,
  onDelete,
  onToggleSelect,
}: SavedChatCardProps) {
  const formatTimestamp = (ts: number) => {
    const now = Date.now();
    const diff = now - ts;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return new Date(ts).toLocaleDateString();
  };

  const [copied, setCopied] = useState(false);

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`group relative bg-white dark:bg-gray-800 rounded-lg border p-4 hover:shadow-lg transition-all flex flex-col ${
      isSelected 
        ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/50' 
        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
    }`}>
      {/* Checkbox for multi-select - top left */}
      {onToggleSelect && (
        <div className="absolute top-3 left-3 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect();
            }}
            className="w-5 h-5 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 cursor-pointer"
          />
        </div>
      )}

      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-mono text-gray-500 dark:text-gray-400 break-all flex-1">
              {id}
            </p>
            <button
              onClick={handleCopyId}
              className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Copy session ID"
            >
              {copied ? (
                <Check size={14} className="text-green-500" />
              ) : (
                <Copy size={14} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <MessageSquare size={14} />
            <span>{messageCount} {messageCount === 1 ? 'message' : 'messages'}</span>
            <span>•</span>
            <span>{formatTimestamp(timestamp)}</span>
          </div>
        </div>
      </div>

      {/* Preview - flex-grow pushes buttons down */}
      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-4 flex-grow">
        {preview || 'No preview available'}
      </p>

      {/* Action Buttons (always visible, at bottom) */}
      <div className="flex gap-2 mt-auto">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="View conversation"
        >
          <Eye size={16} />
          <span>View</span>
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExport();
          }}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Export as eval"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Delete conversation"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
      </div>
    </div>
  );
}

