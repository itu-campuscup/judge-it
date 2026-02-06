import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware for Judge-It Application
 *
 * Currently allows all routes. Authentication is handled by Convex Auth
 * at the component/query/mutation level.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function middleware(_request: NextRequest) {
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
