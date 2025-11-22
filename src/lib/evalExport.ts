/**
 * Eval Export Utilities
 * Convert saved conversations to ADK-compatible eval structure
 */

interface Invocation {
  invocation_id: string;
  user_content: any;
  final_response: any;
  intermediate_data: any;
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
 */
export function conversationToEvalCase(
  conversationId: string,
  conversation: Invocation[],
  appName: string = "agent_ui",
  userId: string = "default-user"
): EvalCase {
  return {
    eval_id: conversationId,
    conversation,
    session_input: {
      app_name: appName,
      user_id: userId,
    },
    creation_timestamp: Date.now() / 1000,
  };
}

/**
 * Download a conversation as an eval case JSON file
 */
export function downloadConversationAsEval(
  conversationId: string,
  conversation: Invocation[],
  appName?: string,
  userId?: string
) {
  const evalCase = conversationToEvalCase(conversationId, conversation, appName, userId);
  
  const jsonString = JSON.stringify(evalCase, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${conversationId}.eval.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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

