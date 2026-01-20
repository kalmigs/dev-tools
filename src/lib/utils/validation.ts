/**
 * Check if a string is a valid CUID (v1)
 */
export function isCuid(id: string): boolean {
  return /^c[a-z0-9]{24}$/.test(id);
}
