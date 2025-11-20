/**
 * ⚠️ COPILOTKIT PROTOTYPE MODIFICATION ⚠️
 * 
 * This patches CopilotKit's runtime to support ACTIVITY_SNAPSHOT events
 * from the AG-UI Protocol that CopilotKit doesn't natively support.
 * 
 * ONLY TESTED WITH: @copilotkit/runtime v1.10.6
 * 
 * IF COPILOTKIT UPDATES BREAK THIS:
 * 1. Check if internal APIs changed
 * 2. Update patch or revert to TEXT_MESSAGE approach
 * 3. See: COPILOTKIT_PATCH.md for details
 * 
 * Based on: https://github.com/CopilotKit/CopilotKit/issues/...
 * Similar to Anthropic Extended Thinking implementation
 */

import { HttpAgent } from '@ag-ui/client';

// Type definitions for AG-UI Protocol events
interface BaseEvent {
  type: string;
  timestamp?: number;
}

interface ActivitySnapshotEvent extends BaseEvent {
  type: 'ACTIVITY_SNAPSHOT';
  messageId: string;
  activityType: string;
  content: Record<string, any>;
  replace?: boolean;
}

interface TextMessageEvent extends BaseEvent {
  type: 'TEXT_MESSAGE_START' | 'TEXT_MESSAGE_CONTENT' | 'TEXT_MESSAGE_END';
  messageId: string;
  role?: string;
  delta?: string;
}

// Store for ACTIVITY events (keyed by thread ID)
const activityEventsStore = new Map<string, ActivitySnapshotEvent[]>();

/**
 * Format thinking event as a beautiful text message
 */
function formatThinkingAsText(event: ActivitySnapshotEvent): string {
  const content = event.content;
  
  if (content.status === 'in_progress') {
    const lines = [
      '🧠 **Extended Thinking**',
      '',
      `💭 Thought tokens: ${content.thoughtsTokenCount?.toLocaleString() || 'N/A'}`,
      `📊 Total tokens: ${content.totalTokenCount?.toLocaleString() || 'N/A'}`,
      `🤖 Model: ${content.model || 'N/A'}`,
    ];
    
    if (content.candidatesTokenCount) {
      lines.push(`✨ Candidates: ${content.candidatesTokenCount.toLocaleString()}`);
    }
    if (content.promptTokenCount) {
      lines.push(`📝 Prompt: ${content.promptTokenCount.toLocaleString()}`);
    }
    
    return lines.join('\n');
  } else if (content.status === 'completed') {
    return '✅ **Thinking Complete**';
  }
  
  return '🧠 Thinking...';
}

/**
 * Format session stats as a beautiful text message
 */
function formatSessionStatsAsText(event: ActivitySnapshotEvent): string {
  const content = event.content;
  
  const lines = [
    '📈 **Session Statistics**',
    '',
    `💭 Total thinking tokens: ${content.totalThinkingTokens?.toLocaleString() || '0'}`,
    `🔧 Total tool calls: ${content.totalToolCalls || '0'}`,
    `⏱️ Duration: ${content.durationSeconds || '0'}s`,
  ];
  
  if (content.threadId) {
    lines.push(`🔗 Thread: ${content.threadId.substring(0, 8)}...`);
  }
  
  return lines.join('\n');
}

/**
 * Transform ACTIVITY_SNAPSHOT event to TEXT_MESSAGE events
 */
function transformActivityToTextMessages(event: ActivitySnapshotEvent): TextMessageEvent[] {
  let textContent: string;
  
  switch (event.activityType) {
    case 'THINKING':
      textContent = formatThinkingAsText(event);
      break;
    case 'SESSION_STATS':
      textContent = formatSessionStatsAsText(event);
      break;
    default:
      textContent = `📊 Activity: ${event.activityType}\n\`\`\`json\n${JSON.stringify(event.content, null, 2)}\n\`\`\``;
  }
  
  // Return a sequence of TEXT_MESSAGE events
  return [
    {
      type: 'TEXT_MESSAGE_START',
      messageId: event.messageId,
      role: 'assistant',
      timestamp: event.timestamp,
    },
    {
      type: 'TEXT_MESSAGE_CONTENT',
      messageId: event.messageId,
      delta: textContent,
      timestamp: event.timestamp,
    },
    {
      type: 'TEXT_MESSAGE_END',
      messageId: event.messageId,
      timestamp: event.timestamp,
    },
  ];
}

