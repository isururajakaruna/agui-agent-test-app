/**
 * Conversation Recorder
 * Records conversation sessions in eval-reference.json format
 */

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface TextPart {
  text: string;
}

interface FunctionCallPart {
  function_call: {
    id: string;
    args: any;
    name: string;
  };
  thought_signature?: string;
}

interface FunctionResponsePart {
  function_response: {
    id: string;
    name: string;
    response: any;
  };
}

interface ContentPart {
  parts: (TextPart | FunctionCallPart | FunctionResponsePart)[];
  role: string;
}

interface InvocationEvent {
  author: string;
  content: ContentPart;
}

interface Invocation {
  invocation_id: string;
  user_content: ContentPart;
  final_response: ContentPart;
  intermediate_data: {
    invocation_events?: InvocationEvent[];
  };
  creation_timestamp: number;
}

class ConversationRecorder {
  private conversationsDir: string;
  private currentConversationId: string | null = null;
  private currentConversation: Invocation[] = [];
  private currentInvocation: Invocation | null = null;
  private pendingEvents: any[] = [];

  constructor() {
    this.conversationsDir = path.join(process.cwd(), 'conversations');
    
    // Create conversations directory if it doesn't exist
    if (!fs.existsSync(this.conversationsDir)) {
      fs.mkdirSync(this.conversationsDir, { recursive: true });
    }
  }

  /**
   * Start a new conversation session
   */
  startSession(threadId: string, runId: string) {
    // Use the thread ID directly as the conversation ID
    // This ensures the frontend session ID matches the saved filename
    this.currentConversationId = threadId;
    this.currentConversation = [];
    this.pendingEvents = [];
    
    console.log(`[ConversationRecorder] Started conversation: ${threadId}`);
  }

  /**
   * Start a new invocation (user message -> response cycle)
   */
  startInvocation(userMessage: string, messageId: string) {
    if (!this.currentConversationId) {
      console.warn('[ConversationRecorder] No active conversation. Starting one...');
      this.startSession('unknown', 'unknown');
    }

    const invocationId = `e-${uuidv4()}`;
    
    this.currentInvocation = {
      invocation_id: invocationId,
      user_content: {
        parts: [{ text: userMessage }],
        role: "user"
      },
      final_response: {
        parts: [],
        role: "model"
      },
      intermediate_data: {
        invocation_events: []
      },
      creation_timestamp: Date.now() / 1000
    };

    this.pendingEvents = [];
    
    console.log(`[ConversationRecorder] Started invocation: ${invocationId}`);
  }

  /**
   * Record a tool call event (including thinking_step)
   */
  recordToolCall(event: any) {
    if (!this.currentInvocation) {
      console.log('[ConversationRecorder] recordToolCall: No active invocation');
      return;
    }

    // Special handling for thinking_step (no raw_function_call in START event)
    if (event.toolCallName === 'thinking_step') {
      console.log('[ConversationRecorder] Detected thinking_step, will process from TOOL_CALL_ARGS');
      return; // Will be handled in recordThinkingEvent
    }

    const metadata = event._eval_metadata;
    if (!metadata || !metadata.raw_function_call) {
      console.log('[ConversationRecorder] recordToolCall: No _eval_metadata or raw_function_call');
      return;
    }

    const functionCallPart: FunctionCallPart = {
      function_call: {
        id: metadata.raw_function_call.id,
        args: metadata.raw_function_call.args,
        name: metadata.raw_function_call.name
      }
    };

    const invocationEvent: InvocationEvent = {
      author: metadata.author || 'unknown',
      content: {
        parts: [functionCallPart],
        role: metadata.role || 'model'
      }
    };

    this.currentInvocation.intermediate_data.invocation_events!.push(invocationEvent);
    console.log(`[ConversationRecorder] Recorded tool call: ${metadata.raw_function_call.name}`);
  }

