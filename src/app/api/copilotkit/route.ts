import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";

// Simple AG-UI Protocol Agent adapter
// This connects CopilotKit to any AG-UI Protocol endpoint (like our ADK Bridge)
class ADKAgent {
  name: string;
  url: string;

  constructor(config: { url: string; name?: string }) {
    this.url = config.url;
    this.name = config.name || "default";
  }
}

export async function POST(request: NextRequest) {
  const bridgeUrl = process.env.ADK_BRIDGE_URL || "http://localhost:8000";

  // Create AG-UI Protocol agent
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

