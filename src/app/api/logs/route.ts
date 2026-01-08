/**
 * API endpoint to receive and log events from the client
 * Outputs logs to server console so they appear in Vercel logs
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const logData = await request.json();

    // Output to server console - this will appear in Vercel logs
    console.log(JSON.stringify(logData));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to log:", error);
    return NextResponse.json({ error: "Failed to log" }, { status: 400 });
  }
}
