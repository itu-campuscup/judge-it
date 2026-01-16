import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convex Schema for Judge-It Application
 *
 * This schema defines the database structure migrated from Supabase.
 * All tables maintain compatibility with existing TypeScript interfaces.
 */

export default defineSchema({
  // Players table - stores contestant information
  players: defineTable({
    name: v.string(),
    image_url: v.optional(v.string()),
    fun_fact: v.optional(v.string()),
  }).index("by_name", ["name"]),

  // Teams table - stores team information and player assignments
  teams: defineTable({
    name: v.string(),
    player_1_id: v.optional(v.id("players")),
    player_2_id: v.optional(v.id("players")),
    player_3_id: v.optional(v.id("players")),
    player_4_id: v.optional(v.id("players")),
    image_url: v.optional(v.string()),
    is_out: v.optional(v.boolean()),
  })
    .index("by_name", ["name"])
    .index("by_is_out", ["is_out"]),

  // Heats table - stores competition rounds
  heats: defineTable({
    name: v.optional(v.string()),
    heat: v.number(),
    date: v.string(),
    is_current: v.boolean(),
  })
    .index("by_heat", ["heat"])
    .index("by_is_current", ["is_current"])
    .index("by_date", ["date"]),

  // Time types table - defines different activity types (Beer, Sail, Spin)
  time_types: defineTable({
    name: v.string(),
    time_eng: v.string(),
    description: v.optional(v.string()),
  })
    .index("by_name", ["name"])
    .index("by_time_eng", ["time_eng"]),

  // Time logs table - stores all timing records
  time_logs: defineTable({
    player_id: v.id("players"),
    team_id: v.optional(v.id("teams")),
    heat_id: v.id("heats"),
    time_type_id: v.id("time_types"),
    time_seconds: v.number(),
    time: v.optional(v.string()), // Formatted time string "HH:MM:SS"
  })
    .index("by_player", ["player_id"])
    .index("by_team", ["team_id"])
    .index("by_heat", ["heat_id"])
    .index("by_time_type", ["time_type_id"])
    .index("by_heat_and_type", ["heat_id", "time_type_id"])
    .index("by_team_and_heat", ["team_id", "heat_id"])
    .index("by_player_and_heat", ["player_id", "heat_id"]),
});
