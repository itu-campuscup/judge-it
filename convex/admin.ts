/**
 * Admin Queries and Mutations for User Management
 *
 * These functions allow administrators to approve/disapprove users.
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireAdminUser } from "./authHelpers";

/**
 * Get current user's approval status
 */
export const getCurrentUserStatus = query({
  handler: async (ctx) => {
    try {
      const userId = await getAuthUserId(ctx);

      if (!userId) {
        return {
          authenticated: false,
          approved: false,
          isAdmin: false,
          userId: null,
          email: null,
        };
      }

      const user = await ctx.db.get(userId);

      if (!user) {
        console.error("User document not found:", userId);
        return {
          authenticated: true,
          approved: false,
          isAdmin: false,
          userId: userId,
          email: null,
        };
      }

      return {
        authenticated: true,
        approved: user?.approved === true,
        isAdmin: user?.isAdmin === true,
        userId: userId,
        email: user?.email || null,
      };
    } catch (error) {
      console.error("Error getting user status:", error);
      throw error;
    }
  },
});

/**
 * List all users (admin only)
 */
export const listUsers = query({
  handler: async (ctx) => {
    // Verify the current user is an admin
    await requireAdminUser(ctx);

    const users = await ctx.db.query("users").collect();

    return users.map((user) => ({
      _id: user._id,
      email: user.email || null,
      name: user.name || null,
      approved: user.approved || false,
      isAdmin: user.isAdmin || false,
      _creationTime: user._creationTime,
    }));
  },
});

/**
 * Approve a user (admin only)
 */
export const approveUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify the current user is an admin
    await requireAdminUser(ctx);

    await ctx.db.patch(args.userId, { approved: true });

    return { success: true };
  },
});

/**
 * Disapprove a user (admin only)
 */
export const disapproveUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify the current user is an admin
    await requireAdminUser(ctx);

    await ctx.db.patch(args.userId, { approved: false });

    return { success: true };
  },
});
