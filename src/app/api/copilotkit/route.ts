import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";
// @ts-ignore - @ag-ui/client may not have TypeScript definitions
import { HttpAgent } from "@ag-ui/client";
import { getEventLogger } from "@/lib/EventLogger";
import { tap } from "rxjs/operators";

/**
 * AG-UI Protocol Agent with Event Logging
 * 
 * This uses @ag-ui/client's HttpAgent which properly implements CopilotKit's
 * internal protocols (RxJS Observables, legacy methods, etc.).
 * 
 * Bridge sends thinking as TOOL_CALL events, which are rendered by frontend ThinkingCard component.
 */

// AG-UI Protocol Agent adapter with logging
// @ts-ignore - HttpAgent works with config parameter at runtime
class ADKAgent extends HttpAgent {
  // @ts-ignore - Override run method to add logging and transform ACTIVITY events
  run(input: any) {
    const logger = getEventLogger();
    const threadId = input.threadId || 'unknown';
    const runId = input.runId || new Date().toISOString();
    
    logger.logSessionStart(threadId, runId);
    
    // Call parent run method and pipe through logging only
    // Bridge now sends thinking as TOOL_CALL events, no transformation needed
    // @ts-ignore - HttpAgent.run returns Observable
    return super.run(input).pipe(
      tap({
        next: (event: any) => {
          // Log every event received from bridge
          logger.logEvent(event, 'bridge->nextjs');
        },
        error: (error: any) => {
          logger.log(`❌ ERROR: ${error}`);
          logger.logSessionEnd(threadId);
        },
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
    // @ts-ignore - HttpAgent works at runtime
    agents: {
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
