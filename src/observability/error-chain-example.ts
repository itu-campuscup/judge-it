/**
 * Example: Error Chain Propagation
 *
 * This demonstrates how errors propagate through the call stack
 * with full context preserved at each level.
 */

import {
  createLogger,
  Result,
  ok,
  err,
  AppError,
  wrapError,
  isErr,
} from "@/observability";
import { supabase } from "@/SupabaseClient";
import { User } from "@supabase/supabase-js";

// ============================================================================
// LEVEL 3: Database Layer (deepest)
// ============================================================================

async function queryDatabase(table: string): Promise<Result<any[], Error>> {
  try {
    const { data, error } = await supabase.from(table).select("*");

    if (error) {
      // Create error with location for tracking
      return err(
        new AppError(
          `Database query failed: ${error.message}`,
          "DB_QUERY_ERROR",
          {
            table,
            errorCode: error.code,
            errorDetails: error.details,
          },
          undefined, // No cause yet (this is the origin)
          `queryDatabase(${table})` // Location identifier
        )
      );
    }

    return ok(data || []);
  } catch (error) {
    return err(
      wrapError(
        error instanceof Error ? error : new Error(String(error)),
        "Exception in database query",
        "DB_EXCEPTION",
        `queryDatabase(${table})`,
        { table }
      )
    );
  }
}

// ============================================================================
// LEVEL 2: Data Access Layer
// ============================================================================

async function fetchPlayers(): Promise<Result<any[], Error>> {
  const result = await queryDatabase("players");

  if (isErr(result)) {
    // Wrap the error from lower level, preserving the chain
    return err(
      wrapError(
        result.error,
        "Failed to fetch players",
        "FETCH_PLAYERS_ERROR",
        "fetchPlayers()",
        {
          operation: "fetch",
          resource: "players",
        }
      )
    );
  }

  return result;
}

async function fetchTeams(): Promise<Result<any[], Error>> {
  const result = await queryDatabase("teams");

  if (isErr(result)) {
    return err(
      wrapError(
        result.error,
        "Failed to fetch teams",
        "FETCH_TEAMS_ERROR",
        "fetchTeams()",
        { operation: "fetch", resource: "teams" }
      )
    );
  }

  return result;
}

// ============================================================================
// LEVEL 1: Business Logic Layer
// ============================================================================

async function loadGameData(): Promise<
  Result<{ players: any[]; teams: any[] }, Error>
> {
  const playersResult = await fetchPlayers();
  const teamsResult = await fetchTeams();

  // Check for errors
  if (isErr(playersResult)) {
    return err(
      wrapError(
        playersResult.error,
        "Failed to load game data: players unavailable",
        "LOAD_GAME_DATA_ERROR",
        "loadGameData()",
        {
          stage: "players_fetch",
          teamsLoaded: isErr(teamsResult) ? "no" : "yes",
        }
      )
    );
  }

  if (isErr(teamsResult)) {
    return err(
      wrapError(
        teamsResult.error,
        "Failed to load game data: teams unavailable",
        "LOAD_GAME_DATA_ERROR",
        "loadGameData()",
        {
          stage: "teams_fetch",
          playersLoaded: "yes",
        }
      )
    );
  }

  return ok({
    players: playersResult.value,
    teams: teamsResult.value,
  });
}

// ============================================================================
// LEVEL 0: Endpoint (ROOT - ONLY LEVEL THAT LOGS)
// ============================================================================

export function useGameDataEndpoint(user: User | null) {
  const logger = createLogger("useGameDataEndpoint", user);

  const loadData = async () => {
    const result = await loadGameData();

    if (isErr(result)) {
      // Log the error with FULL chain preserved
      logger.error("load_game_data", result.error, {
        attemptNumber: 1,
        timestamp: Date.now(),
      });

      return null;
    } else {
      logger.info("load_game_data", {
        playerCount: result.value.players.length,
        teamCount: result.value.teams.length,
      });

      return result.value;
    }
  };

  return { loadData };
}

// ============================================================================
// EXAMPLE LOG OUTPUT WITH ERROR CHAIN
// ============================================================================

/*
When a database error occurs at queryDatabase, it propagates through all layers
and the final log at the endpoint includes the COMPLETE CHAIN:

{
  "timestamp": "2026-01-05T12:34:56.789Z",
  "level": "error",
  "endpoint": "useGameDataEndpoint",
  "operation": "load_game_data",
  "duration": 234,
  "user": {
    "id": "user-123",
    "email": "user@example.com"
  },
  "error": {
    "name": "AppError",
    "message": "Failed to load game data: players unavailable",
    "code": "LOAD_GAME_DATA_ERROR",
    "location": "loadGameData()",
    "context": {
      "stage": "players_fetch",
      "teamsLoaded": "yes"
    },
    "stack": "Error: Failed to load game data...",
    "errorChain": [
      {
        "message": "Failed to load game data: players unavailable",
        "code": "LOAD_GAME_DATA_ERROR",
        "location": "loadGameData()",
        "context": {
          "stage": "players_fetch",
          "teamsLoaded": "yes"
        }
      },
      {
        "message": "Failed to fetch players",
        "code": "FETCH_PLAYERS_ERROR",
        "location": "fetchPlayers()",
        "context": {
          "operation": "fetch",
          "resource": "players"
        }
      },
      {
        "message": "Database query failed: relation does not exist",
        "code": "DB_QUERY_ERROR",
        "location": "queryDatabase(players)",
        "context": {
          "table": "players",
          "errorCode": "42P01",
          "errorDetails": "..."
        }
      }
    ]
  },
  "errorChainSummary": "loadGameData(): Failed to load game data: players unavailable → fetchPlayers(): Failed to fetch players → queryDatabase(players): Database query failed: relation does not exist",
  "data": {
    "attemptNumber": 1,
    "timestamp": 1704459296789
  }
}

Notice how you can now see EXACTLY where the error originated (queryDatabase),
and how it propagated through each layer (fetchPlayers → loadGameData → endpoint).

The errorChainSummary provides a quick one-line view:
"loadGameData() → fetchPlayers() → queryDatabase(players): relation does not exist"

This makes debugging significantly easier because you know:
1. The root cause (database table doesn't exist)
2. Which specific call failed (queryDatabase for "players" table)
3. How the error bubbled up through the call stack
4. The context at each level (what each function was trying to do)
*/
