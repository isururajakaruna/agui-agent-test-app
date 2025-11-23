import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * PUT /api/conversations/saved/[id]/edit
 * Edit an agent message in a saved conversation
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;
    const body = await request.json();
    const { invocationId, newAgentMessage } = body;

    if (!invocationId || newAgentMessage === undefined) {
      return NextResponse.json(
        { success: false, error: 'invocationId and newAgentMessage are required' },
        { status: 400 }
      );
    }

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

    // Find and update the invocation
    let found = false;
    for (const inv of data) {
      if (inv.invocation_id === invocationId) {
        // Update the final_response text
        if (inv.final_response && inv.final_response.parts && inv.final_response.parts.length > 0) {
          inv.final_response.parts[0].text = newAgentMessage;
          found = true;
          break;
        }
      }
    }

    if (!found) {
      return NextResponse.json(
        { success: false, error: 'Invocation not found' },
        { status: 404 }
      );
    }

    // Write back to file
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');

    console.log(`[EditSavedConversation] Updated invocation ${invocationId} in ${conversationId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[EditSavedConversation] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}


