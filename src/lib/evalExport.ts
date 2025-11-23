/**
 * Eval Export Utilities
 * Convert saved conversations to ADK-compatible eval structure
 */

interface Invocation {
  invocation_id: string;
  user_content: any;
  final_response: any;
  intermediate_data: any;  // Should be empty object {} at top level, not contain invocation_events
  creation_timestamp: number;
}

interface EvalCase {
  eval_id: string;
  conversation: Invocation[];
  session_input: {
    app_name: string;
    user_id: string;
  };
  creation_timestamp: number;
}

interface EvalSet {
  eval_set_id: string;
  name: string;
  eval_cases: EvalCase[];
  creation_timestamp: number;
}

/**
 * Convert a single conversation to ADK eval case format
 * Preserves intermediate_data.invocation_events when present
 */
export function conversationToEvalCase(
  conversationId: string,
  conversation: Invocation[],
  appName: string = "agent_ui",
  userId: string = "user"
): EvalCase {
  // Keep intermediate_data as-is (with invocation_events if they exist)
  // If invocation_events is empty array, it becomes empty object
  const cleanedConversation = conversation.map(inv => {
    const events = inv.intermediate_data?.invocation_events;
    return {
      ...inv,
      intermediate_data: (events && events.length > 0) 
        ? { invocation_events: events }  // Keep events if present
        : {}  // Empty object if no events
    };
  });
  
  return {
    eval_id: conversationId,
    conversation: cleanedConversation,
    session_input: {
      app_name: appName,
      user_id: userId,
    },
    creation_timestamp: Date.now() / 1000,
  };
}

/**
 * Generate a random 8-character alphanumeric eval set ID
 */
function generateEvalSetId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Download a conversation as an eval set JSON file (ADK format)
 * Wraps single conversation in an eval_set structure
 */
export function downloadConversationAsEval(
  conversationId: string,
  conversation: Invocation[],
  appName?: string,
  userId?: string
) {
  console.log('[evalExport] Starting download for:', conversationId);
  console.log('[evalExport] Conversation data:', conversation);
  
  // Create eval case from conversation
  const evalCase = conversationToEvalCase(conversationId, conversation, appName, userId);
  console.log('[evalExport] Eval case created:', evalCase);
  
  // Generate random 8-digit eval set ID
  const evalSetId = generateEvalSetId();
  
  // Wrap in eval set structure (CRITICAL: must be an eval_set, not eval_case directly)
  const evalSet: EvalSet = {
    eval_set_id: evalSetId,
    name: evalSetId,  // Same as eval_set_id
    eval_cases: [evalCase],  // Array with single case
    creation_timestamp: Date.now() / 1000,
  };
  
  console.log('[evalExport] Eval set created with ID:', evalSetId);
  
  const jsonString = JSON.stringify(evalSet, null, 2);
  console.log('[evalExport] JSON string length:', jsonString.length);
  
  const blob = new Blob([jsonString], { type: 'application/json' });
  console.log('[evalExport] Blob created:', blob.size, 'bytes');
  
  const url = URL.createObjectURL(blob);
  console.log('[evalExport] Blob URL created:', url);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${evalSetId}.evalset.json`;  // Filename matches eval_set_id
  console.log('[evalExport] Download link created:', link.download);
  
  document.body.appendChild(link);
  link.click();
  console.log('[evalExport] Link clicked');
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  console.log('[evalExport] Cleanup complete');
}

/**
 * Download multiple conversations as an eval set JSON file
 */
export function downloadConversationsAsEvalSet(
  conversations: Array<{ id: string; data: Invocation[] }>,
  evalSetId?: string,
  appName?: string,
  userId?: string
) {
  const setId = evalSetId || `evalset${Math.random().toString(36).substring(2, 8)}`;
  
  const evalSet: EvalSet = {
    eval_set_id: setId,
    name: setId,
    eval_cases: conversations.map(({ id, data }) =>
      conversationToEvalCase(id, data, appName, userId)
    ),
    creation_timestamp: Date.now() / 1000,
  };
  
  const jsonString = JSON.stringify(evalSet, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${setId}.evalset.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

