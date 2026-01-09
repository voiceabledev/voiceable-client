/**
 * Deep comparison utilities for change tracking
 */

/**
 * Normalizes data for comparison by handling edge cases
 */
export function normalizeForComparison<T>(data: T): T {
  if (data === null || data === undefined) {
    return data as T;
  }

  if (Array.isArray(data)) {
    // For arrays, normalize each item but don't filter out empty strings
    // Empty strings in arrays might be meaningful (e.g., empty keyword fields)
    return data.map(item => normalizeForComparison(item)) as T;
  }

  if (typeof data === 'object') {
    const normalized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      // Keep all values, including undefined, for proper comparison
      // Only skip null values that are explicitly null (not undefined)
      if (value !== null || data === null) {
        normalized[key] = normalizeForComparison(value);
      }
    }
    return normalized as T;
  }

  return data;
}

/**
 * Deep equality check for objects and arrays
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  // Handle null/undefined cases
  if (a === null || a === undefined) {
    return b === null || b === undefined;
  }
  if (b === null || b === undefined) {
    return false;
  }

  // Handle primitive types
  if (typeof a !== 'object' || typeof b !== 'object') {
    return a === b;
  }

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    // For arrays, check if each element in a has a matching element in b
    // This handles order-independent comparison for simple arrays
    // For arrays of objects, we compare in order (order matters for scenarios/phases/etc)
    // Check if arrays contain objects
    const aHasObjects = a.length > 0 && typeof a[0] === 'object' && a[0] !== null && !Array.isArray(a[0]);
    const bHasObjects = b.length > 0 && typeof b[0] === 'object' && b[0] !== null && !Array.isArray(b[0]);
    
    if (aHasObjects || bHasObjects) {
      // For arrays of objects, order matters - compare in order
      return a.every((item, index) => deepEqual(item, b[index]));
    } else {
      // For primitive arrays, order-independent comparison
      const sortedA = [...a].sort();
      const sortedB = [...b].sort();
      return sortedA.every((item, index) => deepEqual(item, sortedB[index]));
    }
  }

  // If one is array and other is not
  if (Array.isArray(a) !== Array.isArray(b)) {
    return false;
  }

  // Handle objects
  const keysA = Object.keys(a).sort();
  const keysB = Object.keys(b).sort();

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (!keysB.includes(key)) {
      return false;
    }
    if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {
      return false;
    }
  }

  return true;
}

/**
 * Compares two values after normalization
 */
export function compareValues<T>(a: T, b: T): boolean {
  const normalizedA = normalizeForComparison(a);
  const normalizedB = normalizeForComparison(b);
  return deepEqual(normalizedA, normalizedB);
}
