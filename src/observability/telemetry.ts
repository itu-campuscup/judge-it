/**
 * OpenTelemetry Configuration
 *
 * Simplified setup for client-side logging
 * Full OpenTelemetry is disabled for Next.js client-side compatibility
 */

// Configure basic setup
let isInitialized = false;

export function initializeOpenTelemetry(): void {
  if (isInitialized) {
    return; // Already initialized
  }

  // For client-side, we'll use simple console logging
  // OpenTelemetry SDK is better suited for server-side/Node.js environments
  isInitialized = true;
  console.log("Logging system initialized");
}

export async function shutdownOpenTelemetry(): Promise<void> {
  if (isInitialized) {
    console.log("Logging system shut down");
    isInitialized = false;
  }
}

// Initialize on module load (client-side safe)
if (typeof window === "undefined") {
  initializeOpenTelemetry();
}
