/**
 * Centralized Logging Utility
 *
 * OpenTelemetry-based logging with:
 * - JSON-formatted output
 * - User context injection
 * - Endpoint-level logging (only roots log)
 * - Error propagation pattern
 * - Structured data
 */

import type { User } from "@/types";
import { Result, isErr, AppError } from "./result";

export interface LogContext {
  userId?: string;
  userEmail?: string;
  sessionId?: string;
  endpoint: string;
  operation: string;
  [key: string]: string | number | boolean | undefined;
}

export interface LogData {
  timestamp: string;
  level: "info" | "error" | "warn" | "debug";
  endpoint: string;
  operation: string;
  user?: {
    id: string;
    email?: string;
  };
  duration?: number;
  data?: Record<string, string | number | boolean | object | null | undefined>;
  error?: {
    message: string;
    code?: string;
    stack?: string;
    context?: Record<
      string,
      string | number | boolean | object | null | undefined
    >;
  };
}

/**
 * Logger class for endpoint-level logging
 */
export class Logger {
  private endpoint: string;
  private user: User | null;
  private startTime: number;

  constructor(endpoint: string, user: User | null = null) {
    this.endpoint = endpoint;
    this.user = user;
    this.startTime = Date.now();
  }

  /**
   * Set user context for this logger
   */
  setUser(user: User | null): void {
    this.user = user;
  }

  /**
   * Log operation success
   */
  info(
    operation: string,
    data?: Record<
      string,
      string | number | boolean | object | null | undefined
    >,
  ): void {
    this.log("info", operation, data);
  }

  /**
   * Log operation error
   */
  error(
    operation: string,
    error: Error | AppError,
    data?: Record<
      string,
      string | number | boolean | object | null | undefined
    >,
  ): void {
    const errorData =
      error instanceof AppError
        ? error.toJSON()
        : {
            message: error.message,
            stack: error.stack,
          };

    // Include error chain if available for full propagation context
    const logData: Record<
      string,
      string | number | boolean | object | null | undefined
    > = {
      ...data,
      error: errorData,
    };

    // If error has a chain, add summary for quick scanning
    if (error instanceof AppError) {
      const jsonError = error.toJSON();
      if (jsonError.errorChain) {
        logData.errorChainSummary = jsonError.errorChain
          .map(
            (e: { location?: string; message: string }) =>
              `${e.location || "unknown"}: ${e.message}`,
          )
          .join(" → ");
      }
    }

    this.log("error", operation, logData);
  }

  /**
   * Log operation warning
   */
  warn(
    operation: string,
    data?: Record<
      string,
      string | number | boolean | object | null | undefined
    >,
  ): void {
    this.log("warn", operation, data);
  }

  /**
   * Log operation debug info
   */
  debug(
    operation: string,
    data?: Record<
      string,
      string | number | boolean | object | null | undefined
    >,
  ): void {
    this.log("debug", operation, data);
  }

  /**
   * Core logging method - outputs JSON to console and API endpoint
   */
  private log(
    level: LogData["level"],
    operation: string,
    data?: Record<
      string,
      string | number | boolean | object | null | undefined
    >,
  ): void {
    const logData: LogData = {
      timestamp: new Date().toISOString(),
      level,
      endpoint: this.endpoint,
      operation,
      duration: Date.now() - this.startTime,
    };

    // Add user context if available
    if (this.user) {
      logData.user = {
        id: this.user.id,
        email: this.user.email,
      };
    }

    // Add additional data
    if (data) {
      if (data.error && typeof data.error === "object") {
        logData.error = data.error as LogData["error"];
        delete data.error;
      }
      if (Object.keys(data).length > 0) {
        logData.data = data;
      }
    }

    // Output formatted JSON for better readability in Vercel logs
    console.log(JSON.stringify(logData, null, 2));

    // Send to server-side logging endpoint so it appears in Vercel logs
    if (typeof window !== "undefined") {
      // Client-side: send to centralized API endpoint
      fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logData),
      }).catch(() => {
        // Silently fail - don't break the app if logging fails
      });
    }
  }
}

/**
 * Create a traced operation with automatic logging
 * This should be used at the endpoint level
 */
export async function traceEndpoint<T>(
  endpoint: string,
  operation: string,
  user: User | null,
  fn: (logger: Logger) => Promise<Result<T, Error>>,
): Promise<Result<T, Error>> {
  const logger = new Logger(endpoint, user);
  const startTime = Date.now();

  try {
    // Execute operation
    const result = await fn(logger);

    // Log based on result
    if (isErr(result)) {
      logger.error(operation, result.error, {
        duration: Date.now() - startTime,
      });
    } else {
      logger.info(operation, {
        success: true,
        duration: Date.now() - startTime,
      });
    }

    return result;
  } catch (error) {
    const appError = error instanceof Error ? error : new Error(String(error));

    logger.error(operation, appError, {
      duration: Date.now() - startTime,
    });

    throw error;
  }
}

/**
 * Create a simple logger for a specific endpoint
 *
 * @param endpoint - Name of the component/hook (e.g., "BeerChugger", "BeerJudge")
 * @param user - Authenticated user context
 */
export function createLogger(
  endpoint: string,
  user: User | null = null,
): Logger {
  return new Logger(endpoint, user);
}

/**
 * Helper to log Result at endpoint level
 */
export function logResult<T>(
  logger: Logger,
  operation: string,
  result: Result<T, Error>,
  additionalData?: Record<
    string,
    string | number | boolean | object | null | undefined
  >,
): void {
  if (isErr(result)) {
    logger.error(operation, result.error, additionalData);
  } else {
    logger.info(operation, {
      ...additionalData,
      success: true,
    });
  }
}
