import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";
// @ts-ignore - @ag-ui/client may not have TypeScript definitions
import { HttpAgent } from "@ag-ui/client";
import { getEventLogger } from "@/lib/EventLogger";
import { getConversationRecorder } from "@/lib/ConversationRecorder";
import { tap } from "rxjs/operators";
import { Observable } from "rxjs";

/**
 * AG-UI Protocol Agent with Event Logging
 * 
 * This uses @ag-ui/client's HttpAgent which properly implements CopilotKit's
 * internal protocols (RxJS Observables, legacy methods, etc.).
 * 
 * Bridge sends thinking as TOOL_CALL events, which are rendered by frontend ThinkingCard component.
 */

// AG-UI Protocol Agent adapter with RAW SSE logging
// @ts-ignore - HttpAgent works with config parameter at runtime
class ADKAgent extends HttpAgent {
  private bridgeUrl: string;

  constructor(config: any) {
    super(config);
    this.bridgeUrl = config.url;
  }

  /**
   * Record events to conversation recorder based on event type
   */
  private recordEvent(event: any, recorder: any) {
    const logger = getEventLogger();
    
    switch (event.type) {
      case 'TOOL_CALL_START':
        // Record tool calls (including thinking_step)
        logger.log(`[recordEvent] TOOL_CALL_START: ${event.toolCallName}, has _eval_metadata: ${!!event._eval_metadata}`);
        if (event._eval_metadata) {
          recorder.recordToolCall(event);
        }
        break;
      
      case 'TOOL_CALL_ARGS':
        // Buffer for potential thinking metadata extraction
        recorder.bufferEvent(event);
        
        // Check if this is thinking_step args
        if (event.toolCallId && event.toolCallId.includes('thinking-')) {
          logger.log(`[recordEvent] TOOL_CALL_ARGS for thinking_step`);
          recorder.recordThinkingEvent(event);
        }
        break;
      
      case 'TOOL_CALL_RESULT':
        // Record tool results (skip thinking_step results)
        logger.log(`[recordEvent] TOOL_CALL_RESULT: ${event.toolCallId}, has _eval_metadata: ${!!event._eval_metadata}`);
        if (event._eval_metadata && event.toolCallId && !event.toolCallId.includes('thinking-')) {
          recorder.recordToolResult(event);
        }
        break;
      
      case 'TEXT_MESSAGE_CONTENT':
        // Accumulate final response text
        if (event.delta) {
          logger.log(`[recordEvent] TEXT_MESSAGE_CONTENT: ${event.delta.substring(0, 50)}...`);
          recorder.recordTextContent(event.delta);
        }
        break;
      
      case 'RUN_FINISHED':
        // Complete current invocation and save session
        logger.log(`[recordEvent] RUN_FINISHED - completing and saving session`);
        recorder.completeInvocation();
        recorder.saveSession();
        break;
    }
  }

  // @ts-ignore - Override run method to intercept and log raw SSE before parsing
  run(input: any) {
    const logger = getEventLogger();
    const recorder = getConversationRecorder();
    const threadId = input.threadId || 'unknown';
    const runId = input.runId || new Date().toISOString();
    
    logger.logSessionStart(threadId, runId);
    recorder.startSession(threadId, runId);

    // Extract and log user message from input.messages
    const messages = input.messages || [];
    const userMessage = messages.find((m: any) => m.role === 'user');
    
    if (userMessage) {
      const content = typeof userMessage.content === 'string' 
        ? userMessage.content 
        : JSON.stringify(userMessage.content);
      
      logger.log('='.repeat(80));
      logger.log('👤 USER MESSAGE SENT TO BRIDGE');
      logger.log(`   Thread ID: ${threadId}`);
      logger.log(`   Run ID: ${runId}`);
      logger.log(`   Message ID: ${userMessage.id || 'unknown'}`);
      logger.log(`   Content: ${content}`);
      logger.log(`   Full Message Object: ${JSON.stringify(userMessage)}`);
      logger.log('='.repeat(80));
      logger.log('');
      
      // Start new invocation for conversation recorder
      recorder.startInvocation(content, userMessage.id || 'unknown');
    }

    // Create custom Observable that logs raw SSE BEFORE @ag-ui/client parsing
    return new Observable((subscriber) => {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      };

      logger.log('🌐 FETCHING RAW SSE FROM BRIDGE');
      logger.log(`   URL: ${this.bridgeUrl}`);
      logger.log(`   Thread ID: ${threadId}`);
      logger.log('');

      fetch(this.bridgeUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(input),
      })
        .then(async (response) => {
          if (!response.body) {
            throw new Error('No response body');
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const eventData = line.substring(6);
                
                // Log RAW SSE data (includes _eval_metadata if present)
                logger.log('📡 RAW SSE FROM BRIDGE:');
                logger.log(`   ${eventData}`);
                logger.log('');

                try {
                  const event = JSON.parse(eventData);
                  
                  // Log parsed event after @ag-ui/client would process it
                  logger.logEvent(event, 'bridge->nextjs (parsed)');
                  
                  // Record events for conversation JSON
                  this.recordEvent(event, recorder);
                  
                  // Emit to subscriber
                  subscriber.next(event);
                } catch (error) {
                  logger.log(`❌ Failed to parse event: ${error}`);
                }
              }
            }
          }

          subscriber.complete();
        })
        .catch((error) => {
          logger.log(`❌ ERROR: ${error}`);
          logger.logSessionEnd(threadId);
          subscriber.error(error);
        });
    }).pipe(
      tap({
        complete: () => {
          logger.logSessionEnd(threadId);
        }
      })
    );
  }
}

export async function POST(request: NextRequest) {
  const bridgeUrl = process.env.ADK_BRIDGE_URL || "http://localhost:8000";

  // Debug: Log each API call with timestamp
  const timestamp = new Date().toISOString();
  const url = request.url;
  console.log(`[API ${timestamp}] ========================================`);
  console.log(`[API ${timestamp}] POST /api/copilotkit called`);
  console.log(`[API ${timestamp}] URL: ${url}`);
  console.log(`[API ${timestamp}] ========================================`);
  console.log('[API] Creating CopilotRuntime with @ag-ui/client HttpAgent');
  console.log('[API] Bridge URL:', bridgeUrl);

  // Create AG-UI Protocol agent
  // @ts-ignore - HttpAgent accepts url config at runtime
  const chatAgent = new ADKAgent({
    url: `${bridgeUrl}/chat`,
  });

  // Create CopilotRuntime with AG-UI agent
  const runtime = new CopilotRuntime({
    // @ts-ignore - HttpAgent works at runtime, custom Observable return type is compatible
    agents: {
      // @ts-ignore
      chat_agent: chatAgent,
    },
  });

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter: new ExperimentalEmptyAdapter(),
    endpoint: "/api/copilotkit",
  });

  return handleRequest(request);
}
