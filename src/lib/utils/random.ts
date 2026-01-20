/**
 * Generate a simple random ID
 */
export function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Generate a random hex color
 */
export function randomColor(): string {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, '0')}`;
}
