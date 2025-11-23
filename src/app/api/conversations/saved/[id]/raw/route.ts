import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

/**
 * GET /api/conversations/saved/:id/raw
 * Returns the raw conversation JSON (not transformed for UI)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;
    const filePath = path.join(
      process.cwd(),
      'conversations_saved',
      `${conversationId}.json`
    );

    console.log('[API /raw] Reading conversation:', conversationId);
    console.log('[API /raw] File path:', filePath);

    // Read the raw file
    const fileContent = await fs.readFile(filePath, 'utf-8');
    console.log('[API /raw] File content length:', fileContent.length);
    
    const data = JSON.parse(fileContent);
    console.log('[API /raw] Is array:', Array.isArray(data));
    console.log('[API /raw] Data type:', typeof data);
    if (Array.isArray(data)) {
      console.log('[API /raw] Invocations count:', data.length);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API /raw] Error reading raw conversation:', error);
    return NextResponse.json(
      { error: 'Conversation not found', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 404 }
    );
  }
}

