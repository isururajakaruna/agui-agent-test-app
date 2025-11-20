import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy endpoint to fetch metadata (thinking, session_stats) from the bridge.
 * This bypasses CopilotKit's GraphQL filtering by going directly to the bridge's /metadata endpoint.
 */
export async function GET(request: NextRequest) {
  const threadId = request.nextUrl.searchParams.get('threadId');
  
  if (!threadId) {
    return NextResponse.json({ error: 'threadId is required' }, { status: 400 });
  }
  
  const bridgeUrl = process.env.ADK_BRIDGE_URL || "http://localhost:8000";
  
  try {
    const response = await fetch(`${bridgeUrl}/metadata/${threadId}`);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Bridge returned ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[MetadataProxy] Error fetching metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metadata from bridge' },
      { status: 500 }
    );
  }
}

