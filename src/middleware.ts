import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes (accessible without authentication)
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/pending-approval",
  "/api/logs", // Keep logs endpoint public for error reporting
]);

export default clerkMiddleware(async (auth, request) => {
  // Allow access to public routes
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // Require authentication for protected routes
  const { userId, redirectToSignIn, has } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  console.log("Resp: ", await auth());

  // Check if user is a member of the "members" organization
  const isMember = has ? has({ organization: "members" }) : false;

  if (!isMember) {
    return NextResponse.redirect(new URL("/pending-approval", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
