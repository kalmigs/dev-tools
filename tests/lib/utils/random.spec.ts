import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateRandomId, randomColor } from '@/lib/utils/random';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('generateRandomId', () => {
  it('returns lowercase base36 characters only', () => {
    for (let i = 0; i < 200; i++) {
      expect(generateRandomId()).toMatch(/^[0-9a-z]{1,7}$/);
    }
  });

  it('produces distinct ids across calls', () => {
    const ids = new Set(Array.from({ length: 200 }, generateRandomId));

    expect(ids.size).toBeGreaterThan(190);
  });

  it('drops the "0." prefix of the underlying base36 value', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    // 0.5 -> '0.i' in base36, so everything after '0.' is a single character
    expect(generateRandomId()).toBe('i');
  });
});

describe('randomColor', () => {
  it('always returns a six-digit lowercase hex color', () => {
    for (let i = 0; i < 200; i++) {
      expect(randomColor()).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('zero-pads small values to six digits', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(randomColor()).toBe('#000000');

    vi.spyOn(Math, 'random').mockReturnValue(1 / 16777215);
    expect(randomColor()).toBe('#000001');
  });

  it('tops out one shy of white, since the range is exclusive of 16777215', () => {
    vi.spyOn(Math, 'random').mockReturnValue(1 - Number.EPSILON);

    expect(randomColor()).toBe('#fffffe');
  });
});
