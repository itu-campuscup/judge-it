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
    const rawData = await request.json();

    // Basic validation and sanitization to prevent log injection and resource abuse
    if (!rawData || typeof rawData !== "object") {
      return NextResponse.json({ error: "Invalid log format" }, { status: 400 });
    }

    const allowedLevels = ["info", "warn", "error", "debug"];
    const level = allowedLevels.includes(rawData.level) ? rawData.level : "info";

    // Security: Sanitize and limit input to prevent log injection and resource abuse (DoS)
    const logData = {
      timestamp:
        typeof rawData.timestamp === "string"
          ? rawData.timestamp.slice(0, 100)
          : new Date().toISOString(),
      level,
      endpoint:
        typeof rawData.endpoint === "string"
          ? rawData.endpoint.slice(0, 255)
          : "unknown",
      operation:
        typeof rawData.operation === "string"
          ? rawData.operation.slice(0, 255)
          : "unknown",
      user:
        rawData.user && typeof rawData.user === "object"
          ? {
              id:
                typeof rawData.user.id === "string"
                  ? rawData.user.id.slice(0, 100)
                  : "unknown",
              email:
                typeof rawData.user.email === "string"
                  ? rawData.user.email
                      .slice(0, 255)
                      .replace(/(..)(.*)(@.*)/, "$1***$3") // Security: Mask PII in logs
                  : undefined,
            }
          : undefined,
      duration:
        typeof rawData.duration === "number" ? rawData.duration : undefined,
      // Security: Truncate large data payloads to prevent log flooding
      data:
        rawData.data && typeof rawData.data === "object"
          ? JSON.stringify(rawData.data).slice(0, 2000)
          : undefined,
      error:
        rawData.error && typeof rawData.error === "object"
          ? {
              message:
                typeof rawData.error.message === "string"
                  ? rawData.error.message.slice(0, 1000)
                  : "Unknown error",
              stack:
                typeof rawData.error.stack === "string"
                  ? rawData.error.stack.slice(0, 2000)
                  : undefined,
            }
          : undefined,
    };

    // Output to server console - this will appear in Vercel logs
    console.log(JSON.stringify(logData, null, 2));

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
