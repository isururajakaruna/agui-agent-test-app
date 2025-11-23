'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Pencil, Check, X, Eye, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface EditableMessageProps {
  message: string;
  invocationId: string;
  onSave: (newMessage: string) => void;
  onEditingChange?: (isEditing: boolean) => void; // Callback to notify parent when editing state changes
}

export function EditableMessage({ message, invocationId, onSave, onEditingChange }: EditableMessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(message);
  const [isHovered, setIsHovered] = useState(false);
  const [showMarkdown, setShowMarkdown] = useState(true); // Toggle between markdown and raw
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Normalize line breaks for markdown rendering
  const normalizeMarkdown = (text: string) => {
    // Don't modify markdown special syntax like headers (===, ---)
    // Just ensure proper spacing between paragraphs
    return text;
  };

  // Update editedMessage when message prop changes (after save)
  useEffect(() => {
    setEditedMessage(message);
  }, [message]);

  // Focus and select text when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  // Notify parent when editing state changes
  useEffect(() => {
    if (onEditingChange) {
      onEditingChange(isEditing);
    }
  }, [isEditing, onEditingChange]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editedMessage.trim() !== message) {
      onSave(editedMessage.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedMessage(message);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Save on Cmd/Ctrl + Enter
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
    // Cancel on Escape
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <div
      className="relative w-full max-w-[95%] group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isEditing ? (
        <div className="relative w-full">
          {/* Edit mode: Textarea */}
          <textarea
            ref={textareaRef}
            value={editedMessage}
            onChange={(e) => setEditedMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="
              w-full min-w-full px-4 py-3 pr-20 rounded-lg
              bg-blue-50 dark:bg-blue-900/30
              border-2 border-blue-500
              text-sm text-gray-900 dark:text-gray-100
              focus:outline-none focus:ring-2 focus:ring-blue-500
              resize-none
            "
            rows={Math.max(3, editedMessage.split('\n').length)}
          />
          
          {/* Action buttons at top right */}
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <button
              onClick={handleSave}
              className="
                p-1.5 rounded-lg
                bg-green-500 hover:bg-green-600
                transition-colors shadow-sm
              "
              title="Save (Cmd/Ctrl + Enter)"
            >
              <Check size={16} className="text-white" />
            </button>
            <button
              onClick={handleCancel}
              className="
                p-1.5 rounded-lg
                bg-red-500 hover:bg-red-600
                transition-colors shadow-sm
              "
              title="Cancel (Esc)"
            >
              <X size={16} className="text-white" />
            </button>
          </div>

          {/* Helper text */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Press Cmd/Ctrl + Enter to save, Esc to cancel
          </p>
        </div>
      ) : (
        <div className="relative w-full max-w-[85%]">
          {/* View mode: Display */}
          <div className={`
            px-4 py-3 rounded-lg
            bg-gray-100 text-gray-900
            dark:bg-gray-800 dark:text-gray-100
            transition-all duration-200
            ${isHovered ? 'shadow-md ring-2 ring-gray-300 dark:ring-gray-600' : ''}
            cursor-pointer
          `}>
            {showMarkdown ? (
              /* Markdown Preview */
              <div className="text-sm prose prose-sm dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:tracking-tight
                prose-h1:text-xl prose-h1:mb-3 prose-h1:mt-4 prose-h1:border-b prose-h1:border-gray-300 prose-h1:pb-2
                prose-h2:text-lg prose-h2:mb-2 prose-h2:mt-3
                prose-h3:text-base prose-h3:mb-2 prose-h3:mt-3 prose-h3:font-semibold
                prose-p:text-sm prose-p:leading-relaxed prose-p:my-2 prose-p:font-normal
                prose-p:first:mt-0
                prose-strong:font-semibold prose-strong:text-gray-900 dark:prose-strong:text-gray-100
                [&_table]:border-collapse [&_table]:w-full [&_table]:border [&_table]:border-gray-300 [&_table]:dark:border-gray-600 [&_table]:my-4
                [&_th]:border [&_th]:border-gray-300 [&_th]:dark:border-gray-600 [&_th]:bg-gray-50 [&_th]:dark:bg-gray-700 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-sm
                [&_td]:border [&_td]:border-gray-300 [&_td]:dark:border-gray-600 [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm
                [&_code]:bg-gray-200 [&_code]:dark:bg-gray-700 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono
                [&_pre]:bg-gray-200 [&_pre]:dark:bg-gray-700 [&_pre]:p-3 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:text-xs
                [&_pre_code]:bg-transparent [&_pre_code]:p-0
                prose-ul:list-disc prose-ul:ml-5 prose-ul:my-2
                prose-ol:list-decimal prose-ol:ml-5 prose-ol:my-2
                prose-li:text-sm prose-li:my-1 prose-li:leading-relaxed
                prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-3
                prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800
                [&>*]:whitespace-pre-wrap
              ">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {normalizeMarkdown(message)}
                </ReactMarkdown>
              </div>
            ) : (
              /* Raw Text */
              <p className="text-sm whitespace-pre-wrap font-mono text-xs text-gray-700 dark:text-gray-300">{message}</p>
            )}
          </div>

          {/* Action buttons (visible on hover) */}
          {isHovered && (
            <div className="absolute top-2 right-2 flex items-center gap-1">
              {/* Toggle markdown/raw button */}
              <button
                onClick={() => setShowMarkdown(!showMarkdown)}
                className="
                  p-1.5 rounded-lg
                  bg-white dark:bg-gray-900
                  hover:bg-gray-50 dark:hover:bg-gray-800
                  shadow-md
                  transition-all duration-200
                  opacity-90 hover:opacity-100
                "
                title={showMarkdown ? "Show raw markdown" : "Show markdown preview"}
              >
                {showMarkdown ? (
                  <FileText size={14} className="text-gray-600 dark:text-gray-400" />
                ) : (
                  <Eye size={14} className="text-gray-600 dark:text-gray-400" />
                )}
              </button>
              
              {/* Edit button */}
              <button
                onClick={handleEdit}
                className="
                  p-1.5 rounded-lg
                  bg-white dark:bg-gray-900
                  hover:bg-gray-50 dark:hover:bg-gray-800
                  shadow-md
                  transition-all duration-200
                  opacity-90 hover:opacity-100
                "
                title="Edit message"
              >
                <Pencil size={14} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

