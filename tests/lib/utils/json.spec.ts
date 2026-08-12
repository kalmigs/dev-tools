import { describe, expect, it } from 'vitest';
import {
  escapeStrings,
  sortArraysInObject,
  sortObjectKeys,
  stripNulls,
  tryParseJson,
} from '@/lib/utils/json';

describe('tryParseJson', () => {
  it('parses valid JSON', () => {
    expect(tryParseJson('{"a":1}')).toEqual({ valid: true, parsed: { a: 1 } });
  });

  it('parses non-object JSON values', () => {
    expect(tryParseJson('42')).toEqual({ valid: true, parsed: 42 });
    expect(tryParseJson('null')).toEqual({ valid: true, parsed: null });
  });

  it('reports invalid JSON without throwing', () => {
    expect(tryParseJson('{a:1}')).toEqual({ valid: false, parsed: null });
    expect(tryParseJson('')).toEqual({ valid: false, parsed: null });
  });
});

describe('sortObjectKeys', () => {
  it('sorts keys alphabetically', () => {
    const sorted = sortObjectKeys({ b: 1, a: 2, c: 3 });

    expect(Object.keys(sorted as object)).toEqual(['a', 'b', 'c']);
  });

  it('sorts nested objects, including those inside arrays', () => {
    const sorted = sortObjectKeys({ z: { d: 1, c: 2 }, list: [{ y: 1, x: 2 }] });

    expect(Object.keys(sorted as object)).toEqual(['list', 'z']);
    expect(Object.keys((sorted as { z: object }).z)).toEqual(['c', 'd']);
    expect(Object.keys((sorted as { list: object[] }).list[0])).toEqual(['x', 'y']);
  });

  it('preserves array order', () => {
    expect(sortObjectKeys({ list: [3, 1, 2] })).toEqual({ list: [3, 1, 2] });
  });

  it('returns primitives and null unchanged', () => {
    expect(sortObjectKeys('text')).toBe('text');
    expect(sortObjectKeys(null)).toBeNull();
  });
});

describe('sortArraysInObject', () => {
  it('sorts array members by their serialized form', () => {
    expect(sortArraysInObject([3, 1, 2])).toEqual([1, 2, 3]);
    expect(sortArraysInObject(['b', 'a'])).toEqual(['a', 'b']);
  });

  it('sorts arrays nested inside objects', () => {
    expect(sortArraysInObject({ tags: ['z', 'a'], nested: { list: [2, 1] } })).toEqual({
      tags: ['a', 'z'],
      nested: { list: [1, 2] },
    });
  });

  it('gives two orderings of the same array the same result', () => {
    const a = sortArraysInObject({ list: [{ id: 2 }, { id: 1 }] });
    const b = sortArraysInObject({ list: [{ id: 1 }, { id: 2 }] });

    expect(a).toEqual(b);
  });

  it('leaves object key order untouched', () => {
    const result = sortArraysInObject({ b: 1, a: 2 });

    expect(Object.keys(result as object)).toEqual(['b', 'a']);
  });
});

describe('stripNulls', () => {
  it('removes null-valued keys', () => {
    expect(stripNulls({ a: 1, b: null })).toEqual({ a: 1 });
  });

  it('removes nulls nested in objects and arrays', () => {
    expect(stripNulls({ a: { b: null, c: 1 }, list: [1, null, 2] })).toEqual({
      a: { c: 1 },
      list: [1, 2],
    });
  });

  it('keeps falsy values that are not null', () => {
    expect(stripNulls({ zero: 0, empty: '', no: false })).toEqual({
      zero: 0,
      empty: '',
      no: false,
    });
  });

  it('returns a bare null unchanged', () => {
    expect(stripNulls(null)).toBeNull();
  });
});

describe('escapeStrings', () => {
  it('escapes backslashes and control characters in string values', () => {
    expect(escapeStrings('a\\b\nc\rd\te')).toBe('a\\\\b\\nc\\rd\\te');
  });

  it('escapes the backslash before the control characters it introduces', () => {
    expect(escapeStrings('\\n')).toBe('\\\\n');
  });

  it('walks objects and arrays', () => {
    expect(escapeStrings({ a: 'x\ny', list: ['p\tq'] })).toEqual({
      a: 'x\\ny',
      list: ['p\\tq'],
    });
  });

  it('leaves non-string values and object keys alone', () => {
    expect(escapeStrings({ 'key\nwith\nnewlines': 1 })).toEqual({ 'key\nwith\nnewlines': 1 });
    expect(escapeStrings(null)).toBeNull();
  });
});
