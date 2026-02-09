import { useEffect, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { CheckIcon, ChevronDownIcon, CopyIcon, PlusIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useIsMobile } from '@/hooks/use-mobile';
import { isNumericTimestamp, parseInput, shouldShowInputTimezone, type TimestampFormat } from '@/lib/utils/dateParser';

interface CopiedState {
  [key: string]: boolean;
}

interface InputControlsProps {
  inputTimezone: string;
  inputValue: string;
  onClear: () => void;
  onConvert: () => void;
  onInputTimezoneChange: (tz: string) => void;
  onInputValueChange: (value: string) => void;
  onSetNow: () => void;
  onTimestampFormatChange: (format: TimestampFormat) => void;
  timestampFormat: TimestampFormat;
}

interface OutputSectionProps {
  copiedState: CopiedState;
  onAddTimezone: (tz: string) => void;
  onCopy: (key: string, value: string) => void;
  onRemoveTimezone: (tz: string) => void;
  outputTimezones: string[];
  parsedDate: Date | null;
  parseError: string | null;
}

interface SearchParams {
  format?: TimestampFormat;
  inputTz?: string;
  value?: string;
}

// Constants
const COMMON_TIMEZONES: { label: string; value: string }[] = [
  { label: 'UTC', value: 'UTC' },
  { label: 'Local', value: Intl.DateTimeFormat().resolvedOptions().timeZone },
  { label: 'New York (ET)', value: 'America/New_York' },
  { label: 'Chicago (CT)', value: 'America/Chicago' },
  { label: 'Denver (MT)', value: 'America/Denver' },
  { label: 'Los Angeles (PT)', value: 'America/Los_Angeles' },
  { label: 'London', value: 'Europe/London' },
  { label: 'Paris', value: 'Europe/Paris' },
  { label: 'Berlin', value: 'Europe/Berlin' },
  { label: 'Tokyo', value: 'Asia/Tokyo' },
  { label: 'Shanghai', value: 'Asia/Shanghai' },
  { label: 'Singapore', value: 'Asia/Singapore' },
  { label: 'Sydney', value: 'Australia/Sydney' },
  { label: 'Dubai', value: 'Asia/Dubai' },
  { label: 'Mumbai', value: 'Asia/Kolkata' },
  { label: 'São Paulo', value: 'America/Sao_Paulo' },
];

const ALL_TIMEZONES = Intl.supportedValuesOf('timeZone');

// Timezone abbreviation mappings for search
const TIMEZONE_ABBREVIATIONS: Record<string, string[]> = {
  // US timezones
  'America/New_York': ['est', 'edt', 'et', 'eastern'],
  'America/Chicago': ['cst', 'cdt', 'ct', 'central'],
  'America/Denver': ['mst', 'mdt', 'mt', 'mountain'],
  'America/Los_Angeles': ['pst', 'pdt', 'pt', 'pacific'],
  'America/Anchorage': ['akst', 'akdt', 'akt', 'alaska'],
  'Pacific/Honolulu': ['hst', 'hdt', 'ht', 'hawaii'],
  // UK/Europe
  'Europe/London': ['gmt', 'bst', 'british', 'uk'],
  'Europe/Paris': ['cet', 'cest', 'central european'],
  'Europe/Berlin': ['cet', 'cest', 'german'],
  'Europe/Moscow': ['msk', 'moscow'],
  // Asia
  'Asia/Tokyo': ['jst', 'japan'],
  'Asia/Shanghai': ['cst', 'china', 'beijing'],
  'Asia/Hong_Kong': ['hkt', 'hong kong'],
  'Asia/Singapore': ['sgt', 'singapore'],
  'Asia/Seoul': ['kst', 'korea'],
  'Asia/Manila': ['pht', 'phst', 'philippine', 'philippines', 'manila'],
  'Asia/Kolkata': ['ist', 'india', 'mumbai'],
  'Asia/Dubai': ['gst', 'gulf', 'uae'],
  'Asia/Jakarta': ['wib', 'indonesia', 'jakarta'],
  'Asia/Bangkok': ['ict', 'thailand', 'bangkok', 'vietnam', 'hanoi'],
  'Asia/Taipei': ['tst', 'taiwan', 'taipei'],
  // Australia
  'Australia/Sydney': ['aest', 'aedt', 'sydney'],
  'Australia/Perth': ['awst', 'perth'],
  'Australia/Brisbane': ['aest', 'brisbane'],
  // Others
  'Pacific/Auckland': ['nzst', 'nzdt', 'new zealand'],
  'America/Sao_Paulo': ['brt', 'brst', 'brazil'],
  'Africa/Johannesburg': ['sast', 'south africa'],
};

// Build reverse lookup: abbreviation -> timezone(s)
const ABBREVIATION_TO_TIMEZONES: Record<string, string[]> = {};
for (const [tz, abbrs] of Object.entries(TIMEZONE_ABBREVIATIONS)) {
  for (const abbr of abbrs) {
    if (!ABBREVIATION_TO_TIMEZONES[abbr]) {
      ABBREVIATION_TO_TIMEZONES[abbr] = [];
    }
    ABBREVIATION_TO_TIMEZONES[abbr].push(tz);
  }
}

const DEFAULT_OUTPUT_TIMEZONES = ['UTC', Intl.DateTimeFormat().resolvedOptions().timeZone];

const LOCAL_STORAGE_KEY = 'timestamp-converter-timezones';

// Helper functions
function formatDateInTimezone(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'long',
    timeZone: timezone,
  }).format(date);
}

