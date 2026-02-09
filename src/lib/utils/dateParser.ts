export type TimestampFormat = 'auto' | 'seconds' | 'milliseconds';

function normalizeGmtUtcOffset(value: string): string {
  const withNamed = value.replace(
    /\b(?:GMT|UTC)\s*([+-])\s*(\d{1,2})(?::?(\d{2}))?\b/gi,
    (_match, sign, hours, minutes) => {
      const hh = hours.toString().padStart(2, '0');
      const mm = (minutes ?? '00').toString().padStart(2, '0');
      return `${sign}${hh}:${mm}`;
    },
  );
  return withNamed.replace(
    /(\s)([+-])\s*(\d{1,2})(?::?(\d{2}))?\b/g,
    (_match, space, sign, hours, minutes) => {
      const hh = hours.toString().padStart(2, '0');
      const mm = (minutes ?? '00').toString().padStart(2, '0');
      return `${space}${sign}${hh}:${mm}`;
    },
  );
}

function hasExplicitTimezone(value: string): boolean {
  return (
    /Z/i.test(value) ||
    /[+-]\d{2}:?\d{2}/.test(value) ||
    /\s[+-]\d{1,2}\b/.test(value) ||
    /\b(?:UTC|GMT)\b/i.test(value)
  );
}

function parseMonthName(value: string): number | null {
  const month = value.toLowerCase().slice(0, 3);
  const map: Record<string, number> = {
    jan: 1,
    feb: 2,
    mar: 3,
    apr: 4,
    may: 5,
    jun: 6,
    jul: 7,
    aug: 8,
    sep: 9,
    oct: 10,
    nov: 11,
    dec: 12,
  };
  return map[month] ?? null;
}

function parseTimeParts(value: string): { hour: number; minute: number; second: number } | null {
  const timeMatch = value.match(/(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*([ap]m)?/i);
  if (!timeMatch) {
    return { hour: 0, minute: 0, second: 0 };
  }

  let hour = parseInt(timeMatch[1], 10);
  const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
  const second = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
  const meridiem = timeMatch[4]?.toLowerCase();

  if (meridiem === 'pm' && hour < 12) hour += 12;
  if (meridiem === 'am' && hour === 12) hour = 0;

  return { hour, minute, second };
}

function parseDateComponents(value: string): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
} | null {
  const cleaned = value.trim().replace(/\s+/g, ' ');
  const currentYear = new Date().getFullYear();

  // ISO-like: YYYY-MM-DD [HH:MM[:SS]]
  let match = cleaned.match(
    /(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s](\d{1,2})(?::(\d{2}))?(?::(\d{2}))?)?/,
  );
  if (match) {
    const [, year, month, day, hour = '0', minute = '0', second = '0'] = match;
    return {
      year: parseInt(year, 10),
      month: parseInt(month, 10),
      day: parseInt(day, 10),
      hour: parseInt(hour, 10),
      minute: parseInt(minute, 10),
      second: parseInt(second, 10),
    };
  }

  // US-style: MM/DD/YYYY [HH:MM[:SS]]
  match = cleaned.match(
    /(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[T\s](\d{1,2})(?::(\d{2}))?(?::(\d{2}))?)?/,
  );
  if (match) {
    const [, month, day, year, hour = '0', minute = '0', second = '0'] = match;
    return {
      year: parseInt(year, 10),
      month: parseInt(month, 10),
      day: parseInt(day, 10),
      hour: parseInt(hour, 10),
      minute: parseInt(minute, 10),
      second: parseInt(second, 10),
    };
  }

  // Day first: 5 Feb 2024 [12:12] (try before month-name so "5 Feb 2024 12" isn't matched as "Feb 20")
  match = cleaned.match(
    /^(\d{1,2})\s+([A-Za-z]{3,9})(?:,?\s+(\d{4}))?(?:\s+(.+))?/, // day month [year] [time]
  );
  if (match) {
    const [, day, monthName, yearPart, timePart] = match;
    const month = parseMonthName(monthName);
    if (!month) return null;
    const { hour, minute, second } = parseTimeParts(timePart ?? '') ?? {
      hour: 0,
      minute: 0,
      second: 0,
    };
    return {
      year: yearPart ? parseInt(yearPart, 10) : currentYear,
      month,
      day: parseInt(day, 10),
      hour,
      minute,
      second,
    };
  }

  // Month name first: Feb 5[, 2024] [12:12 AM]
  match = cleaned.match(
    /^([A-Za-z]{3,9})\s+(\d{1,2})(?:,?\s+(\d{4}))?(?:\s+(.+))?/, // month day [year] [time]
  );
  if (match) {
    const [, monthName, day, yearPart, timePart] = match;
    const month = parseMonthName(monthName);
    if (!month) return null;
    const { hour, minute, second } = parseTimeParts(timePart ?? '') ?? {
      hour: 0,
      minute: 0,
      second: 0,
    };
    return {
      year: yearPart ? parseInt(yearPart, 10) : currentYear,
      month,
      day: parseInt(day, 10),
      hour,
      minute,
      second,
    };
  }

  return null;
}

