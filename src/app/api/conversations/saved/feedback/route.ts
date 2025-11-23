import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CONVERSATIONS_SAVED_DIR = path.join(process.cwd(), "conversations_saved");

export async function POST(request: NextRequest) {
  try {
    const { conversationId, invocationId, rating, comment } = await request.json();

    if (!conversationId || !invocationId) {
      return NextResponse.json(
        { error: "conversationId and invocationId are required" },
        { status: 400 }
      );
    }

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "rating must be a number between 1 and 5" },
        { status: 400 }
      );
    }

    const conversationPath = path.join(CONVERSATIONS_SAVED_DIR, `${conversationId}.json`);

    if (!fs.existsSync(conversationPath)) {
      return NextResponse.json(
        { error: "Saved conversation not found" },
        { status: 404 }
      );
    }

    // Read conversation
    const conversationData = JSON.parse(
      fs.readFileSync(conversationPath, "utf-8")
    );

    // Find the invocation and update the final_response with feedback
    let found = false;
    for (const invocation of conversationData) {
      if (invocation.invocation_id === invocationId) {
        // Add feedback to final_response
        if (!invocation.final_response) {
          invocation.final_response = { role: "model", parts: [] };
        }
        
        invocation.final_response._user_rating = rating;
        invocation.final_response._user_feedback = comment || "";
        
        found = true;
        console.log(`[API /api/conversations/saved/feedback] Updated feedback for invocation ${invocationId}: rating=${rating}`);
        break;
      }
    }

    if (!found) {
      return NextResponse.json(
        { error: "Invocation not found in conversation" },
        { status: 404 }
      );
    }

    // Write updated conversation back
    fs.writeFileSync(
      conversationPath,
      JSON.stringify(conversationData, null, 2),
      "utf-8"
    );

    return NextResponse.json({
      success: true,
      message: "Feedback saved successfully",
    });
  } catch (error) {
    console.error("[API /api/conversations/saved/feedback] Error:", error);
    return NextResponse.json(
      { error: "Failed to save feedback" },
      { status: 500 }
    );
  }
}

