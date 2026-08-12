import { describe, expect, it } from 'vitest';
import { isCuid } from '@/lib/utils/validation';

const VALID_CUID = 'cjld2cyuq0000t3rmniod1foy';

describe('isCuid', () => {
  it('accepts a well-formed v1 cuid', () => {
    expect(isCuid(VALID_CUID)).toBe(true);
  });

  it('rejects an id that is too short or too long', () => {
    expect(isCuid(VALID_CUID.slice(0, -1))).toBe(false);
    expect(isCuid(`${VALID_CUID}0`)).toBe(false);
  });

  it('rejects an id that does not start with c', () => {
    expect(isCuid(`x${VALID_CUID.slice(1)}`)).toBe(false);
  });

  it('rejects uppercase characters', () => {
    expect(isCuid(VALID_CUID.toUpperCase())).toBe(false);
    expect(isCuid(`c${VALID_CUID.slice(1, -1).toUpperCase()}Y`)).toBe(false);
  });

  it('rejects surrounding whitespace and empty input', () => {
    expect(isCuid(` ${VALID_CUID} `)).toBe(false);
    expect(isCuid('')).toBe(false);
  });

  it('rejects non-alphanumeric characters', () => {
    expect(isCuid(`c${VALID_CUID.slice(1, -1)}-`)).toBe(false);
  });
});
