import { Id, TableNames } from "../../convex/_generated/dataModel";

/**
 * Convex Helper Utilities
 *
 * Helper functions for working with Convex IDs and maintaining
 * backwards compatibility with the existing number-based ID system.
 */

// Map to store Convex ID <-> Number ID mappings
const idMap = new Map<string, number>();
const reverseIdMap = new Map<number, string>();

/**
 * Convert Convex ID to a stable number ID
 * This maintains a consistent mapping for each Convex ID
 */
export function convexIdToNumber(convexId: Id<TableNames>): number {
  const existing = idMap.get(convexId);
  if (existing !== undefined) {
    return existing;
  }

  // Generate a stable hash-based number from the Convex ID
  let hash = 0;
  for (let i = 0; i < convexId.length; i++) {
    const char = convexId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const numberId = Math.abs(hash);

  // Store the mapping
  idMap.set(convexId, numberId);
  reverseIdMap.set(numberId, convexId);

  return numberId;
}

/**
 * Convert number ID back to Convex ID
 * Only works for IDs that have been previously converted
 */
export function numberToConvexId<T extends TableNames>(
  numberId: number,
): Id<T> | undefined {
  const convexId = reverseIdMap.get(numberId);
  return convexId as Id<T> | undefined;
}

/**
 * Get or create a Convex ID for a given number
 * This is useful when you have a number ID but need a Convex ID
 */
export function getConvexId<T extends TableNames>(
  numberId: number,
): Id<T> | undefined {
  return numberToConvexId(numberId);
}

/**
 * Convert Convex document with _id to legacy format with numeric id
 */
export function convertDocument<
  T extends { _id: Id<TableNames>; _creationTime: number },
>(
  doc: T,
): Omit<T, "_id" | "_creationTime"> & { id: number; created_at?: string } {
  const { _id, _creationTime, ...rest } = doc;
  return {
    ...rest,
    id: convexIdToNumber(_id),
    created_at: new Date(_creationTime).toISOString(),
  };
}

/**
 * Helper to get Convex ID from various input types
 */
export function ensureConvexId<T extends TableNames>(
  id: number | string | Id<T>,
): Id<T> | undefined {
  if (typeof id === "string" && id.startsWith("j")) {
    // Already a Convex ID
    return id as Id<T>;
  }
  if (typeof id === "number") {
    return numberToConvexId(id);
  }
  return undefined;
}

/**
 * Clear the ID mapping cache (useful for testing)
 */
export function clearIdMappings(): void {
  idMap.clear();
  reverseIdMap.clear();
}
