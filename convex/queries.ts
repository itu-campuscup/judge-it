import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Convex Queries for Judge-It Application
 *
 * These queries replace Supabase SELECT operations with Convex queries.
 * All queries return data compatible with existing TypeScript interfaces.
 */

// Get all players
export const getPlayers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("players").collect();
  },
});

// Get a single player by ID
export const getPlayer = query({
  args: { id: v.id("players") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get all teams
export const getTeams = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("teams").collect();
  },
});

// Get active teams (not eliminated)
export const getActiveTeams = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("teams")
      .filter((q) =>
        q.or(
          q.eq(q.field("is_out"), false),
          q.eq(q.field("is_out"), undefined),
        ),
      )
      .collect();
  },
});

// Get a single team by ID
export const getTeam = query({
  args: { id: v.id("teams") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get all heats
export const getHeats = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("heats").order("desc").collect();
  },
});

// Get current heat
export const getCurrentHeat = query({
  args: {},
  handler: async (ctx) => {
    const heats = await ctx.db
      .query("heats")
      .withIndex("by_is_current", (q) => q.eq("is_current", true))
      .collect();
    return heats[0] ?? null;
  },
});

// Get heats by year
export const getHeatsByYear = query({
  args: { year: v.number() },
  handler: async (ctx, args) => {
    const allHeats = await ctx.db.query("heats").collect();
    return allHeats.filter((heat) => {
      const heatYear = new Date(heat.date).getFullYear();
      return heatYear === args.year;
    });
  },
});

// Get all time types
export const getTimeTypes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("time_types").collect();
  },
});

// Get time type by name
export const getTimeTypeByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const types = await ctx.db
      .query("time_types")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .collect();
    return types[0] ?? null;
  },
});

// Get all time logs
export const getTimeLogs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("time_logs").collect();
  },
});

// Get time logs by heat
export const getTimeLogsByHeat = query({
  args: { heatId: v.id("heats") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("time_logs")
      .withIndex("by_heat", (q) => q.eq("heat_id", args.heatId))
      .collect();
  },
});

// Get time logs by player
export const getTimeLogsByPlayer = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("time_logs")
      .withIndex("by_player", (q) => q.eq("player_id", args.playerId))
      .collect();
  },
});

// Get time logs by team
export const getTimeLogsByTeam = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("time_logs")
      .withIndex("by_team", (q) => q.eq("team_id", args.teamId))
      .collect();
  },
});

// Get time logs by heat and time type
export const getTimeLogsByHeatAndType = query({
  args: {
    heatId: v.id("heats"),
    timeTypeId: v.id("time_types"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("time_logs")
      .withIndex("by_heat_and_type", (q) =>
        q.eq("heat_id", args.heatId).eq("time_type_id", args.timeTypeId),
      )
      .collect();
  },
});

// Get time logs by team and heat
export const getTimeLogsByTeamAndHeat = query({
  args: {
    teamId: v.id("teams"),
    heatId: v.id("heats"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("time_logs")
      .withIndex("by_team_and_heat", (q) =>
        q.eq("team_id", args.teamId).eq("heat_id", args.heatId),
      )
      .collect();
  },
});
