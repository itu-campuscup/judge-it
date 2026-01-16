/**
 * Convex Authentication Helpers for Clerk Integration
 * 
 * This file provides authentication and authorization utilities for Convex functions.
 * It integrates with Clerk to verify user identity and organization membership.
 */

import { Auth } from "convex/server";

/**
 * Get the current user's ID from Clerk authentication
 * Throws an error if the user is not authenticated
 */
export async function getCurrentUserId(auth: Auth): Promise<string> {
  const identity = await auth.getUserIdentity();
  
  if (!identity) {
    throw new Error("Not authenticated");
  }
  
  return identity.subject;
}

/**
 * Get the current user's ID, or null if not authenticated
 */
export async function getCurrentUserIdOrNull(auth: Auth): Promise<string | null> {
  const identity = await auth.getUserIdentity();
  return identity?.subject ?? null;
}

/**
 * Check if the current user is a member of the "members" organization
 * Throws an error if the user is not authenticated or not a member
 */
export async function requireMembershipInOrg(auth: Auth): Promise<void> {
  const identity = await auth.getUserIdentity();
  
  if (!identity) {
    throw new Error("Not authenticated");
  }

  // Check organization membership from Clerk's identity token
  // Clerk includes org_id, org_slug, and org_role in the JWT token
  const orgSlug = (identity as any).org_slug;
  
  if (orgSlug !== "members") {
    throw new Error("User must be a member of the 'members' organization to access this resource");
  }
}

/**
 * Check if the current user is a member of the "members" organization
 * Returns true if member, false otherwise
 */
export async function isMemberOfOrg(auth: Auth): Promise<boolean> {
  const identity = await auth.getUserIdentity();
  
  if (!identity) {
    return false;
  }

  const orgSlug = (identity as any).org_slug;
  return orgSlug === "members";
}

/**
 * Get the current user's organization role (if any)
 * Returns "admin" or "basic_member" if in an organization, null otherwise
 */
export async function getUserOrgRole(auth: Auth): Promise<string | null> {
  const identity = await auth.getUserIdentity();
  
  if (!identity) {
    return null;
  }

  return (identity as any).org_role ?? null;
}
