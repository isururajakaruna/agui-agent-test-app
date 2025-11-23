'use client';

import React, { useState } from 'react';
import { Save, Check } from 'lucide-react';
import { useSavedConversations } from '@/contexts/SavedConversationsContext';
import { useToast } from '@/contexts/ToastContext';

interface SaveConversationButtonProps {
  conversationId: string | null;
}

export default function SaveConversationButton({ conversationId }: SaveConversationButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { refreshSavedConversations } = useSavedConversations();
  const { showToast } = useToast();

  const handleSave = async () => {
    if (!conversationId || isSaving) return;

    setIsSaving(true);
    
    try {
      const response = await fetch('/api/conversations/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId }),
      });

      const data = await response.json();

      if (data.success) {
        // Show success state
        setShowSuccess(true);
        
        // Show toast
        showToast('success', 'Conversation saved successfully');
        
        // Refresh saved conversations list
        await refreshSavedConversations();
        
        // Reset success state after 2 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 2000);
      } else {
        console.error('[SaveConversationButton] Save failed:', data.error);
        showToast('error', `Failed to save: ${data.error}`);
      }
    } catch (error) {
      console.error('[SaveConversationButton] Error:', error);
      showToast('error', 'Failed to save conversation');
    } finally {
      setIsSaving(false);
    }
  };

  if (!conversationId) {
    return null;
  }

  return (
    <button
      onClick={handleSave}
      disabled={isSaving || showSuccess}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
        transition-all duration-200
        ${showSuccess 
          ? 'bg-green-100 text-green-700 cursor-default' 
          : 'bg-blue-100 text-blue-700 hover:bg-blue-200 active:scale-95'
        }
        ${isSaving ? 'opacity-50 cursor-wait' : ''}
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      title="Save conversation"
    >
      {showSuccess ? (
        <>
          <Check size={16} className="animate-pulse" />
          <span>Saved!</span>
        </>
      ) : (
        <>
          <Save size={16} className={isSaving ? 'animate-pulse' : ''} />
          <span>{isSaving ? 'Saving...' : 'Save'}</span>
        </>
      )}
    </button>
  );
}


