import { describe, expect, it } from 'vitest';
import { diffStrings, hasVisibleChanges } from '@/lib/utils/diff';

// Long enough to take the word-diff path rather than the char-diff one
const LONG_A = 'the quick brown fox jumps over the lazy dog near the river bank';
const LONG_B = 'the quick brown fox  jumps over the lazy dog near the river bank';

const STRICT = { ignoreCase: false, ignoreWhitespace: false };

describe('diffStrings', () => {
  it('highlights a whitespace-only difference in long strings', () => {
    // Regression: jsdiff 9 dropped whitespace tokens from diffWords, so this
    // reported no changes at all while the strings compared as unequal.
    expect(LONG_A).not.toBe(LONG_B);
    expect(hasVisibleChanges(diffStrings(LONG_A, LONG_B, STRICT))).toBe(true);
  });

  it('ignores a whitespace-only difference when whitespace is ignored', () => {
    const changes = diffStrings(LONG_A, LONG_B, { ...STRICT, ignoreWhitespace: true });

    expect(hasVisibleChanges(changes)).toBe(false);
  });

  it('agrees with a strict equality check on identical strings', () => {
    expect(hasVisibleChanges(diffStrings(LONG_A, LONG_A, STRICT))).toBe(false);
  });

  it('highlights real word changes', () => {
    const changes = diffStrings(LONG_A, LONG_A.replace('brown', 'red'), STRICT);

    expect(hasVisibleChanges(changes)).toBe(true);
    expect(changes.some(c => c.removed && c.value.includes('brown'))).toBe(true);
    expect(changes.some(c => c.added && c.value.includes('red'))).toBe(true);
  });

  it('honours ignoreCase', () => {
    expect(hasVisibleChanges(diffStrings('Hello World', 'hello world', STRICT))).toBe(true);
    expect(
      hasVisibleChanges(diffStrings('Hello World', 'hello world', { ...STRICT, ignoreCase: true })),
    ).toBe(false);
  });

  it('uses a character diff for short strings', () => {
    const changes = diffStrings('cat', 'cut', STRICT);

    // Char-level granularity keeps the shared letters unchanged
    expect(changes.some(c => !c.added && !c.removed && c.value === 'c')).toBe(true);
    expect(hasVisibleChanges(changes)).toBe(true);
  });

  it('detects a short whitespace-only difference', () => {
    expect(hasVisibleChanges(diffStrings('a b', 'a  b', STRICT))).toBe(true);
  });
});

describe('hasVisibleChanges', () => {
  it('is false for an all-unchanged diff', () => {
    expect(hasVisibleChanges(diffStrings('same', 'same', STRICT))).toBe(false);
  });

  it('is false for an empty change list', () => {
    expect(hasVisibleChanges([])).toBe(false);
  });
});
