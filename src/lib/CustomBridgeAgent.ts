/**
 * Custom Bridge Agent - Direct SSE streaming from Agent Engine Bridge
 * 
 * This custom implementation connects directly to the Python bridge's /chat endpoint
 * and streams AG-UI Protocol events to CopilotKit without using @ag-ui/client.
 * 
 * Benefits:
 * - No external dependencies
 * - Full control over event parsing
 * - Direct SSE streaming
 * - Works seamlessly with CopilotKit UI
 */

interface Message {
  id?: string;
  role: string;
  content: string | Array<{ type: string; text?: string }>;
}

interface RunAgentInput {
  threadId: string;
  messages: Message[];
  [key: string]: any;
}

interface AgentEvent {
  type: string;
  [key: string]: any;
}

export class CustomBridgeAgent {
  private bridgeUrl: string;

  constructor(bridgeUrl: string) {
    this.bridgeUrl = bridgeUrl;
  }

  /**
   * Legacy method required by CopilotKit's internal runtime
   * This is the method CopilotKit actually calls for remote agents
   */
  async *legacy_to_be_removed_runAgentBridged(input: RunAgentInput): AsyncGenerator<AgentEvent> {
    // Delegate to our main run method
    yield* this.run(input);
  }

  /**
   * Main run method that CopilotKit calls
   * Streams events from the bridge and yields them to CopilotKit
   */
  async *run(input: RunAgentInput): AsyncGenerator<AgentEvent> {
    console.log('[CustomBridgeAgent] Starting run', {
      threadId: input.threadId,
      messageCount: input.messages?.length || 0,
    });

    try {
      // Make POST request to bridge's /chat endpoint
      const response = await fetch(`${this.bridgeUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(`Bridge returned ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body from bridge');
      }

      // Parse SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('[CustomBridgeAgent] Stream complete');
          break;
        }

        // Decode chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE events
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6); // Remove 'data: ' prefix
            
            try {
              const event = JSON.parse(data);
              console.log('[CustomBridgeAgent] Event received:', event.type);
              
              // Yield event to CopilotKit
              yield event;
            } catch (error) {
              console.warn('[CustomBridgeAgent] Failed to parse event:', data, error);
            }
          }
        }
      }
    } catch (error) {
      console.error('[CustomBridgeAgent] Stream error:', error);
      
      // Yield error event
      yield {
        type: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Optional: Provide agent metadata
   */
  getMetadata() {
    return {
      name: 'Agent Engine Bridge',
      description: 'Custom agent connecting to Google Agent Engine via Python bridge',
      version: '1.0.0',
    };
  }
}