  /**
   * Record a thinking event with thought_signature
   */
  recordThinkingEvent(event: any) {
    if (!this.currentInvocation) {
      console.log('[ConversationRecorder] recordThinkingEvent: No active invocation');
      return;
    }

    // Extract metadata from TOOL_CALL_ARGS delta
    let parsedDelta: any = {};
    try {
      parsedDelta = JSON.parse(event.delta);
    } catch (e) {
      console.log('[ConversationRecorder] Failed to parse thinking delta');
      return;
    }

    const metadata = parsedDelta._eval_metadata;
    if (!metadata) {
      console.log('[ConversationRecorder] No _eval_metadata in thinking args');
      return;
    }

    // Create a synthetic function_call for thinking (matches reference structure)
    const functionCallPart: FunctionCallPart = {
      function_call: {
        id: event.toolCallId,
        args: {
          thoughtsTokenCount: parsedDelta.thoughtsTokenCount,
          totalTokenCount: parsedDelta.totalTokenCount
        },
        name: "thinking"  // Use "thinking" as the function name
      }
    };

    // Add thought_signature if present
    if (metadata.thought_signature) {
      functionCallPart.thought_signature = metadata.thought_signature;
      console.log(`[ConversationRecorder] Added thought_signature (${metadata.thought_signature.length} chars)`);
    }

    const invocationEvent: InvocationEvent = {
      author: metadata.author || 'unknown',
      content: {
        parts: [functionCallPart],
        role: 'model'
      }
    };

    this.currentInvocation.intermediate_data.invocation_events!.push(invocationEvent);
    console.log(`[ConversationRecorder] Recorded thinking event from ${metadata.author}`);
  }

  /**
   * Record a tool result event
   */
  recordToolResult(event: any) {
    if (!this.currentInvocation) return;

    const metadata = event._eval_metadata;
    if (!metadata || !metadata.raw_function_response) return;

    const functionResponsePart: FunctionResponsePart = {
      function_response: {
        id: metadata.raw_function_response.id,
        name: metadata.raw_function_response.name,
        response: metadata.raw_function_response.response
      }
    };

    const invocationEvent: InvocationEvent = {
      author: metadata.author || 'unknown',
      content: {
        parts: [functionResponsePart],
        role: metadata.role || 'user'
      }
    };

    this.currentInvocation.intermediate_data.invocation_events!.push(invocationEvent);
  }

  /**
   * Record text message content (final response)
   */
  recordTextContent(content: string) {
    if (!this.currentInvocation) return;

    // Append to final response
    if (this.currentInvocation.final_response.parts.length === 0) {
      this.currentInvocation.final_response.parts.push({ text: content });
    } else {
      const lastPart = this.currentInvocation.final_response.parts[
        this.currentInvocation.final_response.parts.length - 1
      ] as TextPart;
      lastPart.text += content;
    }
  }

  /**
   * Buffer an event for potential use (e.g., TOOL_CALL_ARGS for thinking)
   */
  bufferEvent(event: any) {
    this.pendingEvents.push(event);
    
    // Keep only last 50 events to avoid memory issues
    if (this.pendingEvents.length > 50) {
      this.pendingEvents.shift();
    }
  }

  /**
   * Complete current invocation and add to conversation
   */
  completeInvocation() {
    if (!this.currentInvocation || !this.currentConversationId) return;

    // Only add invocations that have user content
    if (this.currentInvocation.user_content.parts.length > 0) {
      // Remove intermediate_data if empty
      if (!this.currentInvocation.intermediate_data.invocation_events ||
          this.currentInvocation.intermediate_data.invocation_events.length === 0) {
        this.currentInvocation.intermediate_data = {};
      }

      this.currentConversation.push(this.currentInvocation);
      console.log(`[ConversationRecorder] Completed invocation: ${this.currentInvocation.invocation_id}`);
    }

    this.currentInvocation = null;
    this.pendingEvents = [];
  }

  /**
   * Save the current conversation to a JSON file (just the conversation array)
   */
  saveSession() {
    if (!this.currentConversationId) {
      console.warn('[ConversationRecorder] No active conversation to save');
      return;
    }

    // Complete any pending invocation
    if (this.currentInvocation) {
      this.completeInvocation();
    }

    const filename = `${this.currentConversationId}.json`;
    const filepath = path.join(this.conversationsDir, filename);

    try {
      // Save just the conversation array (not wrapped in eval structure)
      fs.writeFileSync(filepath, JSON.stringify(this.currentConversation, null, 2), 'utf-8');
      console.log(`[ConversationRecorder] ✅ Saved conversation: ${filepath}`);
      console.log(`[ConversationRecorder] Total invocations: ${this.currentConversation.length}`);
    } catch (error) {
      console.error(`[ConversationRecorder] ❌ Failed to save conversation:`, error);
    }

    // Clear after saving
    this.currentConversationId = null;
    this.currentConversation = [];
  }
}

// Singleton instance
let conversationRecorder: ConversationRecorder | null = null;

export function getConversationRecorder(): ConversationRecorder {
  if (!conversationRecorder) {
    conversationRecorder = new ConversationRecorder();
  }
  return conversationRecorder;
}

