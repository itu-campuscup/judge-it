/**
 * AlertComponent Logging Example
 *
 * This demonstrates how the judge-it components use AlertComponent
 * for centralized logging. AlertComponent automatically logs all
 * errors and warnings that are shown to users.
 */

import { supabase } from "@/SupabaseClient";

// ============================================================================
// PATTERN: Logging via AlertComponent
// ============================================================================

// Before (no context):
// ----------------------
const handleOldWay = async (alert: any) => {
  alert.setOpen(true);
  alert.setSeverity("error");
  alert.setText("Failed to save data");
  // ❌ No logging, no context, hard to debug
};

// After (with context):
// ---------------------
const handleNewWay = async (alert: any, userId: string, teamId: number) => {
  alert.setOpen(true);
  alert.setSeverity("error");
  alert.setText("Failed to save data");
  alert.setContext({
    operation: "save_data",
    location: "MyComponent.handleNewWay",
    metadata: {
      userId,
      teamId,
      timestamp: new Date().toISOString(),
    },
  });
  // ✅ Automatically logged by AlertComponent with full context
};

// ============================================================================
// EXAMPLE 1: Database Error with Context
// ============================================================================

const handleDatabaseInsert = async (
  alert: any,
  data: { team_id: number; player_id: number }
) => {
  const { error } = await supabase.from("time_logs").insert([data]);

  if (error) {
    alert.setOpen(true);
    alert.setSeverity("error");
    alert.setText(`Database error: ${error.message}`);
    alert.setContext({
      operation: "insert_time_log",
      location: "TimeLogger.handleDatabaseInsert",
      metadata: {
        step: "database_insert",
        teamId: data.team_id,
        playerId: data.player_id,
        errorCode: error.code,
        errorDetails: error.details,
      },
    });
    return;
  }

  // Success
  alert.setOpen(true);
  alert.setSeverity("success");
  alert.setText("Time log saved successfully");
  alert.setContext({
    operation: "insert_time_log",
    location: "TimeLogger.handleDatabaseInsert",
    metadata: {
      teamId: data.team_id,
      playerId: data.player_id,
    },
  });
};

// Resulting log (shown in console):
// {
//   "timestamp": "2024-01-10T12:34:56.789Z",
//   "level": "error",
//   "component": "AlertComponent",
//   "user": { "id": "user-123", "email": "judge@example.com" },
//   "operation": "insert_time_log",
//   "message": "Database error: duplicate key violation",
//   "userVisible": true,
//   "alertText": "Database error: duplicate key violation",
//   "step": "database_insert",
//   "teamId": 5,
//   "playerId": 42,
//   "errorCode": "23505",
//   "errorDetails": "Key (player_id, heat_id)=(42, 10) already exists."
// }

// ============================================================================
// EXAMPLE 2: Validation Error
// ============================================================================

const validateInputs = (
  alert: any,
  selectedTeam: number | null,
  selectedPlayer: number | null
): boolean => {
  if (!selectedTeam) {
    alert.setOpen(true);
    alert.setSeverity("error");
    alert.setText("Please select a team");
    alert.setContext({
      operation: "validate_inputs",
      location: "FormComponent.validateInputs",
      metadata: {
        missingField: "selectedTeam",
        selectedPlayer,
      },
    });
    return false;
  }

  if (!selectedPlayer) {
    alert.setOpen(true);
    alert.setSeverity("error");
    alert.setText("Please select a player");
    alert.setContext({
      operation: "validate_inputs",
      location: "FormComponent.validateInputs",
      metadata: {
        missingField: "selectedPlayer",
        selectedTeam,
      },
    });
    return false;
  }

  return true;
};

// ============================================================================
// EXAMPLE 3: Multi-step Operation with Context Tracking
// ============================================================================

const handleComplexOperation = async (
  alert: any,
  heatNumber: number,
  teamId: number
) => {
  // Step 1: Deactivate current heat
  const { error: updateError } = await supabase
    .from("heats")
    .update({ is_current: false })
    .eq("is_current", true);

  if (updateError) {
    alert.setOpen(true);
    alert.setSeverity("error");
    alert.setText("Failed to update current heat");
    alert.setContext({
      operation: "create_heat",
      location: "HeatManager.handleComplexOperation",
      metadata: {
        step: "deactivate_current_heat",
        targetHeatNumber: heatNumber,
        errorCode: updateError.code,
      },
    });
    return;
  }

  // Step 2: Create new heat
  const { error: createError } = await supabase
    .from("heats")
    .insert([{ heat: heatNumber, is_current: true }]);

  if (createError) {
    alert.setOpen(true);
    alert.setSeverity("error");
    alert.setText("Failed to create new heat");
    alert.setContext({
      operation: "create_heat",
      location: "HeatManager.handleComplexOperation",
      metadata: {
        step: "insert_new_heat",
        heatNumber,
        errorCode: createError.code,
        previousStepsCompleted: ["deactivate_current_heat"],
      },
    });
    return;
  }

  // Success
  alert.setOpen(true);
  alert.setSeverity("success");
  alert.setText(`Heat ${heatNumber} is now active`);
  alert.setContext({
    operation: "create_heat",
    location: "HeatManager.handleComplexOperation",
    metadata: {
      heatNumber,
      teamId,
      stepsCompleted: ["deactivate_current_heat", "insert_new_heat"],
    },
  });
};

// ============================================================================
// EXAMPLE 4: Warning (not error)
// ============================================================================

const handleWarning = (alert: any, availableTeams: number) => {
  if (availableTeams === 0) {
    alert.setOpen(true);
    alert.setSeverity("warning");
    alert.setText("No teams available. Please create a team first.");
    alert.setContext({
      operation: "load_teams",
      location: "TeamSelector.handleWarning",
      metadata: {
        availableTeams: 0,
        suggestion: "Create a team in the admin panel",
      },
    });
  }
};

// ============================================================================
// KEY BENEFITS
// ============================================================================

/**
 * 1. ZERO BOILERPLATE
 *    - No need to import or create loggers in each component
 *    - AlertComponent handles all logging automatically
 *
 * 2. USER-CENTRIC LOGGING
 *    - Every log entry corresponds to what the user saw
 *    - Easy to correlate user reports with logs
 *
 * 3. RICH CONTEXT
 *    - operation: What was being attempted
 *    - location: Where in the code it happened
 *    - metadata: Relevant IDs, steps, error codes
 *
 * 4. CONSISTENT FORMAT
 *    - All judge-it errors follow the same pattern
 *    - Easy to parse and query logs
 *
 * 5. PRODUCTION READY
 *    - JSON format works with log aggregation tools
 *    - OpenTelemetry compatible
 *    - Can be sent to external services
 */

// ============================================================================
// USAGE IN COMPONENTS
// ============================================================================

/**
 * In your component:
 *
 * 1. Get the alert object from useFetchData
 *    const { alert } = useFetchData();
 *
 * 2. Use alert.setOpen, alert.setSeverity, alert.setText as before
 *
 * 3. Add alert.setContext with operation, location, and metadata
 *
 * 4. AlertComponent will automatically log errors and warnings
 */

export {};
