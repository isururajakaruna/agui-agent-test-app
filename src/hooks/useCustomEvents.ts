import { useState, useEffect, useCallback } from 'react';

export interface ThinkingEvent {
  status: 'start' | 'end';
  thoughtsTokenCount?: number;
  totalTokenCount?: number;
  candidatesTokenCount?: number;
  promptTokenCount?: number;
  model?: string;
  timestamp: number;
}

export interface SessionStats {
  totalThinkingTokens: number;
  totalToolCalls: number;
  durationSeconds: number;
  threadId?: string;
  runId?: string;
}

export interface CustomEvents {
  thinking: ThinkingEvent[];
  session_stats: SessionStats | null;
  lastUpdated: number | null;
}

/**
 * Hook to poll for CUSTOM events (thinking, session stats) that CopilotKit filters out.
 * 
 * These events are intercepted at the Next.js API level before CopilotKit's GraphQL
 * layer filters them, then stored in memory and retrieved via polling.
 * 
 * @param threadId - The conversation thread ID from CopilotKit
 * @param enabled - Whether to start polling (default: true)
 * @param pollInterval - Polling interval in milliseconds (default: 1000)
 */
export function useCustomEvents(
  threadId: string | null | undefined,
  enabled: boolean = true,
  pollInterval: number = 1000
) {
  const [customEvents, setCustomEvents] = useState<CustomEvents>({
    thinking: [],
    session_stats: null,
    lastUpdated: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomEvents = useCallback(async () => {
    if (!threadId || !enabled) return;

    try {
      setIsLoading(true);
      // Fetch from /api/metadata which proxies to bridge's /metadata/{threadId}
      const response = await fetch(`/api/metadata?threadId=${threadId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch custom events: ${response.statusText}`);
      }
      
      const data: CustomEvents = await response.json();
      setCustomEvents(data);
      setError(null);
    } catch (err) {
      console.error('[useCustomEvents] Error fetching custom events:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [threadId, enabled]);

  // Poll for custom events
  useEffect(() => {
    if (!threadId || !enabled) {
      return;
    }

    console.log(`[useCustomEvents] Starting polling for thread: ${threadId}`);
    
    // Initial fetch
    fetchCustomEvents();

    // Set up polling interval
    const interval = setInterval(fetchCustomEvents, pollInterval);

    return () => {
      console.log(`[useCustomEvents] Stopping polling for thread: ${threadId}`);
      clearInterval(interval);
    };
  }, [threadId, enabled, pollInterval, fetchCustomEvents]);

  // Computed values
  const activeThinking = customEvents.thinking.find(t => t.status === 'start' && 
    !customEvents.thinking.some(end => end.status === 'end' && end.timestamp > t.timestamp));
  
  const completedThinkingSteps = customEvents.thinking.filter(t => t.status === 'start');

  return {
    customEvents,
    isLoading,
    error,
    
    // Convenience accessors
    thinkingEvents: customEvents.thinking,
    sessionStats: customEvents.session_stats,
    activeThinking,
    completedThinkingSteps,
    
    // Manual refresh
    refresh: fetchCustomEvents
  };
}

