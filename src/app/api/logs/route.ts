/**
 * API endpoint to receive and log events from the client
 * Outputs logs to server console so they appear in Vercel logs
 * 
 * Returns HTTP status code matching the log level:
 * - info: 200
 * - warn: 206
 * - error: 400
 * - debug: 200
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const logData = await request.json();

    // Output to server console - this will appear in Vercel logs
    console.log(JSON.stringify(logData));

    // Return appropriate HTTP status code based on log level
    const statusCode = getStatusCodeForLevel(logData.level);
    return NextResponse.json({ success: true }, { status: statusCode });
  } catch (error) {
    console.error("Failed to log:", error);
    return NextResponse.json({ error: "Failed to log" }, { status: 400 });
  }
}

/**
 * Map log level to HTTP status code
 */
function getStatusCodeForLevel(level: string): number {
  switch (level) {
    case "error":
      return 400;
    case "warn":
      return 206; // Partial Content - indicates warning
    case "info":
    case "debug":
    default:
      return 200;
  }
}
