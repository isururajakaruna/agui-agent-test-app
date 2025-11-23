import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface SimplifiedInvocation {
  invocation_id: string;
  user_message: string;
  agent_message: string;
  timestamp: number;
  user_rating?: number;
  user_feedback?: string;
  tool_calls?: Array<{
    name: string;
    args: any;
    result?: any;
  }>;
}

/**
 * GET /api/conversations/saved/[id]
 * Get a specific saved conversation (simplified view)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;
    
    // Sanitize ID
    const sanitizedId = conversationId.replace(/[^a-zA-Z0-9_-]/g, '');
    if (sanitizedId !== conversationId) {
      return NextResponse.json(
        { success: false, error: 'Invalid conversationId format' },
        { status: 400 }
      );
    }

    const savedDir = path.join(process.cwd(), 'conversations_saved');
    const filepath = path.join(savedDir, `${conversationId}.json`);
    
    if (!fs.existsSync(filepath)) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const content = fs.readFileSync(filepath, 'utf-8');
    const data = JSON.parse(content);
    
    if (!Array.isArray(data)) {
      return NextResponse.json(
        { success: false, error: 'Invalid conversation format' },
        { status: 400 }
      );
    }

    // Simplify the conversation (extract only user/agent messages + feedback + tool calls)
    const invocations: SimplifiedInvocation[] = data.map((inv: any) => {
      const userMessage = inv.user_content?.parts?.[0]?.text || '';
      const agentMessage = inv.final_response?.parts?.[0]?.text || '';
      const userRating = inv.final_response?._user_rating;
      const userFeedback = inv.final_response?._user_feedback;
      
      // Extract tool calls from intermediate_data.invocation_events
      const toolCalls: Array<{name: string; args: any; result?: any}> = [];
      const events = inv.intermediate_data?.invocation_events || [];
      
      // Group function calls with their responses
      const callMap = new Map<string, {name: string; args: any; result?: any}>();
      
      events.forEach((event: any) => {
        const parts = event.content?.parts || [];
        parts.forEach((part: any) => {
          if (part.function_call) {
            // Filter out "thinking" and "transfer_to_agent" (ADK internal) tool calls
            if (part.function_call.name !== 'thinking' && part.function_call.name !== 'transfer_to_agent') {
              callMap.set(part.function_call.id, {
                name: part.function_call.name,
                args: part.function_call.args,
              });
            }
          } else if (part.function_response) {
            // Match response to call
            const call = callMap.get(part.function_response.id);
            if (call) {
              call.result = part.function_response.response;
            }
          }
        });
      });
      
      // Convert map to array
      toolCalls.push(...Array.from(callMap.values()));
      
      return {
        invocation_id: inv.invocation_id,
        user_message: userMessage,
        agent_message: agentMessage,
        timestamp: inv.creation_timestamp || 0,
        ...(userRating && { user_rating: userRating }),
        ...(userFeedback && { user_feedback: userFeedback }),
        ...(toolCalls.length > 0 && { tool_calls: toolCalls }),
      };
    });

    return NextResponse.json({
      id: conversationId,
      invocations
    });
  } catch (error) {
    console.error('[GetSavedConversation] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/conversations/saved/[id]
 * Delete a saved conversation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;
    
    // Sanitize ID
    const sanitizedId = conversationId.replace(/[^a-zA-Z0-9_-]/g, '');
    if (sanitizedId !== conversationId) {
      return NextResponse.json(
        { success: false, error: 'Invalid conversationId format' },
        { status: 400 }
      );
    }

    const savedDir = path.join(process.cwd(), 'conversations_saved');
    const filepath = path.join(savedDir, `${conversationId}.json`);
    
    if (!fs.existsSync(filepath)) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    fs.unlinkSync(filepath);
    
    console.log(`[DeleteSavedConversation] Deleted ${conversationId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DeleteSavedConversation] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}


