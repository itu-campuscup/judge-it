import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy for the Judge-It application runtime.
 *
 * It currently lets every request pass through. Convex Auth enforces
 * authorization inside the UI/data layer instead of the runtime proxy.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
