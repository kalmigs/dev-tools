/**
 * Safely parse JSON, returns validity and parsed result
 */
export function tryParseJson(text: string): { valid: boolean; parsed: unknown } {
  try {
    return { valid: true, parsed: JSON.parse(text) };
  } catch {
    return { valid: false, parsed: null };
  }
}

/**
 * Recursively sort object keys alphabetically
 */
export function sortObjectKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  if (obj !== null && typeof obj === 'object') {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
      sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return obj;
}

/**
 * Recursively sort arrays within an object for consistent comparison
 */
export function sortArraysInObject(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    const sorted = obj.map(sortArraysInObject);
    return sorted.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  }
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = sortArraysInObject(value);
    }
    return result;
  }
  return obj;
}

/**
 * Remove null values from objects recursively
 */
export function stripNulls(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(stripNulls).filter(v => v !== null);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj).reduce(
      (acc, [key, value]) => {
        if (value !== null) {
          acc[key] = stripNulls(value);
        }
        return acc;
      },
      {} as Record<string, unknown>,
    );
  }
  return obj;
}

/**
 * Escape special characters in strings within objects
 */
export function escapeStrings(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return obj
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }
  if (Array.isArray(obj)) return obj.map(escapeStrings);
  if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj).reduce(
      (acc, [key, value]) => {
        acc[key] = escapeStrings(value);
        return acc;
      },
      {} as Record<string, unknown>,
    );
  }
  return obj;
}
