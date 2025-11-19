import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";
// @ts-ignore - @ag-ui/client may not have TypeScript definitions
import { HttpAgent } from "@ag-ui/client";

// AG-UI Protocol Agent adapter
// This connects CopilotKit to any AG-UI Protocol endpoint (like our ADK Bridge)
// @ts-ignore - HttpAgent works with config parameter at runtime
class ADKAgent extends HttpAgent {}

export async function POST(request: NextRequest) {
  const bridgeUrl = process.env.ADK_BRIDGE_URL || "http://localhost:8000";

  // Create AG-UI Protocol agent
  // @ts-ignore - HttpAgent accepts url config at runtime
  const chatAgent = new ADKAgent({
    url: `${bridgeUrl}/chat`,
  });

  // Create CopilotRuntime with AG-UI Protocol agent
  const runtime = new CopilotRuntime({
    // @ts-ignore - CopilotKit accepts AG-UI Protocol endpoints
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