/**
 * Main patch function - modifies HttpAgent to transform ACTIVITY events
 */
export function patchCopilotKitForActivity() {
  console.log('[COPILOTKIT PATCH] Applying ACTIVITY_SNAPSHOT patch...');
  
  try {
    // Store the original run method
    const originalRun = HttpAgent.prototype.run;
    
    // Override the run method to intercept and transform events
    HttpAgent.prototype.run = function(input: any) {
      console.log('[COPILOTKIT PATCH] Intercepting HttpAgent.run()');
      
      const threadId = input.threadId || 'default';
      
      // Initialize activity store for this thread if needed
      if (!activityEventsStore.has(threadId)) {
        activityEventsStore.set(threadId, []);
      }
      
      // Create an async generator that transforms events
      const transformedGenerator = async function* () {
        // @ts-ignore - HttpAgent.run returns an Observable, but we need to work with it
        const originalGenerator = originalRun.call(this, input);
        
        // If it's an Observable (RxJS), we need to convert it
        if (originalGenerator && typeof originalGenerator.subscribe === 'function') {
          // It's an RxJS Observable
          console.log('[COPILOTKIT PATCH] Converting Observable to AsyncGenerator');
          
          // We need to use a different approach - collect events and yield them
          const events: any[] = [];
          let completed = false;
          let error: any = null;
          
          // Subscribe to the observable
          const subscription = originalGenerator.subscribe({
            next: (event: any) => events.push(event),
            error: (err: any) => { error = err; completed = true; },
            complete: () => { completed = true; }
          });
          
          // Wait for completion or error
          while (!completed) {
            await new Promise(resolve => setTimeout(resolve, 10));
          }
          
          if (error) throw error;
          
          // Process collected events
          for (const event of events) {
            if (event.type === 'ACTIVITY_SNAPSHOT') {
              console.log('[COPILOTKIT PATCH] Transforming ACTIVITY_SNAPSHOT:', event.activityType);
              
              // Store the activity event
              const threadEvents = activityEventsStore.get(threadId) || [];
              threadEvents.push(event as ActivitySnapshotEvent);
              activityEventsStore.set(threadId, threadEvents);
              
              // Transform to TEXT_MESSAGE events
              const textMessages = transformActivityToTextMessages(event as ActivitySnapshotEvent);
              for (const textMsg of textMessages) {
                yield textMsg;
              }
            } else {
              // Pass through all other events unchanged
              yield event;
            }
          }
        } else {
          // It's already an async generator or async iterable
          console.log('[COPILOTKIT PATCH] Processing AsyncGenerator');
          
          for await (const event of originalGenerator) {
            if (event.type === 'ACTIVITY_SNAPSHOT') {
              console.log('[COPILOTKIT PATCH] Transforming ACTIVITY_SNAPSHOT:', event.activityType);
              
              // Store the activity event
              const threadEvents = activityEventsStore.get(threadId) || [];
              threadEvents.push(event as ActivitySnapshotEvent);
              activityEventsStore.set(threadId, threadEvents);
              
              // Transform to TEXT_MESSAGE events
              const textMessages = transformActivityToTextMessages(event as ActivitySnapshotEvent);
              for (const textMsg of textMessages) {
                yield textMsg;
              }
            } else {
              // Pass through all other events unchanged
              yield event;
            }
          }
        }
      };
      
      // Return the transformed generator bound to this context
      return transformedGenerator.call(this);
    };
    
    console.log('[COPILOTKIT PATCH] ✅ ACTIVITY_SNAPSHOT patch applied successfully');
    console.log('[COPILOTKIT PATCH] Events will be transformed to TEXT_MESSAGE format');
    
    return true;
  } catch (error) {
    console.error('[COPILOTKIT PATCH] ❌ Failed to apply patch:', error);
    console.error('[COPILOTKIT PATCH] Falling back to standard behavior');
    return false;
  }
}

/**
 * Get stored activity events for a thread (for debugging)
 */
export function getActivityEvents(threadId: string): ActivitySnapshotEvent[] {
  return activityEventsStore.get(threadId) || [];
}

/**
 * Clear activity events for a thread
 */
export function clearActivityEvents(threadId?: string) {
  if (threadId) {
    activityEventsStore.delete(threadId);
  } else {
    activityEventsStore.clear();
  }
}

