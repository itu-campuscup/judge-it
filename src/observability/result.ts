/**
 * Result Type for Error Propagation
 *
 * Type-safe Result pattern for functions that can fail.
 * Instead of throwing errors, functions return Result<T, E>
 * which can be either Ok(value) or Err(error).
 *
 * This allows errors to propagate up to the endpoint level
 * where they are logged centrally.
 */

export type Result<T, E = Error> = Ok<T> | Err<E>;

export interface Ok<T> {
  success: true;
  value: T;
  error?: never;
}

export interface Err<E> {
  success: false;
  value?: never;
  error: E;
}

/**
 * Create a successful result
 */
export function ok<T>(value: T): Ok<T> {
  return {
    success: true,
    value,
  };
}

/**
 * Create an error result
 */
export function err<E>(error: E): Err<E> {
  return {
    success: false,
    error,
  };
}

/**
 * Check if result is Ok
 */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.success === true;
}

/**
 * Check if result is Err
 */
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return result.success === false;
}

/**
 * Extract value from Ok or throw
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (isOk(result)) {
    return result.value;
  }
  throw result.error;
}

/**
 * Extract value from Ok or return default
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  if (isOk(result)) {
    return result.value;
  }
  return defaultValue;
}

/**
 * Map Ok value to another type
 */
export function map<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U,
): Result<U, E> {
  if (isOk(result)) {
    return ok(fn(result.value));
  }
  return result;
}

/**
 * Map Err value to another type
 */
export function mapErr<T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F,
): Result<T, F> {
  if (isErr(result)) {
    return err(fn(result.error));
  }
  return result;
}

/**
 * Convert Promise to Result
 */
export async function fromPromise<T>(
  promise: Promise<T>,
): Promise<Result<T, Error>> {
  try {
    const value = await promise;
    return ok(value);
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Wrap an error from a lower-level operation
 * This preserves the error chain for debugging
 */
export function wrapError(
  error: Error,
  message: string,
  code: string,
  location: string,
  context?: Record<
    string,
    string | number | boolean | object | null | undefined
  >,
): AppError {
  return new AppError(message, code, context, error, location);
}

/**
 * Convert Result error to AppError with location context
 */
export function propagateError<E extends Error>(
  result: Err<E>,
  message: string,
  code: string,
  location: string,
  additionalContext?: Record<
    string,
    string | number | boolean | object | null | undefined
  >,
): AppError {
  return wrapError(result.error, message, code, location, additionalContext);
}

/**
 * Application Error with context and error chaining
 */
export class AppError extends Error {
  public readonly causedBy?: Error;
  public readonly location?: string;

  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<
      string,
      string | number | boolean | object | null | undefined
    >,
    causedBy?: Error,
    location?: string,
  ) {
    super(message);
    this.name = "AppError";
    this.causedBy = causedBy;
    this.location = location;
  }

  /**
   * Get full error chain as array
   */
  getErrorChain(): Array<{
    message: string;
    code?: string;
    location?: string;
    context?: Record<
      string,
      string | number | boolean | object | null | undefined
    >;
  }> {
    const chain: Array<{
      message: string;
      code?: string;
      location?: string;
      context?: Record<
        string,
        string | number | boolean | object | null | undefined
      >;
    }> = [];

    chain.push({
      message: this.message,
      code: this.code,
      location: this.location,
      context: this.context,
    });

    let current = this.causedBy;
    while (current) {
      if (current instanceof AppError) {
        chain.push({
          message: current.message,
          code: current.code,
          location: current.location,
          context: current.context,
        });
        current = current.causedBy;
      } else {
        chain.push({
          message: current.message,
        });
        break;
      }
    }

    return chain;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      location: this.location,
      context: this.context,
      stack: this.stack,
      errorChain: this.causedBy ? this.getErrorChain() : undefined,
    };
  }
}
