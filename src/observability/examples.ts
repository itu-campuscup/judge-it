/**
 * Example: Logging System Usage
 *
 * This file demonstrates how to use the centralized logging system
 * with endpoint-level logging and error propagation.
 */

import {
  createLogger,
  Result,
  ok,
  err,
  AppError,
  isErr,
} from "@/observability";
import { User } from "@supabase/supabase-js";

// ============================================================================
// EXAMPLE 1: Basic Endpoint with Logging
// ============================================================================

export function useBasicEndpoint(user: User | null) {
  // Create logger at endpoint level
  const logger = createLogger("useBasicEndpoint", user);

  const performOperation = async () => {
    // Log start of operation
    logger.info("operation_start", {
      timestamp: Date.now(),
    });

    try {
      // ... do some work ...
      const result = { data: "success" };

      // Log successful completion
      logger.info("operation_complete", {
        dataSize: result.data.length,
      });

      return result;
    } catch (error) {
      // Log error
      logger.error(
        "operation_failed",
        error instanceof Error ? error : new Error(String(error)),
        {
          attemptNumber: 1,
        }
      );
      throw error;
    }
  };

  return { performOperation };
}

// ============================================================================
// EXAMPLE 2: Error Propagation with Result Type
// ============================================================================

// Child function: Returns Result instead of throwing
async function fetchUserData(
  userId: string
): Promise<Result<{ name: string }, Error>> {
  try {
    // Simulate API call
    if (!userId) {
      return err(
        new AppError("User ID is required", "VALIDATION_ERROR", {
          field: "userId",
        })
      );
    }

    // Simulate successful fetch
    const data = { name: "John Doe" };
    return ok(data);
  } catch (error) {
    return err(error instanceof Error ? error : new Error("Unknown error"));
  }
}

// Parent endpoint: Logs the result
export function useUserEndpoint(user: User | null) {
  const logger = createLogger("useUserEndpoint", user);

  const loadUser = async (userId: string) => {
    const result = await fetchUserData(userId);

    // Log at endpoint level based on result
    if (isErr(result)) {
      logger.error("load_user", result.error, {
        userId,
        retryable:
          result.error instanceof AppError &&
          result.error.code === "NETWORK_ERROR",
      });
      return null;
    } else {
      logger.info("load_user", {
        userId,
        userName: result.value.name,
      });
      return result.value;
    }
  };

  return { loadUser };
}

// ============================================================================
// EXAMPLE 3: Aggregating Multiple Operations
// ============================================================================

// Child functions return Results
async function fetchPlayers(): Promise<Result<any[], Error>> {
  try {
    // Simulate fetch
    return ok([{ id: 1, name: "Player 1" }]);
  } catch (error) {
    return err(new AppError("Failed to fetch players", "FETCH_ERROR"));
  }
}

async function fetchTeams(): Promise<Result<any[], Error>> {
  try {
    // Simulate fetch
    return ok([{ id: 1, name: "Team 1" }]);
  } catch (error) {
    return err(new AppError("Failed to fetch teams", "FETCH_ERROR"));
  }
}

// Endpoint aggregates and logs once
export function useDataAggregator(user: User | null) {
  const logger = createLogger("useDataAggregator", user);

  const loadAllData = async () => {
    const results = await Promise.allSettled([fetchPlayers(), fetchTeams()]);

    const errors: Error[] = [];
    const successes: string[] = [];

    results.forEach((result, index) => {
      const name = index === 0 ? "players" : "teams";
      if (result.status === "fulfilled" && !result.value.success) {
        errors.push(result.value.error);
      } else if (result.status === "fulfilled") {
        successes.push(name);
      } else {
        errors.push(new Error(`${name} fetch rejected`));
      }
    });

    // Single log with all information
    if (errors.length > 0) {
      logger.error("load_all_data", errors[0], {
        failedSources: errors.map((e) => (e as AppError).code || "UNKNOWN"),
        successfulSources: successes,
        totalErrors: errors.length,
      });
    } else {
      logger.info("load_all_data", {
        sources: successes,
        totalRecords: results.length,
      });
    }
  };

  return { loadAllData };
}

// ============================================================================
// EXAMPLE 4: Real-time Updates with Logging
// ============================================================================

export function useRealtimeEndpoint(user: User | null) {
  const logger = createLogger("useRealtimeEndpoint", user);

  const handleRealtimeEvent = async (event: string, payload: any) => {
    // Fetch updated data
    const result = await fetchUserData(payload.userId);

    if (isErr(result)) {
      // Log error with event context
      logger.error("realtime_update", result.error, {
        event,
        payloadId: payload.id,
        userId: payload.userId,
      });
    } else {
      // Log success at debug level (less verbose for frequent events)
      logger.debug("realtime_update", {
        event,
        payloadId: payload.id,
        dataUpdated: true,
      });
    }
  };

  const subscribe = () => {
    logger.info("realtime_subscribe", {
      channel: "user-updates",
    });

    // Set up subscription...
  };

  const cleanup = () => {
    logger.info("cleanup", {
      message: "Realtime subscription cleaned up",
    });
  };

  return { handleRealtimeEvent, subscribe, cleanup };
}

// ============================================================================
// EXAMPLE LOG OUTPUTS
// ============================================================================

/*
SUCCESSFUL OPERATION:
{
  "timestamp": "2026-01-05T12:34:56.789Z",
  "level": "info",
  "endpoint": "useBasicEndpoint",
  "operation": "operation_complete",
  "duration": 145,
  "user": {
    "id": "user-123",
    "email": "user@example.com"
  },
  "data": {
    "dataSize": 7
  }
}

ERROR WITH CONTEXT:
{
  "timestamp": "2026-01-05T12:34:56.789Z",
  "level": "error",
  "endpoint": "useUserEndpoint",
  "operation": "load_user",
  "duration": 234,
  "user": {
    "id": "user-123",
    "email": "user@example.com"
  },
  "error": {
    "message": "User ID is required",
    "code": "VALIDATION_ERROR",
    "context": {
      "field": "userId"
    },
    "stack": "Error: User ID is required\n  at ..."
  },
  "data": {
    "userId": "",
    "retryable": false
  }
}

AGGREGATED OPERATION:
{
  "timestamp": "2026-01-05T12:34:56.789Z",
  "level": "info",
  "endpoint": "useDataAggregator",
  "operation": "load_all_data",
  "duration": 456,
  "user": {
    "id": "user-123",
    "email": "user@example.com"
  },
  "data": {
    "sources": ["players", "teams"],
    "totalRecords": 2
  }
}

DEBUG LOG (REALTIME):
{
  "timestamp": "2026-01-05T12:34:56.789Z",
  "level": "debug",
  "endpoint": "useRealtimeEndpoint",
  "operation": "realtime_update",
  "duration": 23,
  "user": {
    "id": "user-123",
    "email": "user@example.com"
  },
  "data": {
    "event": "USER_UPDATED",
    "payloadId": "payload-456",
    "dataUpdated": true
  }
}
*/
