import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * POST /api/conversations/save
 * Save a conversation from conversations/ to conversations_saved/
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId } = body;

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: 'conversationId is required' },
        { status: 400 }
      );
    }

    // Sanitize conversationId to prevent path traversal
    const sanitizedId = conversationId.replace(/[^a-zA-Z0-9_-]/g, '');
    if (sanitizedId !== conversationId) {
      return NextResponse.json(
        { success: false, error: 'Invalid conversationId format' },
        { status: 400 }
      );
    }

    const conversationsDir = path.join(process.cwd(), 'conversations');
    const savedDir = path.join(process.cwd(), 'conversations_saved');
    
    console.log(`[SaveConversation] Looking for conversation: ${conversationId}`);
    console.log(`[SaveConversation] Conversations dir: ${conversationsDir}`);
    
    // Ensure saved directory exists
    if (!fs.existsSync(savedDir)) {
      fs.mkdirSync(savedDir, { recursive: true });
    }

    const sourceFile = path.join(conversationsDir, `${conversationId}.json`);
    console.log(`[SaveConversation] Source file path: ${sourceFile}`);
    console.log(`[SaveConversation] File exists: ${fs.existsSync(sourceFile)}`);
    
    // List all files in conversations directory for debugging
    if (fs.existsSync(conversationsDir)) {
      const files = fs.readdirSync(conversationsDir).filter(f => f.endsWith('.json'));
      console.log(`[SaveConversation] Available files in conversations/:`, files);
    }
    
    // Check if source file exists
    if (!fs.existsSync(sourceFile)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Conversation not found',
          debug: {
            conversationId,
            sourceFile,
            conversationsDirExists: fs.existsSync(conversationsDir),
            availableFiles: fs.existsSync(conversationsDir) 
              ? fs.readdirSync(conversationsDir).filter(f => f.endsWith('.json'))
              : []
          }
        },
        { status: 404 }
      );
    }

    // Find next available filename (handle duplicates)
    let destFilename = `${conversationId}.json`;
    let destPath = path.join(savedDir, destFilename);
    let copyNumber = 1;

    while (fs.existsSync(destPath)) {
      destFilename = `${conversationId}_copy${copyNumber}.json`;
      destPath = path.join(savedDir, destFilename);
      copyNumber++;
    }

    // Copy file
    fs.copyFileSync(sourceFile, destPath);

    console.log(`[SaveConversation] Saved ${conversationId} as ${destFilename}`);

    return NextResponse.json({
      success: true,
      savedAs: destFilename,
      path: destPath
    });
  } catch (error) {
    console.error('[SaveConversation] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

