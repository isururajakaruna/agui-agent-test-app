export interface ToolCallStatus {
  toolCallId: string;
  toolCallName: string;
  args?: Record<string, any>;
  result?: any;
  status: "inProgress" | "executing" | "complete" | "error";
  timestamp: Date;
}

export interface AgentMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  toolCalls?: ToolCallStatus[];
}

export interface ThinkingState {
  isThinking: boolean;
  tokenCount?: number;
  message?: string;
}