function formatDateShort(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    timeZone: timezone,
  }).format(date);
}

function getRelativeTime(date: Date): string {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const diff = date.getTime() - Date.now();
  const absDiff = Math.abs(diff);
  const seconds = absDiff / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;
  const weeks = days / 7;
  const months = days / 30;
  const years = days / 365;

  const sign = diff < 0 ? -1 : 1;

  if (years >= 1) return rtf.format(Math.round(years) * sign, 'year');
  if (months >= 1) return rtf.format(Math.round(months) * sign, 'month');
  if (weeks >= 1) return rtf.format(Math.round(weeks) * sign, 'week');
  if (days >= 1) return rtf.format(Math.round(days) * sign, 'day');
  if (hours >= 1) return rtf.format(Math.round(hours) * sign, 'hour');
  if (minutes >= 1) return rtf.format(Math.round(minutes) * sign, 'minute');
  return rtf.format(Math.round(seconds) * sign, 'second');
}

function getTimezoneOffset(timezone: string): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'shortOffset',
  });
  const parts = formatter.formatToParts(now);
  const offsetPart = parts.find(p => p.type === 'timeZoneName');
  return offsetPart?.value || '';
}

function loadSavedTimezones(): string[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignore parse errors
  }
  return DEFAULT_OUTPUT_TIMEZONES;
}

function saveTimezones(timezones: string[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(timezones));
  } catch {
    // Ignore storage errors
  }
}

function searchTimezones(query: string, exclude: string[]): string[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results = new Set<string>();

  // Check abbreviation matches first (prioritize these)
  for (const [abbr, tzList] of Object.entries(ABBREVIATION_TO_TIMEZONES)) {
    if (abbr.includes(q) || q.includes(abbr)) {
      for (const tz of tzList) {
        if (!exclude.includes(tz)) {
          results.add(tz);
        }
      }
    }
  }

  // Also search IANA timezone names
  for (const tz of ALL_TIMEZONES) {
    if (!exclude.includes(tz) && tz.toLowerCase().includes(q)) {
      results.add(tz);
    }
  }

  return Array.from(results).slice(0, 20);
}

function getTimezoneDisplayName(tz: string): string {
  // Get abbreviations for this timezone if any
  const abbrs = TIMEZONE_ABBREVIATIONS[tz];
  if (abbrs && abbrs.length > 0) {
    const mainAbbr = abbrs[0].toUpperCase();
    return `${tz} (${mainAbbr})`;
  }
  return tz;
}

