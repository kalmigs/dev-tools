import { diffChars, diffWords, diffWordsWithSpace, type Change } from 'diff';

export interface DiffStringsOptions {
  ignoreCase: boolean;
  ignoreWhitespace: boolean;
}

/** Below this length a character diff reads better than a word diff */
const SHORT_STRING_LENGTH = 50;

/**
 * Diff two strings for highlighting, keeping the result consistent with a strict
 * equality check of the same inputs.
 *
 * As of jsdiff 9, `diffWords` no longer treats whitespace runs as tokens, so it
 * reports no change for strings that differ only in spacing. That is the desired
 * behaviour when whitespace is being ignored, and wrong when it is not, so the
 * whitespace-sensitive variant is used otherwise.
 */
export function diffStrings(a: string, b: string, options: DiffStringsOptions): Change[] {
  const isShort = a.length < SHORT_STRING_LENGTH && b.length < SHORT_STRING_LENGTH;

  let diffFn = diffWordsWithSpace;
  if (options.ignoreWhitespace) {
    diffFn = diffWords;
  } else if (isShort) {
    diffFn = diffChars;
  }

  return diffFn(a, b, { ignoreCase: options.ignoreCase });
}

/** True when the diff contains at least one added or removed segment */
export function hasVisibleChanges(changes: Change[]): boolean {
  return changes.some(change => change.added || change.removed);
}
