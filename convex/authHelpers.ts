/**
 * Convex Authentication Helpers
 *
 * This file provides authentication and authorization utilities for Convex functions.
 * Uses Convex Auth for user authentication and custom metadata for authorization.
 */

import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Get the current authenticated user's ID
 * Throws an error if the user is not authenticated
 */
export async function getCurrentUserId(
  ctx: QueryCtx | MutationCtx,
): Promise<string> {
  const userId = await getAuthUserId(ctx);

  if (!userId) {
    throw new Error("Not authenticated");
  }

  return userId;
}

/**
 * Get the current user's ID, or null if not authenticated
 */
export async function getCurrentUserIdOrNull(
  ctx: QueryCtx | MutationCtx,
): Promise<string | null> {
  return await getAuthUserId(ctx);
}

/**
 * Check if the current user is approved to use the application
 * Throws an error if the user is not authenticated or not approved
 *
 * IMPORTANT: You must manually approve users by setting approved=true in the users table
 */
export async function requireApprovedUser(
  ctx: QueryCtx | MutationCtx,
): Promise<void> {
  const userId = await getCurrentUserId(ctx);

  const user = await ctx.db.get(userId as Id<"users">);

  if (!user) {
    throw new Error("User not found");
  }

  const isApproved = (user as { approved?: boolean }).approved === true;

  if (!isApproved) {
    throw new Error(
      "Your account is pending admin approval. Please wait for an administrator to approve your access.",
    );
  }
}

/**
 * Check if the current user is approved
 * Returns true if approved, false if not authenticated or not approved
 */
export async function isApprovedUser(
  ctx: QueryCtx | MutationCtx,
): Promise<boolean> {
  try {
    await requireApprovedUser(ctx);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if the current user is an administrator
 * Throws an error if the user is not authenticated or not an admin
 */
export async function requireAdminUser(
  ctx: QueryCtx | MutationCtx,
): Promise<void> {
  const userId = await getCurrentUserId(ctx);

  const user = await ctx.db.get(userId as Id<"users">);

  if (!user) {
    throw new Error("User not found");
  }

  const isAdmin = (user as { isAdmin?: boolean }).isAdmin === true;

  if (!isAdmin) {
    throw new Error("Admin access required");
  }
}

/**
 * Check if the current user is an administrator
 * Returns true if admin, false if not authenticated or not an admin
 */
export async function isAdminUser(
  ctx: QueryCtx | MutationCtx,
): Promise<boolean> {
  try {
    await requireAdminUser(ctx);
    return true;
  } catch {
    return false;
  }
}