// Subcomponents
function InputControls({
  inputTimezone,
  inputValue,
  onClear,
  onConvert,
  onInputTimezoneChange,
  onInputValueChange,
  onSetNow,
  onTimestampFormatChange,
  timestampFormat,
}: InputControlsProps) {
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="flex flex-col gap-6">
      {/* Input Field */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground">Timestamp or Date</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              value={inputValue}
              onChange={e => onInputValueChange(e.target.value)}
              placeholder="1706025600 or 2024-01-23 12:00:00"
              className="font-mono pr-8"
              onKeyDown={e => e.key === 'Enter' && onConvert()}
            />
            {inputValue && (
              <button
                onClick={onClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                type="button"
              >
                <XIcon className="size-4" />
              </button>
            )}
          </div>
          <Button variant="outline" onClick={onSetNow}>
            Now
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Enter a Unix timestamp or a date string</p>
      </div>

      {/* Timestamp Format - only show for numeric input */}
      {isNumericTimestamp(inputValue.trim()) && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground">Timestamp Format</label>
          <Select
            value={timestampFormat}
            onValueChange={v => onTimestampFormatChange(v as TimestampFormat)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto-detect</SelectItem>
              <SelectItem value="seconds">Seconds</SelectItem>
              <SelectItem value="milliseconds">Milliseconds</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Input Timezone - only show when applicable */}
      {shouldShowInputTimezone(inputValue) && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground">Input Timezone</label>
          <Select value={inputTimezone} onValueChange={onInputTimezoneChange}>
            <SelectTrigger className="w-[240px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Common</SelectLabel>
                {COMMON_TIMEZONES.map(tz => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label} {tz.value === localTz && '(Local)'}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Interpret input as this timezone</p>
        </div>
      )}

      {/* Convert Button (mobile) */}
      <Button onClick={onConvert} className="w-fit md:hidden">
        Convert
      </Button>
    </div>
  );
}

function OutputSection({
  copiedState,
  onAddTimezone,
  onCopy,
  onRemoveTimezone,
  outputTimezones,
  parsedDate,
  parseError,
}: OutputSectionProps) {
  const [tzSearchOpen, setTzSearchOpen] = useState(false);
  const [tzSearch, setTzSearch] = useState('');
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const filteredTimezones = searchTimezones(tzSearch, outputTimezones);

  if (parseError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-destructive">
          <p className="font-medium">Parse Error</p>
          <p className="text-sm">{parseError}</p>
        </div>
      </div>
    );
  }

  if (!parsedDate) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground border rounded-lg border-dashed min-h-[200px]">
        <p>Enter a timestamp or date to convert</p>
      </div>
    );
  }

  const formats = [
    { key: 'iso', label: 'ISO 8601', value: parsedDate.toISOString() },
    {
      key: 'unix-s',
      label: 'Unix (seconds)',
      value: Math.floor(parsedDate.getTime() / 1000).toString(),
    },
    { key: 'unix-ms', label: 'Unix (milliseconds)', value: parsedDate.getTime().toString() },
    { key: 'rfc2822', label: 'RFC 2822', value: parsedDate.toUTCString() },
    { key: 'relative', label: 'Relative', value: getRelativeTime(parsedDate) },
  ];

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Parsed Result */}
      <div className="border rounded-lg p-4 bg-muted/30">
        <div className="text-lg font-medium">{formatDateInTimezone(parsedDate, localTz)}</div>
        <div className="text-sm text-muted-foreground mt-1">{getRelativeTime(parsedDate)}</div>
      </div>

      {/* Formats */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
          <ChevronDownIcon className="size-4 transition-transform group-data-[state=closed]:-rotate-90" />
          Formats
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border rounded-lg overflow-hidden mt-2">
            <div className="divide-y">
              {formats.map(format => (
                <div
                  key={format.key}
                  className="flex items-center justify-between px-3 py-2 hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <span className="text-xs text-muted-foreground">{format.label}</span>
                    <code className="text-sm font-mono truncate">{format.value}</code>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onCopy(format.key, format.value)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2"
                  >
                    {copiedState[format.key] ? (
                      <CheckIcon className="size-4 text-green-500" />
                    ) : (
                      <CopyIcon className="size-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Timezones */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
          <ChevronDownIcon className="size-4 transition-transform group-data-[state=closed]:-rotate-90" />
          Timezones
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border rounded-lg overflow-hidden mt-2">
            <div className="divide-y">
              {outputTimezones.map(tz => (
                <div
                  key={tz}
                  className="flex items-center justify-between px-3 py-2 hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <span className="text-xs text-muted-foreground">
                      {tz} {tz === localTz && '(Local)'} • {getTimezoneOffset(tz)}
                    </span>
                    <code className="text-sm font-mono truncate">
                      {formatDateShort(parsedDate, tz)}
                    </code>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onCopy(`tz-${tz}`, formatDateShort(parsedDate, tz))}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copiedState[`tz-${tz}`] ? (
                        <CheckIcon className="size-4 text-green-500" />
                      ) : (
                        <CopyIcon className="size-4" />
                      )}
                    </Button>
                    {outputTimezones.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onRemoveTimezone(tz)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      >
                        <XIcon className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Timezone */}
            <div className="border-t p-2">
              {tzSearchOpen ? (
                <div className="flex flex-col gap-2">
                  <Input
                    value={tzSearch}
                    onChange={e => setTzSearch(e.target.value)}
                    placeholder="Search timezones..."
                    className="text-sm"
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Escape') {
                        setTzSearchOpen(false);
                        setTzSearch('');
                      }
                    }}
                  />
                  <div className="max-h-[200px] overflow-y-auto">
                    {filteredTimezones.length > 0 ? (
                      filteredTimezones.map(tz => (
                        <button
                          key={tz}
                          onClick={() => {
                            onAddTimezone(tz);
                            setTzSearchOpen(false);
                            setTzSearch('');
                          }}
                          className="w-full text-left px-2 py-1.5 text-sm hover:bg-muted rounded transition-colors"
                        >
                          {getTimezoneDisplayName(tz)}
                        </button>
                      ))
                    ) : tzSearch.length > 0 ? (
                      <p className="text-sm text-muted-foreground px-2 py-1.5">
                        No timezones found
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground px-2 py-1.5">
                        Type to search (e.g. "pst", "tokyo", "europe")
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setTzSearchOpen(false);
                      setTzSearch('');
                    }}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTzSearchOpen(true)}
                  className="w-full gap-2"
                >
                  <PlusIcon className="size-4" />
                  Add Timezone
                </Button>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// Main component
function TimestampPage() {
  const isMobile = useIsMobile();
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const navigate = useNavigate({ from: '/convert/timestamp' });
  const search = Route.useSearch();

  // Initialize state from search params
  const [activeTab, setActiveTab] = useState('input');
  const [copiedState, setCopiedState] = useState<CopiedState>({});
  const [inputTimezone, setInputTimezone] = useState(search.inputTz ?? localTz);
  const [inputValue, setInputValue] = useState(search.value ?? '');
  const [outputTimezones, setOutputTimezones] = useState<string[]>(loadSavedTimezones);
  const [parsedDate, setParsedDate] = useState<Date | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [timestampFormat, setTimestampFormat] = useState<TimestampFormat>(search.format ?? 'auto');

  // Update URL when settings change
  const updateSearchParams = (updates: Partial<SearchParams>) => {
    navigate({
      search: prev => ({
        ...prev,
        ...updates,
      }),
      replace: true,
    });
  };

  // Parse input whenever it changes
  useEffect(() => {
    const { date, error } = parseInput(inputValue, timestampFormat, inputTimezone);
    setParsedDate(date);
    setParseError(error);
  }, [inputValue, timestampFormat, inputTimezone]);

  const handleAddTimezone = (tz: string) => {
    const updated = [...outputTimezones, tz];
    setOutputTimezones(updated);
    saveTimezones(updated);
  };

  const handleClear = () => {
    setInputValue('');
    updateSearchParams({ value: undefined });
  };

  const handleCopy = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedState(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedState(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const handleConvert = () => {
    // Just switch to output tab on mobile
    if (isMobile) {
      setActiveTab('output');
    }
  };

  const handleInputTimezoneChange = (tz: string) => {
    setInputTimezone(tz);
    updateSearchParams({ inputTz: tz === localTz ? undefined : tz });
  };

  const handleInputValueChange = (value: string) => {
    setInputValue(value);
    updateSearchParams({ value: value || undefined });
  };

  const handleRemoveTimezone = (tz: string) => {
    const updated = outputTimezones.filter(t => t !== tz);
    setOutputTimezones(updated);
    saveTimezones(updated);
  };

  const handleSetNow = () => {
    const now = Date.now().toString();
    setInputValue(now);
    updateSearchParams({ value: now });
  };

  const handleTimestampFormatChange = (format: TimestampFormat) => {
    setTimestampFormat(format);
    updateSearchParams({ format: format === 'auto' ? undefined : format });
  };

  // Mobile Layout with Tabs
  if (isMobile) {
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <TabsList className="w-full">
          <TabsTrigger value="input" className="flex-1">
            Input
          </TabsTrigger>
          <TabsTrigger value="output" className="flex-1">
            Output
          </TabsTrigger>
        </TabsList>
        <TabsContent value="input" className="flex-1 pt-4">
          <InputControls
            inputTimezone={inputTimezone}
            inputValue={inputValue}
            onClear={handleClear}
            onConvert={handleConvert}
            onInputTimezoneChange={handleInputTimezoneChange}
            onInputValueChange={handleInputValueChange}
            onSetNow={handleSetNow}
            onTimestampFormatChange={handleTimestampFormatChange}
            timestampFormat={timestampFormat}
          />
        </TabsContent>
        <TabsContent
          value="output"
          className="flex-1 pt-4 min-h-0 overflow-auto max-h-[calc(100vh-8.5rem)]"
        >
          <OutputSection
            copiedState={copiedState}
            onAddTimezone={handleAddTimezone}
            onCopy={handleCopy}
            onRemoveTimezone={handleRemoveTimezone}
            outputTimezones={outputTimezones}
            parsedDate={parsedDate}
            parseError={parseError}
          />
        </TabsContent>
      </Tabs>
    );
  }

  // Desktop Layout - Side by Side
  return (
    <div className="h-full flex gap-8">
      {/* Left - Input Controls */}
      <div className="w-[280px] shrink-0">
        <InputControls
          inputTimezone={inputTimezone}
          inputValue={inputValue}
          onClear={handleClear}
          onConvert={handleConvert}
          onInputTimezoneChange={handleInputTimezoneChange}
          onInputValueChange={handleInputValueChange}
          onSetNow={handleSetNow}
          onTimestampFormatChange={handleTimestampFormatChange}
          timestampFormat={timestampFormat}
        />
      </div>

      {/* Right - Output */}
      <div className="flex-1 min-w-0 max-h-[calc(100vh-6rem)] overflow-y-auto">
        <OutputSection
          copiedState={copiedState}
          onAddTimezone={handleAddTimezone}
          onCopy={handleCopy}
          onRemoveTimezone={handleRemoveTimezone}
          outputTimezones={outputTimezones}
          parsedDate={parsedDate}
          parseError={parseError}
        />
      </div>
    </div>
  );
}

// Route export
export const Route = createFileRoute('/convert/timestamp')({
  component: TimestampPage,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    const validFormats: TimestampFormat[] = ['auto', 'seconds', 'milliseconds'];

    return {
      format: validFormats.includes(search.format as TimestampFormat)
        ? (search.format as TimestampFormat)
        : undefined,
      inputTz:
        typeof search.inputTz === 'string' && search.inputTz.length > 0
          ? search.inputTz
          : undefined,
      value: typeof search.value === 'string' && search.value.length > 0 ? search.value : undefined,
    };
  },
});
