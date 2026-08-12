import { describe, expect, it } from 'vitest';
import { formatTime } from '@/lib/utils/date';

// Dates are built from local components so the expectations hold in any timezone
// (formatTime renders in local time).

describe('formatTime', () => {
  it('formats as HH:MM:SS.mmm', () => {
    expect(formatTime(new Date(2024, 1, 5, 13, 7, 9, 42))).toBe('13:07:09.042');
  });

  it('zero-pads every field', () => {
    expect(formatTime(new Date(2024, 1, 5, 2, 3, 4, 5))).toBe('02:03:04.005');
  });

  it('uses a 24-hour clock rather than AM/PM', () => {
    const afternoon = formatTime(new Date(2024, 1, 5, 23, 59, 59, 999));

    expect(afternoon).toBe('23:59:59.999');
    expect(afternoon).not.toMatch(/[AP]M/i);
  });

  it('renders midnight as 00, not 24', () => {
    expect(formatTime(new Date(2024, 1, 5, 0, 0, 0, 0))).toBe('00:00:00.000');
  });
});
