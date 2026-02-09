import { describe, expect, it } from 'vitest';
import { parseInput } from '@/lib/utils/dateParser';

const INPUT_TZ = 'UTC';

describe('parseInput', () => {
  it('parses month-name format with GMT offset', () => {
    const year = new Date().getFullYear();
    const { date, error } = parseInput('Feb 5, 12:12 AM GMT+8', 'auto', INPUT_TZ);

    expect(error).toBeNull();
    expect(date).not.toBeNull();

    const expected = Date.UTC(year, 1, 4, 16, 12, 0);
    expect(date?.getTime()).toBe(expected);
  });

  it('parses month-name format with numeric offset without minutes', () => {
    const { date, error } = parseInput('Feb 5 2024 12:12 AM +08', 'auto', INPUT_TZ);

    expect(error).toBeNull();
    expect(date).not.toBeNull();

    const expected = Date.UTC(2024, 1, 4, 16, 12, 0);
    expect(date?.getTime()).toBe(expected);
  });

  it('parses day-first month-name format', () => {
    const { date, error } = parseInput('5 Feb 2024 12', 'auto', INPUT_TZ);

    expect(error).toBeNull();
    expect(date).not.toBeNull();

    const expected = Date.UTC(2024, 1, 5, 12, 0, 0);
    expect(date?.getTime()).toBe(expected);
  });

  it('parses ISO-like date with hour-only time', () => {
    const { date, error } = parseInput('2024-02-05 12', 'auto', INPUT_TZ);

    expect(error).toBeNull();
    expect(date).not.toBeNull();

    const expected = Date.UTC(2024, 1, 5, 12, 0, 0);
    expect(date?.getTime()).toBe(expected);
  });

  it('parses ISO-like date without timezone using input timezone', () => {
    const { date, error } = parseInput('2024-02-05 12:12:10', 'auto', INPUT_TZ);

    expect(error).toBeNull();
    expect(date).not.toBeNull();

    const expected = Date.UTC(2024, 1, 5, 12, 12, 10);
    expect(date?.getTime()).toBe(expected);
  });

  it('parses US-style date without timezone', () => {
    const { date, error } = parseInput('02/05/2024 12:12', 'auto', INPUT_TZ);

    expect(error).toBeNull();
    expect(date).not.toBeNull();

    const expected = Date.UTC(2024, 1, 5, 12, 12, 0);
    expect(date?.getTime()).toBe(expected);
  });

  it('parses numeric timestamp in seconds when auto-detected', () => {
    const { date, error } = parseInput('1707093130', 'auto', INPUT_TZ);

    expect(error).toBeNull();
    expect(date).not.toBeNull();
    expect(date?.getTime()).toBe(1707093130 * 1000);
  });
});
