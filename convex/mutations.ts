import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireApprovedUser } from "./authHelpers";

/**
 * Convex Mutations for Judge-It Application
 *
 * These mutations replace Supabase INSERT/UPDATE/DELETE operations.
 * All mutations maintain data integrity and return appropriate responses.
 * All mutations require the user to be authenticated and approved by an admin.
 */

// ============ PLAYER MUTATIONS ============

export const createPlayer = mutation({
  args: {
    name: v.string(),
    image_url: v.optional(v.string()),
    fun_fact: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireApprovedUser(ctx);
    const playerId = await ctx.db.insert("players", args);
    return playerId;
  },
});

export const updatePlayer = mutation({
  args: {
    id: v.id("players"),
    name: v.optional(v.string()),
    image_url: v.optional(v.string()),
    fun_fact: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireApprovedUser(ctx);
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const deletePlayer = mutation({
  args: { id: v.id("players") },
  handler: async (ctx, args) => {
    await requireApprovedUser(ctx);
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// ============ TEAM MUTATIONS ============

export const createTeam = mutation({
  args: {
    name: v.string(),
    player_1_id: v.optional(v.id("players")),
    player_2_id: v.optional(v.id("players")),
    player_3_id: v.optional(v.id("players")),
    player_4_id: v.optional(v.id("players")),
    image_url: v.optional(v.string()),
    is_out: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireApprovedUser(ctx);
    const teamId = await ctx.db.insert("teams", args);
    return teamId;
  },
});

export const updateTeam = mutation({
  args: {
    id: v.id("teams"),
    name: v.optional(v.string()),
    player_1_id: v.optional(v.id("players")),
    player_2_id: v.optional(v.id("players")),
    player_3_id: v.optional(v.id("players")),
    player_4_id: v.optional(v.id("players")),
    image_url: v.optional(v.string()),
    is_out: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireApprovedUser(ctx);
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const deleteTeam = mutation({
  args: { id: v.id("teams") },
  handler: async (ctx, args) => {
    await requireApprovedUser(ctx);
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// ============ HEAT MUTATIONS ============

export const createHeat = mutation({
  args: {
    name: v.optional(v.string()),
    heat: v.number(),
    date: v.string(),
    is_current: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireApprovedUser(ctx);
    // If setting this heat as current, unset all others
    if (args.is_current) {
      const currentHeats = await ctx.db
        .query("heats")
        .withIndex("by_is_current", (q) => q.eq("is_current", true))
        .collect();

      for (const heat of currentHeats) {
        await ctx.db.patch(heat._id, { is_current: false });
      }
    }

    const heatId = await ctx.db.insert("heats", args);
    return heatId;
  },
});

export const updateHeat = mutation({
  args: {
    id: v.id("heats"),
    name: v.optional(v.string()),
    heat: v.optional(v.number()),
    date: v.optional(v.string()),
    is_current: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireApprovedUser(ctx);
    const { id, ...updates } = args;

    // If setting this heat as current, unset all others
    if (updates.is_current === true) {
      const currentHeats = await ctx.db
        .query("heats")
        .withIndex("by_is_current", (q) => q.eq("is_current", true))
        .collect();

      for (const heat of currentHeats) {
        if (heat._id !== id) {
          await ctx.db.patch(heat._id, { is_current: false });
        }
      }
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

export const deleteHeat = mutation({
  args: { id: v.id("heats") },
  handler: async (ctx, args) => {
    await requireApprovedUser(ctx);
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Set a heat as current (convenience mutation)
export const setCurrentHeat = mutation({
  args: { id: v.id("heats") },
  handler: async (ctx, args) => {
    await requireApprovedUser(ctx);
    // Unset all current heats
    const currentHeats = await ctx.db
      .query("heats")
      .withIndex("by_is_current", (q) => q.eq("is_current", true))
      .collect();

    for (const heat of currentHeats) {
      await ctx.db.patch(heat._id, { is_current: false });
    }

    // Set the specified heat as current
    await ctx.db.patch(args.id, { is_current: true });
    return args.id;
  },
});

// ============ TIME TYPE MUTATIONS ============

export const createTimeType = mutation({
  args: {
    name: v.string(),
    time_eng: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireApprovedUser(ctx);
    const typeId = await ctx.db.insert("time_types", args);
    return typeId;
  },
});

export const updateTimeType = mutation({
  args: {
    id: v.id("time_types"),
    name: v.optional(v.string()),
    time_eng: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireApprovedUser(ctx);
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const deleteTimeType = mutation({
  args: { id: v.id("time_types") },
  handler: async (ctx, args) => {
    await requireApprovedUser(ctx);
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// ============ TIME LOG MUTATIONS ============

export const createTimeLog = mutation({
  args: {
    player_id: v.id("players"),
    team_id: v.optional(v.id("teams")),
    heat_id: v.id("heats"),
    time_type_id: v.id("time_types"),
  },
  handler: async (ctx, args) => {
    await requireApprovedUser(ctx);

    // Use Convex/server time so timestamps are authoritative and consistent across clients
    const maybeNow = (ctx as { now?: unknown }).now;
    const now = maybeNow instanceof Date ? maybeNow : new Date();
    const timeSeconds =
      now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const timeString = now.toLocaleTimeString("en-GB", { hour12: false });

    const logId = await ctx.db.insert("time_logs", {
      ...args,
      time_seconds: timeSeconds,
      time: timeString,
    });

    return logId;
  },
});

export const updateTimeLog = mutation({
  args: {
    id: v.id("time_logs"),
    player_id: v.optional(v.id("players")),
    team_id: v.optional(v.id("teams")),
    heat_id: v.optional(v.id("heats")),
    time_type_id: v.optional(v.id("time_types")),
    time_seconds: v.optional(v.number()),
    time: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireApprovedUser(ctx);
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const deleteTimeLog = mutation({
  args: { id: v.id("time_logs") },
  handler: async (ctx, args) => {
    await requireApprovedUser(ctx);
    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const createTimeLogsBatch = mutation({
  args: {
    logs: v.array(
      v.object({
        player_id: v.id("players"),
        team_id: v.optional(v.id("teams")),
        time_type_id: v.id("time_types"),
        heat_id: v.id("heats"),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireApprovedUser(ctx);

    // Compute a single server-side timestamp to use for any logs that don't supply one.
    const maybeNow = (ctx as { now?: unknown }).now;
    const now = maybeNow instanceof Date ? maybeNow : new Date();
    const seconds =
      now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const timeString = now.toLocaleTimeString("en-GB", { hour12: false });

    const ids = [];
    for (const log of args.logs) {
      const insertPayload = {
        player_id: log.player_id,
        team_id: log.team_id,
        heat_id: log.heat_id,
        time_type_id: log.time_type_id,
        time_seconds: seconds,
        time: timeString,
      };
      const id = await ctx.db.insert("time_logs", insertPayload);
      ids.push(id);
    }
    return ids;
  },
});

// Import-only mutation for batch inserting time logs with specific times (from CSV data)
export const importTimeLogsBatch = mutation({
  args: {
    logs: v.array(
      v.object({
        player_id: v.id("players"),
        team_id: v.optional(v.id("teams")),
        time_type_id: v.id("time_types"),
        heat_id: v.id("heats"),
        time_seconds: v.number(),
        time: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireApprovedUser(ctx);

    const ids = [];
    for (const log of args.logs) {
      const id = await ctx.db.insert("time_logs", {
        player_id: log.player_id,
        team_id: log.team_id,
        heat_id: log.heat_id,
        time_type_id: log.time_type_id,
        time_seconds: log.time_seconds,
        time: log.time,
      });
      ids.push(id);
    }
    return ids;
  },
});
