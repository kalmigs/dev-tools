/**
 * Count the number of words in a string
 */
export function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Normalize whitespace by removing all whitespace characters
 */
export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, '');
}

/**
 * Simple string hash function
 */
export function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