export function isNumericTimestamp(value: string): boolean {
  return /^-?\d+$/.test(value.trim());
}

export function shouldShowInputTimezone(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (isNumericTimestamp(trimmed)) return false;
  if (hasExplicitTimezone(normalizeGmtUtcOffset(trimmed))) return false;
  return true;
}

export function parseInput(
  value: string,
  format: TimestampFormat,
  inputTimezone: string,
): { date: Date | null; error: string | null } {
  const trimmed = value.trim();
  if (!trimmed) {
    return { date: null, error: null };
  }

  const normalizedInput = normalizeGmtUtcOffset(trimmed);

  // Check if it's a numeric timestamp
  if (isNumericTimestamp(normalizedInput)) {
    const num = parseInt(normalizedInput, 10);
    let ms: number;

    if (format === 'auto') {
      // Auto-detect: if > 10 digits, assume milliseconds
      ms = normalizedInput.length > 10 ? num : num * 1000;
    } else if (format === 'seconds') {
      ms = num * 1000;
    } else {
      ms = num;
    }

    const date = new Date(ms);
    if (isNaN(date.getTime())) {
      return { date: null, error: 'Invalid timestamp' };
    }
    return { date, error: null };
  }

  // Try to parse as date string
  const hasTimezone = hasExplicitTimezone(normalizedInput);

  if (hasTimezone) {
    const hasYear = /\b\d{4}\b/.test(normalizedInput);
    let withYear = normalizedInput;
    if (!hasYear) {
      const currentYear = new Date().getFullYear();
      const offsetMatch = normalizedInput.match(/\s*([+-]\d{2}:\d{2}|[+-]\d{1,2}|Z)\b/i);
      if (offsetMatch) {
        withYear = normalizedInput.replace(offsetMatch[0], ` ${currentYear} ${offsetMatch[1]}`);
      } else {
        withYear = `${normalizedInput} ${currentYear}`;
      }
    }

    let date = new Date(withYear);
    if (!isNaN(date.getTime())) {
      return { date, error: null };
    }

    const offsetMatch = withYear.match(/([+-]\d{2}:\d{2}|[+-]\d{1,2}|Z)\b/i);
    const withoutOffset = withYear.replace(/\s*([+-]\d{2}:\d{2}|[+-]\d{1,2}|Z)\b/i, '').trim();
    const components = parseDateComponents(withoutOffset);
    if (!components) {
      return { date: null, error: 'Invalid date format' };
    }

    const { year, month, day, hour, minute, second } = components;
    const localMs = Date.UTC(year, month - 1, day, hour, minute, second);

    let offsetMs = 0;
    if (offsetMatch && offsetMatch[1].toUpperCase() !== 'Z') {
      const offsetParts = offsetMatch[1].match(/([+-])(\d{1,2})(?::(\d{2}))?/);
      const sign = offsetParts?.[1];
      const hh = offsetParts?.[2];
      const mm = offsetParts?.[3] ?? '00';
      if (sign && hh) {
        const offsetMinutes = parseInt(hh, 10) * 60 + parseInt(mm, 10);
        offsetMs = (sign === '+' ? 1 : -1) * offsetMinutes * 60 * 1000;
      }
    }

    date = new Date(localMs - offsetMs);
    if (isNaN(date.getTime())) {
      return { date: null, error: 'Invalid date format' };
    }
    return { date, error: null };
  }

  // No timezone - interpret in the selected input timezone
  try {
    const components = parseDateComponents(normalizedInput);
    if (!components) {
      return { date: null, error: 'Invalid date format' };
    }

    const { year, month, day, hour, minute, second } = components;

    // Create a UTC date with these components
    const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

    if (isNaN(utcDate.getTime())) {
      return { date: null, error: 'Invalid date format' };
    }

    // Now find the offset: what does this UTC time look like in the target timezone?
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: inputTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    // Format the UTC date in target timezone and parse it back
    const partsInTz = formatter.formatToParts(utcDate);
    const getPart = (type: string) => partsInTz.find(p => p.type === type)?.value ?? '0';

    const tzYear = parseInt(getPart('year'));
    const tzMonth = parseInt(getPart('month')) - 1;
    const tzDay = parseInt(getPart('day'));
    const tzHour = parseInt(getPart('hour'));
    const tzMinute = parseInt(getPart('minute'));
    const tzSecond = parseInt(getPart('second'));

    // Create what the target timezone thinks is this time in UTC
    const tzAsUtc = new Date(Date.UTC(tzYear, tzMonth, tzDay, tzHour, tzMinute, tzSecond));

    // The difference tells us the timezone offset
    const offsetMs = tzAsUtc.getTime() - utcDate.getTime();

    // Adjust: we want the UTC time where inputTimezone shows our input values
    const date = new Date(utcDate.getTime() - offsetMs);

    if (isNaN(date.getTime())) {
      return { date: null, error: 'Invalid date format' };
    }
    return { date, error: null };
  } catch {
    return { date: null, error: 'Invalid date format' };
  }
}
