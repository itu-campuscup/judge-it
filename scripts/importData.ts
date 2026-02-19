/**
 * Data Import Script for Convex
 *
 * This script imports CSV data from Supabase export into Convex database.
 * Run this once to populate your Convex database with existing data.
 *
 * Usage:
 *   bun run scripts/importData.ts
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { readAppConfig } from "../src/config";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";
import { Id } from "../convex/_generated/dataModel";

const CSV_DIR = path.join(process.cwd(), "exported-csv-data-from-supabase");

// Helper to read and parse CSV
function readCSV<T>(filename: string): T[] {
  const filePath = path.join(CSV_DIR, filename);
  const content = fs.readFileSync(filePath, "utf-8");
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    cast: (value, context) => {
      // Handle booleans
      if (value === "true") return true;
      if (value === "false") return false;
      // Handle numbers
      if (context.column !== "name" && /^\d+$/.test(value)) {
        return parseInt(value);
      }
      if (context.column !== "name" && /^\d+\.\d+$/.test(value)) {
        return parseFloat(value);
      }
      // Return as string
      return value;
    },
    cast_date: false,
  });
}

// Convert time string "HH:MM:SS.mmm" to seconds
function timeToSeconds(timeString: string): number {
  const parts = timeString.split(":");
  const hours = parseInt(parts[0]);
  const minutes = parseInt(parts[1]);
  const seconds = parseFloat(parts[2]);
  return hours * 3600 + minutes * 60 + seconds;
}

interface PlayerRow {
  id: number;
  name: string;
  image_url: string;
  fun_fact: string;
}

interface TeamRow {
  id: number;
  name: string;
  player_1_id: number;
  player_2_id: number;
  player_3_id: number;
  player_4_id: number;
  image_url: string;
  is_out: boolean;
}

interface HeatRow {
  id: number;
  heat: number;
  is_current: boolean;
  date: string;
}

interface TimeTypeRow {
  id: number;
  time_eng: string;
  time_da: string;
  is_participant_side: boolean;
}

interface TimeLogRow {
  id: number;
  team_id: number;
  time_type_id: number;
  time: string;
  player_id: number;
  heat_id: number;
}

async function importData() {
  const fromEnv = process.env.NEXT_PUBLIC_CONVEX_URL;
  const convexUrl = fromEnv ?? (await readAppConfig()).convex.url;
  const authTokenRaw = process.env.CONVEX_AUTH_TOKEN;

  if (!authTokenRaw) {
    throw new Error(
      "CONVEX_AUTH_TOKEN environment variable is required for import. Use a valid auth token for an approved user and run: CONVEX_AUTH_TOKEN=... bun run scripts/importData.ts",
    );
  }

  const authTokenCandidate = authTokenRaw.trim();
  const jwtMatch = authTokenCandidate.match(
    /[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/,
  );
  const authToken = jwtMatch?.[0] ?? authTokenCandidate;

  const client = new ConvexHttpClient(convexUrl);
  client.setAuth(authToken);

  console.log("Starting data import...\n");

  try {
    // Step 1: Import Players
    console.log("📝 Importing players...");
    const players = readCSV<PlayerRow>("players_rows.csv");
    const playerIdMap = new Map<number, string>(); // Map old ID to new Convex ID

    for (const player of players) {
      const convexId = await client.mutation(api.mutations.createPlayer, {
        name: player.name.trim(),
        image_url: player.image_url || undefined,
        fun_fact: player.fun_fact || undefined,
      });
      playerIdMap.set(player.id, convexId as string);
      console.log(
        `  ✓ Created player: ${player.name} (${player.id} -> ${convexId})`,
      );
    }
    console.log(`✅ Imported ${players.length} players\n`);

    // Step 2: Import Time Types
    console.log("📝 Importing time types...");
    const timeTypes = readCSV<TimeTypeRow>("time_types_rows.csv");
    const timeTypeIdMap = new Map<number, string>();

    for (const timeType of timeTypes) {
      const convexId = await client.mutation(api.mutations.createTimeType, {
        name: timeType.time_da,
        time_eng: timeType.time_eng,
        description: `${timeType.time_eng} - ${timeType.time_da}`,
      });
      timeTypeIdMap.set(timeType.id, convexId as string);
      console.log(
        `  ✓ Created time type: ${timeType.time_eng} (${timeType.id} -> ${convexId})`,
      );
    }
    console.log(`✅ Imported ${timeTypes.length} time types\n`);

    // Step 3: Import Heats
    console.log("📝 Importing heats...");
    const heats = readCSV<HeatRow>("heats_rows.csv");
    const heatIdMap = new Map<number, string>();

    for (const heat of heats) {
      const convexId = await client.mutation(api.mutations.createHeat, {
        name: `Heat ${heat.heat}`,
        heat: heat.heat,
        date: heat.date,
        is_current: heat.is_current,
      });
      heatIdMap.set(heat.id, convexId as string);
      console.log(
        `  ✓ Created heat: ${heat.heat} on ${heat.date} (${heat.id} -> ${convexId})`,
      );
    }
    console.log(`✅ Imported ${heats.length} heats\n`);

    // Step 4: Import Teams
    console.log("📝 Importing teams...");
    const teams = readCSV<TeamRow>("teams_rows.csv");
    const teamIdMap = new Map<number, string>();

    for (const team of teams) {
      const convexId = await client.mutation(api.mutations.createTeam, {
        name: team.name,
        player_1_id: playerIdMap.get(team.player_1_id) as
          | Id<"players">
          | undefined,
        player_2_id: playerIdMap.get(team.player_2_id) as
          | Id<"players">
          | undefined,
        player_3_id: playerIdMap.get(team.player_3_id) as
          | Id<"players">
          | undefined,
        player_4_id: playerIdMap.get(team.player_4_id) as
          | Id<"players">
          | undefined,
        image_url: team.image_url || undefined,
        is_out: team.is_out,
      });
      teamIdMap.set(team.id, convexId as string);
      console.log(`  ✓ Created team: ${team.name} (${team.id} -> ${convexId})`);
    }
    console.log(`✅ Imported ${teams.length} teams\n`);

    // Step 5: Import Time Logs (in batches for better performance)
    console.log("📝 Importing time logs...");
    const timeLogs = readCSV<TimeLogRow>("time_logs_rows.csv");
    const BATCH_SIZE = 50;
    let imported = 0;

    for (let i = 0; i < timeLogs.length; i += BATCH_SIZE) {
      const batch = timeLogs.slice(i, i + BATCH_SIZE);
      const batchData = batch.map((log) => ({
        player_id: playerIdMap.get(log.player_id)! as Id<"players">,
        team_id: teamIdMap.get(log.team_id) as Id<"teams"> | undefined,
        heat_id: heatIdMap.get(log.heat_id)! as Id<"heats">,
        time_type_id: timeTypeIdMap.get(log.time_type_id)! as Id<"time_types">,
        time_seconds: timeToSeconds(log.time),
        time: log.time,
      })) as {
        player_id: Id<"players">;
        team_id?: Id<"teams">;
        heat_id: Id<"heats">;
        time_type_id: Id<"time_types">;
        time_seconds: number;
        time?: string;
      }[];

      await client.mutation(api.mutations.createTimeLogsBatch, {
        logs: batchData,
      });

      imported += batch.length;
      console.log(`  ✓ Imported ${imported}/${timeLogs.length} time logs...`);
    }
    console.log(`✅ Imported ${timeLogs.length} time logs\n`);

    console.log("🎉 Data import completed successfully!");
    console.log("\nSummary:");
    console.log(`  - ${players.length} players`);
    console.log(`  - ${teams.length} teams`);
    console.log(`  - ${heats.length} heats`);
    console.log(`  - ${timeTypes.length} time types`);
    console.log(`  - ${timeLogs.length} time logs`);
  } catch (error) {
    console.error("❌ Error during import:", error);
    process.exit(1);
  }
}

// Run the import
importData()
  .then(() => {
    console.log("\n✨ Import complete! Your Convex database is now populated.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Import failed:", error);
    process.exit(1);
  });
