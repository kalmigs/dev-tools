import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  CheckIcon,
  CopyIcon,
  Keyboard,
  Smartphone,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsLikelyPhone, useIsMobile } from '@/hooks/use-mobile';
import { cn, formatTime } from '@/lib/utils';

// Search params type
interface SearchParams {
  keydown?: boolean;
  keyup?: boolean;
  keypress?: boolean;
  preventDefault?: boolean;
  deprecated?: boolean;
  keyboard?: boolean;
}

// Types
interface KeyEvent {
  id: string;
  type: 'keydown' | 'keyup' | 'keypress';
  key: string;
  code: string;
  keyCode: number;
  which: number;
  charCode: number;
  location: number;
  repeat: boolean;
  isComposing: boolean;
  modifiers: {
    alt: boolean;
    ctrl: boolean;
    meta: boolean;
    shift: boolean;
  };
  timestamp: Date;
}

interface Options {
  captureKeydown: boolean;
  captureKeyup: boolean;
  captureKeypress: boolean;
  preventDefault: boolean;
  showDeprecated: boolean;
  showKeyboard: boolean;
  historyLimit: number;
}

// Constants
const LOCATION_MAP: Record<number, string> = {
  0: 'Standard',
  1: 'Left',
  2: 'Right',
  3: 'Numpad',
};

const DEFAULT_OPTIONS: Options = {
  captureKeydown: true,
  captureKeyup: true,
  captureKeypress: false,
  preventDefault: false,
  showDeprecated: true,
  showKeyboard: true,
  historyLimit: 50,
};

// US QWERTY Keyboard Layout
const KEYBOARD_ROWS = [
  // Row 0: Function keys
  [
    { code: 'Escape', label: 'Esc', width: 1 },
    { code: 'F1', label: 'F1', width: 1 },
    { code: 'F2', label: 'F2', width: 1 },
    { code: 'F3', label: 'F3', width: 1 },
    { code: 'F4', label: 'F4', width: 1 },
    { code: 'F5', label: 'F5', width: 1 },
    { code: 'F6', label: 'F6', width: 1 },
    { code: 'F7', label: 'F7', width: 1 },
    { code: 'F8', label: 'F8', width: 1 },
    { code: 'F9', label: 'F9', width: 1 },
    { code: 'F10', label: 'F10', width: 1 },
    { code: 'F11', label: 'F11', width: 1 },
    { code: 'F12', label: 'F12', width: 1 },
  ],
  // Row 1: Numbers
  [
    { code: 'Backquote', label: '`', width: 1 },
    { code: 'Digit1', label: '1', width: 1 },
    { code: 'Digit2', label: '2', width: 1 },
    { code: 'Digit3', label: '3', width: 1 },
    { code: 'Digit4', label: '4', width: 1 },
    { code: 'Digit5', label: '5', width: 1 },
    { code: 'Digit6', label: '6', width: 1 },
    { code: 'Digit7', label: '7', width: 1 },
    { code: 'Digit8', label: '8', width: 1 },
    { code: 'Digit9', label: '9', width: 1 },
    { code: 'Digit0', label: '0', width: 1 },
    { code: 'Minus', label: '-', width: 1 },
    { code: 'Equal', label: '=', width: 1 },
    { code: 'Backspace', label: '⌫', width: 2 },
  ],
  // Row 2: QWERTY
  [
    { code: 'Tab', label: 'Tab', width: 1.5 },
    { code: 'KeyQ', label: 'Q', width: 1 },
    { code: 'KeyW', label: 'W', width: 1 },
    { code: 'KeyE', label: 'E', width: 1 },
    { code: 'KeyR', label: 'R', width: 1 },
    { code: 'KeyT', label: 'T', width: 1 },
    { code: 'KeyY', label: 'Y', width: 1 },
    { code: 'KeyU', label: 'U', width: 1 },
    { code: 'KeyI', label: 'I', width: 1 },
    { code: 'KeyO', label: 'O', width: 1 },
    { code: 'KeyP', label: 'P', width: 1 },
    { code: 'BracketLeft', label: '[', width: 1 },
    { code: 'BracketRight', label: ']', width: 1 },
    { code: 'Backslash', label: '\\', width: 1.5 },
  ],
  // Row 3: ASDF
  [
    { code: 'CapsLock', label: 'Caps', width: 1.75 },
    { code: 'KeyA', label: 'A', width: 1 },
    { code: 'KeyS', label: 'S', width: 1 },
    { code: 'KeyD', label: 'D', width: 1 },
    { code: 'KeyF', label: 'F', width: 1 },
    { code: 'KeyG', label: 'G', width: 1 },
    { code: 'KeyH', label: 'H', width: 1 },
    { code: 'KeyJ', label: 'J', width: 1 },
    { code: 'KeyK', label: 'K', width: 1 },
    { code: 'KeyL', label: 'L', width: 1 },
    { code: 'Semicolon', label: ';', width: 1 },
    { code: 'Quote', label: "'", width: 1 },
    { code: 'Enter', label: 'Enter', width: 2.25 },
  ],
  // Row 4: ZXCV
  [
    { code: 'ShiftLeft', label: 'Shift', width: 2.25 },
    { code: 'KeyZ', label: 'Z', width: 1 },
    { code: 'KeyX', label: 'X', width: 1 },
    { code: 'KeyC', label: 'C', width: 1 },
    { code: 'KeyV', label: 'V', width: 1 },
    { code: 'KeyB', label: 'B', width: 1 },
    { code: 'KeyN', label: 'N', width: 1 },
    { code: 'KeyM', label: 'M', width: 1 },
    { code: 'Comma', label: ',', width: 1 },
    { code: 'Period', label: '.', width: 1 },
    { code: 'Slash', label: '/', width: 1 },
    { code: 'ShiftRight', label: 'Shift', width: 2.75 },
  ],
  // Row 5: Bottom row
  [
    { code: 'ControlLeft', label: 'Ctrl', width: 1.25 },
    { code: 'AltLeft', label: 'Alt', width: 1.25 },
    { code: 'MetaLeft', label: '⌘', width: 1.25 },
    { code: 'Space', label: '', width: 6.25 },
    { code: 'MetaRight', label: '⌘', width: 1.25 },
    { code: 'AltRight', label: 'Alt', width: 1.25 },
    { code: 'ControlRight', label: 'Ctrl', width: 1.25 },
  ],
];

// Arrow keys cluster
const ARROW_KEYS = [
  { code: 'ArrowUp', label: '↑', row: 0, col: 1 },
  { code: 'ArrowLeft', label: '←', row: 1, col: 0 },
  { code: 'ArrowDown', label: '↓', row: 1, col: 1 },
  { code: 'ArrowRight', label: '→', row: 1, col: 2 },
];

// Helper functions
function generateChordString(pressedKeys: Set<string>, modifiers: KeyEvent['modifiers']): string {
  const parts: string[] = [];
  if (modifiers.ctrl) parts.push('Ctrl');
  if (modifiers.alt) parts.push('Alt');
  if (modifiers.shift) parts.push('Shift');
  if (modifiers.meta) parts.push('⌘');

  // Add non-modifier keys
  pressedKeys.forEach(code => {
    if (
      !code.includes('Control') &&
      !code.includes('Alt') &&
      !code.includes('Shift') &&
      !code.includes('Meta')
    ) {
      // Get a readable label
      const label = code.replace('Key', '').replace('Digit', '');
      parts.push(label);
    }
  });

  return parts.join(' + ') || 'None';
}

function generateCodeSnippetFromChord(
  chord: {
    keys: Set<string>;
    modifiers: KeyEvent['modifiers'];
    mainKeys: { key: string; code: string }[];
  } | null,
): string {
  if (!chord || chord.mainKeys.length === 0) return '// Press a key to generate code';

  const conditions: string[] = [];
  if (chord.modifiers.ctrl) conditions.push('e.ctrlKey');
  if (chord.modifiers.alt) conditions.push('e.altKey');
  if (chord.modifiers.shift) conditions.push('e.shiftKey');
  if (chord.modifiers.meta) conditions.push('e.metaKey');

  // Add conditions for all non-modifier keys
  if (chord.mainKeys.length === 1) {
    conditions.push(`e.key === '${chord.mainKeys[0].key}'`);
  } else {
    // For multiple keys, use an array check
    const keyList = chord.mainKeys.map(k => `'${k.key}'`).join(', ');
    conditions.push(`[${keyList}].includes(e.key)`);
  }

  return `if (${conditions.join(' && ')}) {\n  // Handle ${generateChordString(chord.keys, chord.modifiers)}\n}`;
}

// Subcomponents
function KeyDisplay({
  currentKey,
  pressedKeys,
  useInputCapture = false,
  keyCaptureInputRef,
  onMobileInput,
}: {
  currentKey: KeyEvent | null;
  pressedKeys: Set<string>;
  useInputCapture?: boolean;
  keyCaptureInputRef?: (el: HTMLInputElement | null) => void;
  onMobileInput?: (data: string) => void;
}) {
  const lastValueRef = useRef('');
  const handleInput = useCallback(
    (e: FormEvent<HTMLInputElement>) => {
      const input = e.currentTarget;
      const native = e.nativeEvent as InputEvent;
      // InputEvent.data is the inserted text; some Android/IME don't set it, so fallback to value diff
      let data = native.data;
      if (data == null || data === '') {
        const prev = lastValueRef.current;
        const next = input.value;
        if (next.length > prev.length) {
          data = next.slice(prev.length) || next.slice(-1);
        }
      }
      lastValueRef.current = input.value;
      if (data == null || data === '') {
        return;
      }
      onMobileInput?.(data);
      // Defer clear so we don't clear in same tick as input event (some mobile browsers drop or batch events)
      const inp = input;
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(() => {
          inp.value = '';
          lastValueRef.current = '';
        });
      } else {
        setTimeout(() => {
          inp.value = '';
          lastValueRef.current = '';
        }, 0);
      }
    },
    [onMobileInput],
  );

  return (
    <div className="relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-border bg-gradient-to-b from-muted/30 to-muted/10 min-h-[180px]">
      {useInputCapture && (
        <input
          ref={keyCaptureInputRef}
          type="text"
          placeholder="Tap to open keyboard"
          autoComplete="off"
          inputMode="text"
          className="absolute inset-0 z-10 w-full h-full rounded-xl opacity-0 cursor-text min-w-0"
          aria-label="Key capture input"
          onInput={handleInput}
        />
      )}
      <div
        className={cn(
          'flex flex-col items-center justify-center',
          useInputCapture && 'pointer-events-none',
        )}
      >
        {currentKey ? (
          <>
            <div className="text-6xl font-mono font-bold mb-4 bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent animate-in zoom-in-50 duration-150">
              {currentKey.key === ' '
                ? '␣'
                : currentKey.key.length === 1
                  ? currentKey.key.toUpperCase()
                  : currentKey.key}
            </div>
            <div className="text-sm text-muted-foreground font-mono">
              {currentKey.code === 'FromInputEvent' ? 'Mobile input' : currentKey.code}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {pressedKeys.size} key{pressedKeys.size !== 1 ? 's' : ''} pressed
              </span>
            </div>
          </>
        ) : (
          <>
            <Keyboard className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-lg">
              {useInputCapture ? 'Tap to open keyboard' : 'Press any key...'}
            </p>
            <p className="text-muted-foreground/60 text-sm mt-1">
              {useInputCapture ? 'Then type to capture keys' : 'Click here first to focus'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function ModifierBadges({ modifiers }: { modifiers: KeyEvent['modifiers'] | null }) {
  const badges = [
    { key: 'shift', label: 'Shift', active: modifiers?.shift },
    { key: 'ctrl', label: 'Ctrl', active: modifiers?.ctrl },
    { key: 'alt', label: 'Alt', active: modifiers?.alt },
    { key: 'meta', label: '⌘ Meta', active: modifiers?.meta },
  ];

  return (
    <div className="flex gap-2 justify-center">
      {badges.map(badge => (
        <div
          key={badge.key}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
            badge.active
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {badge.label}
        </div>
      ))}
    </div>
  );
}

function EventProperties({
  event,
  showDeprecated,
  onCopy,
  copiedField,
  defaultOpen = true,
}: {
  event: KeyEvent | null;
  showDeprecated: boolean;
  onCopy: (value: string, field: string) => void;
  copiedField: string | null;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const properties = event
    ? [
        { key: 'key', value: JSON.stringify(event.key), description: 'Key value' },
        { key: 'code', value: JSON.stringify(event.code), description: 'Physical key' },
        ...(showDeprecated
          ? [
              {
                key: 'keyCode',
                value: String(event.keyCode),
                description: '(deprecated)',
                deprecated: true,
              },
              {
                key: 'which',
                value: String(event.which),
                description: '(deprecated)',
                deprecated: true,
              },
              {
                key: 'charCode',
                value: String(event.charCode),
                description: '(deprecated)',
                deprecated: true,
              },
            ]
          : []),
        {
          key: 'location',
          value: `${event.location} (${LOCATION_MAP[event.location] || 'Unknown'})`,
          description: 'Key location',
        },
        { key: 'repeat', value: String(event.repeat), description: 'Auto-repeat' },
        { key: 'isComposing', value: String(event.isComposing), description: 'IME composition' },
      ]
    : [];

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border rounded-lg overflow-hidden">
      <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2 bg-muted/50 hover:bg-muted/70 transition-colors">
        <span className="text-sm font-medium">Event Properties</span>
        {open ? <ChevronUpIcon className="size-4" /> : <ChevronDownIcon className="size-4" />}
      </CollapsibleTrigger>
      <CollapsibleContent>
        {!event ? (
          <div className="p-8 text-center text-muted-foreground">
            Event properties will appear here
          </div>
        ) : (
          <div className="divide-y">
            {properties.map(prop => (
              <div
                key={prop.key}
                className={cn(
                  'flex items-center justify-between px-4 py-2 hover:bg-muted/30 transition-colors group',
                  prop.deprecated && 'opacity-60',
                )}
              >
                <div className="flex items-center gap-3">
                  <code className="text-sm font-mono text-muted-foreground">{prop.key}</code>
                  <code className="text-sm font-mono font-medium">{prop.value}</code>
                  {prop.deprecated && (
                    <span className="text-xs text-amber-500">{prop.description}</span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onCopy(prop.value, prop.key)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {copiedField === prop.key ? (
                    <CheckIcon className="size-4 text-green-500" />
                  ) : (
                    <CopyIcon className="size-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

function VisualKeyboard({ pressedKeys }: { pressedKeys: Set<string> }) {
  return (
    <div className="border rounded-lg p-4 bg-muted/20">
      <div className="flex flex-col gap-1.5 items-center">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1">
            {row.map(key => {
              const isPressed = pressedKeys.has(key.code);
              return (
                <div
                  key={key.code}
                  style={{ width: `${key.width * 2.5}rem` }}
                  className={cn(
                    'h-10 flex items-center justify-center rounded-md text-xs font-medium transition-all duration-100 select-none',
                    'border border-border',
                    isPressed
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/40 scale-95 border-primary'
                      : 'bg-background hover:bg-muted/50',
                  )}
                >
                  {key.label}
                </div>
              );
            })}
          </div>
        ))}

        {/* Arrow keys */}
        <div className="flex gap-1 mt-2">
          <div className="flex flex-col gap-1">
            <div className="flex justify-center">
              {ARROW_KEYS.filter(k => k.row === 0).map(key => {
                const isPressed = pressedKeys.has(key.code);
                return (
                  <div
                    key={key.code}
                    className={cn(
                      'w-10 h-8 flex items-center justify-center rounded-md text-xs font-medium transition-all duration-100',
                      'border border-border',
                      isPressed
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/40 scale-95 border-primary'
                        : 'bg-background hover:bg-muted/50',
                    )}
                  >
                    {key.label}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-1">
              {ARROW_KEYS.filter(k => k.row === 1).map(key => {
                const isPressed = pressedKeys.has(key.code);
                return (
                  <div
                    key={key.code}
                    className={cn(
                      'w-10 h-8 flex items-center justify-center rounded-md text-xs font-medium transition-all duration-100',
                      'border border-border',
                      isPressed
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/40 scale-95 border-primary'
                        : 'bg-background hover:bg-muted/50',
                    )}
                  >
                    {key.label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventHistory({
  events,
  onClear,
  maxSimultaneous,
}: {
  events: KeyEvent[];
  onClear: () => void;
  maxSimultaneous: number;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
        >
          {expanded ? <ChevronUpIcon className="size-4" /> : <ChevronDownIcon className="size-4" />}
          Event History ({events.length})
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            Max simultaneous:{' '}
            <span className="font-mono font-medium text-foreground">{maxSimultaneous}</span>
          </span>
          <Button variant="ghost" size="sm" onClick={onClear} className="gap-1.5">
            <TrashIcon className="size-3.5" />
            Clear
          </Button>
        </div>
      </div>
      {expanded && (
        <div className="max-h-[200px] overflow-y-auto divide-y">
          {events.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No events recorded yet
            </div>
          ) : (
            events.map(event => (
              <div
                key={event.id}
                className="flex items-center gap-4 px-4 py-1.5 text-sm hover:bg-muted/30 transition-colors"
              >
                <span
                  className={cn(
                    'px-2 py-0.5 rounded text-xs font-medium',
                    event.type === 'keydown' && 'bg-green-500/10 text-green-600',
                    event.type === 'keyup' && 'bg-red-500/10 text-red-600',
                    event.type === 'keypress' && 'bg-blue-500/10 text-blue-600',
                  )}
                >
                  {event.type}
                </span>
                <code className="font-mono text-xs">{JSON.stringify(event.key)}</code>
                <code className="font-mono text-xs text-muted-foreground">{event.code}</code>
                <div className="flex gap-1 flex-1">
                  {event.modifiers.ctrl && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted">Ctrl</span>
                  )}
                  {event.modifiers.alt && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted">Alt</span>
                  )}
                  {event.modifiers.shift && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted">Shift</span>
                  )}
                  {event.modifiers.meta && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted">⌘</span>
                  )}
                  {event.repeat && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600">
                      repeat
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {formatTime(event.timestamp)}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function OptionsPanel({
  options,
  onChange,
  defaultOpen = true,
  isMobile = false,
}: {
  options: Options;
  onChange: (options: Options) => void;
  defaultOpen?: boolean;
  isMobile?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border rounded-lg overflow-hidden">
      <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2 bg-muted/50 hover:bg-muted/70 transition-colors">
        <span className="text-sm font-medium">Options</span>
        {open ? <ChevronUpIcon className="size-4" /> : <ChevronDownIcon className="size-4" />}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-4 space-y-3">
          <label
            className={cn(
              'flex items-center justify-between',
              isMobile && 'opacity-70 cursor-not-allowed',
            )}
          >
            <span className="text-sm text-muted-foreground">
              Show visual keyboard
              {isMobile && (
                <span className="block text-xs text-muted-foreground/80 mt-0.5">
                  Not available on mobile
                </span>
              )}
            </span>
            <Switch
              checked={options.showKeyboard}
              onCheckedChange={v => onChange({ ...options, showKeyboard: v })}
              disabled={isMobile}
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Capture keydown</span>
            <Switch
              checked={options.captureKeydown}
              onCheckedChange={v => onChange({ ...options, captureKeydown: v })}
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Capture keyup</span>
            <Switch
              checked={options.captureKeyup}
              onCheckedChange={v => onChange({ ...options, captureKeyup: v })}
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Capture keypress <span className="text-xs">(deprecated)</span>
            </span>
            <Switch
              checked={options.captureKeypress}
              onCheckedChange={v => onChange({ ...options, captureKeypress: v })}
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Prevent default</span>
            <Switch
              checked={options.preventDefault}
              onCheckedChange={v => onChange({ ...options, preventDefault: v })}
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Show deprecated props</span>
            <Switch
              checked={options.showDeprecated}
              onCheckedChange={v => onChange({ ...options, showDeprecated: v })}
            />
          </label>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function CodeSnippet({
  chord,
  onCopy,
  copied,
}: {
  chord: {
    keys: Set<string>;
    modifiers: KeyEvent['modifiers'];
    mainKeys: { key: string; code: string }[];
  } | null;
  onCopy: () => void;
  copied: boolean;
}) {
  const code = generateCodeSnippetFromChord(chord);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
        <span className="text-sm font-medium">Copy as Code</span>
        <Button variant="ghost" size="sm" onClick={onCopy} className="gap-1.5" disabled={!chord}>
          {copied ? (
            <>
              <CheckIcon className="size-3.5 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <CopyIcon className="size-3.5" />
              Copy
            </>
          )}
        </Button>
      </div>
      <pre className="p-4 text-sm font-mono overflow-x-auto bg-muted/20">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// Main component
const MOBILE_BREAKPOINT = 768;

function KeyboardPage() {
  const isMobile = useIsMobile();
  const isLikelyPhone = useIsLikelyPhone();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const setKeyCaptureInputRef = useCallback((el: HTMLInputElement | null) => {
    inputRef.current = el;
  }, []);
  const navigate = useNavigate({ from: '/inspect/keyboard' });
  const search = Route.useSearch();

  // Initialize options from search params (default showKeyboard off on mobile)
  const [options, setOptions] = useState<Options>(() => {
    const showKeyboardDefault =
      typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT
        ? false
        : DEFAULT_OPTIONS.showKeyboard;
    return {
      captureKeydown: search.keydown ?? DEFAULT_OPTIONS.captureKeydown,
      captureKeyup: search.keyup ?? DEFAULT_OPTIONS.captureKeyup,
      captureKeypress: search.keypress ?? DEFAULT_OPTIONS.captureKeypress,
      preventDefault: search.preventDefault ?? DEFAULT_OPTIONS.preventDefault,
      showDeprecated: search.deprecated ?? DEFAULT_OPTIONS.showDeprecated,
      showKeyboard: search.keyboard ?? showKeyboardDefault,
      historyLimit: DEFAULT_OPTIONS.historyLimit,
    };
  });

  // Update URL when options change
  const handleOptionsChange = (newOptions: Options) => {
    setOptions(newOptions);
    navigate({
      search: {
        keydown:
          newOptions.captureKeydown !== DEFAULT_OPTIONS.captureKeydown
            ? newOptions.captureKeydown
            : undefined,
        keyup:
          newOptions.captureKeyup !== DEFAULT_OPTIONS.captureKeyup
            ? newOptions.captureKeyup
            : undefined,
        keypress:
          newOptions.captureKeypress !== DEFAULT_OPTIONS.captureKeypress
            ? newOptions.captureKeypress
            : undefined,
        preventDefault:
          newOptions.preventDefault !== DEFAULT_OPTIONS.preventDefault
            ? newOptions.preventDefault
            : undefined,
        deprecated:
          newOptions.showDeprecated !== DEFAULT_OPTIONS.showDeprecated
            ? newOptions.showDeprecated
            : undefined,
        keyboard:
          newOptions.showKeyboard !== DEFAULT_OPTIONS.showKeyboard
            ? newOptions.showKeyboard
            : undefined,
      },
      replace: true,
    });
  };
  const [currentEvent, setCurrentEvent] = useState<KeyEvent | null>(null);
  const [lastChord, setLastChord] = useState<{
    keys: Set<string>;
    modifiers: KeyEvent['modifiers'];
    mainKeys: { key: string; code: string }[];
  } | null>(null);
  const [eventHistory, setEventHistory] = useState<KeyEvent[]>([]);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [maxSimultaneous, setMaxSimultaneous] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState('keyboard');
  const [currentModifiers, setCurrentModifiers] = useState<KeyEvent['modifiers']>({
    alt: false,
    ctrl: false,
    meta: false,
    shift: false,
  });

  const handleKeyEvent = useCallback(
    (e: KeyboardEvent, type: 'keydown' | 'keyup' | 'keypress') => {
      // On mobile, keep the capture input empty so we only show the key in KeyDisplay
      if (isMobile && inputRef.current && e.target === inputRef.current) {
        e.preventDefault();
      }

      // Check if we should capture this event type
      if (type === 'keydown' && !options.captureKeydown) return;
      if (type === 'keyup' && !options.captureKeyup) return;
      if (type === 'keypress' && !options.captureKeypress) return;

      if (options.preventDefault) {
        e.preventDefault();
      }

      const modifiers = {
        alt: e.altKey,
        ctrl: e.ctrlKey,
        meta: e.metaKey,
        shift: e.shiftKey,
      };

      setCurrentModifiers(modifiers);

      const keyEvent: KeyEvent = {
        id: crypto.randomUUID(),
        type,
        key: e.key,
        code: e.code,
        keyCode: e.keyCode,
        which: e.which,
        charCode: e.charCode,
        location: e.location,
        repeat: e.repeat,
        isComposing: e.isComposing,
        modifiers,
        timestamp: new Date(),
      };

      setCurrentEvent(keyEvent);

      // Update pressed keys
      if (type === 'keydown') {
        const isModifier =
          e.code.includes('Control') ||
          e.code.includes('Alt') ||
          e.code.includes('Shift') ||
          e.code.includes('Meta');

        // Check if there are any non-modifier keys currently pressed (before adding this one)
        const hasNonModifierKeysPressed = Array.from(pressedKeys).some(
          code =>
            !code.includes('Control') &&
            !code.includes('Alt') &&
            !code.includes('Shift') &&
            !code.includes('Meta'),
        );

        setPressedKeys(prev => {
          const next = new Set(prev);
          next.add(e.code);
          // Update max simultaneous
          if (next.size > maxSimultaneous) {
            setMaxSimultaneous(next.size);
          }
          return next;
        });

        // Capture the chord (full key combination) on keydown
        // Only capture if this is a non-modifier key
        if (!isModifier) {
          setLastChord(prev => {
            const newMainKey = { key: e.key, code: e.code };

            // Start fresh chord if:
            // 1. No previous chord
            // 2. No non-modifier keys were pressed (this is a new chord after releasing all keys)
            // 3. Modifiers changed
            const shouldStartFresh =
              !prev ||
              !hasNonModifierKeysPressed ||
              prev.modifiers.ctrl !== modifiers.ctrl ||
              prev.modifiers.alt !== modifiers.alt ||
              prev.modifiers.shift !== modifiers.shift ||
              prev.modifiers.meta !== modifiers.meta;

            if (shouldStartFresh) {
              return {
                keys: new Set([e.code]),
                modifiers,
                mainKeys: [newMainKey],
              };
            }

            // Add to existing chord if key not already present
            const existingCodes = prev.mainKeys.map(k => k.code);
            if (!existingCodes.includes(e.code)) {
              return {
                keys: new Set([...prev.keys, e.code]),
                modifiers,
                mainKeys: [...prev.mainKeys, newMainKey],
              };
            }
            return prev;
          });
        }
      } else if (type === 'keyup') {
        setPressedKeys(prev => {
          const next = new Set(prev);
          next.delete(e.code);
          return next;
        });
      }

      // Add to history
      setEventHistory(prev => {
        const newHistory = [keyEvent, ...prev];
        return newHistory.slice(0, options.historyLimit);
      });
    },
    [options, maxSimultaneous, pressedKeys, isMobile],
  );

  // Android (and some mobile browsers) often don't fire keydown/keyup for the virtual
  // keyboard; they use input events instead. Handled via onMobileInput on the input (no effect).
  const handleMobileInput = useCallback(
    (data: string) => {
      const modifiers = {
        alt: false,
        ctrl: false,
        meta: false,
        shift: false,
      };
      setCurrentModifiers(modifiers);

      const chars = [...data];
      const lastChar = chars[chars.length - 1] ?? data;
      const keyEvent: KeyEvent = {
        id: crypto.randomUUID(),
        type: 'keydown',
        key: lastChar,
        code: 'FromInputEvent',
        keyCode: lastChar.charCodeAt(0),
        which: lastChar.charCodeAt(0),
        charCode: lastChar.charCodeAt(0),
        location: 0,
        repeat: false,
        isComposing: false,
        modifiers,
        timestamp: new Date(),
      };
      setCurrentEvent(keyEvent);
      setPressedKeys(new Set());
      setLastChord({
        keys: new Set(['FromInputEvent']),
        modifiers,
        mainKeys: [{ key: lastChar, code: 'FromInputEvent' }],
      });
      setEventHistory(prev => {
        const newHistory = [keyEvent, ...prev];
        return newHistory.slice(0, options.historyLimit);
      });
    },
    [options.historyLimit],
  );

  useEffect(() => {
    const target = isMobile ? inputRef.current : containerRef.current;
    if (!target) return;

    const handleKeyDown = (e: KeyboardEvent) => handleKeyEvent(e, 'keydown');
    const handleKeyUp = (e: KeyboardEvent) => handleKeyEvent(e, 'keyup');
    const handleKeyPress = (e: KeyboardEvent) => handleKeyEvent(e, 'keypress');

    // Clear pressed keys when window loses focus
    const handleBlur = () => {
      setPressedKeys(new Set());
      setCurrentModifiers({ alt: false, ctrl: false, meta: false, shift: false });
    };

    target.addEventListener('keydown', handleKeyDown);
    target.addEventListener('keyup', handleKeyUp);
    target.addEventListener('keypress', handleKeyPress);
    window.addEventListener('blur', handleBlur);

    return () => {
      target.removeEventListener('keydown', handleKeyDown);
      target.removeEventListener('keyup', handleKeyUp);
      target.removeEventListener('keypress', handleKeyPress);
      window.removeEventListener('blur', handleBlur);
    };
  }, [handleKeyEvent, isMobile]);

  useEffect(() => {
    const target = isMobile ? inputRef.current : containerRef.current;
    if (!target) return;
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => target.focus());
    } else {
      setTimeout(() => target.focus(), 0);
    }
  }, [isMobile]);

  const handleCopyField = async (value: string, field: string) => {
    await navigator.clipboard.writeText(value.replace(/^"|"$/g, ''));
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCopyCode = async () => {
    const code = generateCodeSnippetFromChord(lastChord);
    await navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyJSON = async () => {
    if (!currentEvent) return;
    await navigator.clipboard.writeText(JSON.stringify(currentEvent, null, 2));
    setCopiedField('json');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleClearHistory = () => {
    setEventHistory([]);
    setMaxSimultaneous(pressedKeys.size);
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <div ref={containerRef} tabIndex={0} className="h-full flex flex-col outline-none">
        {isLikelyPhone && (
          <div className="shrink-0 flex items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 text-sm text-amber-800 dark:text-amber-200 mb-4">
            <Smartphone className="size-4 shrink-0" />
            <span>
              Key capture does not work in phone browsers yet. Use a desktop or tablet for full
              functionality.
            </span>
          </div>
        )}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="keyboard">Keyboard</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
          </TabsList>

          <TabsContent
            value="keyboard"
            forceMount
            className="flex-1 space-y-4 pt-4 overflow-auto data-[hidden]:hidden"
          >
            <KeyDisplay
              currentKey={currentEvent}
              pressedKeys={pressedKeys}
              useInputCapture={true}
              keyCaptureInputRef={setKeyCaptureInputRef}
              onMobileInput={handleMobileInput}
            />
            <ModifierBadges modifiers={currentEvent?.modifiers ?? null} />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Current chord:{' '}
                <span className="font-mono font-medium text-foreground">
                  {generateChordString(pressedKeys, currentModifiers)}
                </span>
              </p>
            </div>
            {options.showKeyboard && !isMobile && <VisualKeyboard pressedKeys={pressedKeys} />}
          </TabsContent>

          <TabsContent value="details" className="flex-1 space-y-4 pt-4 overflow-auto">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyJSON}
                disabled={!currentEvent}
                className="flex-1"
              >
                {copiedField === 'json' ? 'Copied!' : 'Copy as JSON'}
              </Button>
            </div>
            <CodeSnippet chord={lastChord} onCopy={handleCopyCode} copied={copiedCode} />
            <EventProperties
              event={currentEvent}
              showDeprecated={options.showDeprecated}
              onCopy={handleCopyField}
              copiedField={copiedField}
            />
            <EventHistory
              events={eventHistory}
              onClear={handleClearHistory}
              maxSimultaneous={maxSimultaneous}
            />
          </TabsContent>

          <TabsContent value="options" className="flex-1 pt-4 overflow-auto">
            <OptionsPanel options={options} onChange={handleOptionsChange} isMobile={true} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="h-full flex gap-6 outline-none focus:ring-2 focus:ring-primary/20 rounded-lg p-1 -m-1"
    >
      {/* Left Column - Main Display */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        <KeyDisplay currentKey={currentEvent} pressedKeys={pressedKeys} />
        <ModifierBadges modifiers={currentEvent?.modifiers ?? null} />
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Current chord:{' '}
            <span className="font-mono font-medium text-foreground">
              {generateChordString(pressedKeys, currentModifiers)}
            </span>
          </p>
        </div>
        {options.showKeyboard && !isMobile && (
          <>
            <VisualKeyboard pressedKeys={pressedKeys} />
            <div className="flex-1" /> {/* Spacer to push event history to bottom */}
          </>
        )}
        <EventHistory
          events={eventHistory}
          onClear={handleClearHistory}
          maxSimultaneous={maxSimultaneous}
        />
      </div>

      {/* Right Column - Options & Details */}
      <div className="w-[320px] shrink-0 flex flex-col gap-4">
        <OptionsPanel options={options} onChange={handleOptionsChange} isMobile={false} />
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyJSON}
            disabled={!currentEvent}
            className="flex-1"
          >
            {copiedField === 'json' ? 'Copied!' : 'Copy as JSON'}
          </Button>
        </div>
        <CodeSnippet chord={lastChord} onCopy={handleCopyCode} copied={copiedCode} />
        <EventProperties
          event={currentEvent}
          showDeprecated={options.showDeprecated}
          onCopy={handleCopyField}
          copiedField={copiedField}
        />
      </div>
    </div>
  );
}

// Route export
export const Route = createFileRoute('/inspect/keyboard')({
  component: KeyboardPage,
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    keydown: typeof search.keydown === 'boolean' ? search.keydown : undefined,
    keyup: typeof search.keyup === 'boolean' ? search.keyup : undefined,
    keypress: typeof search.keypress === 'boolean' ? search.keypress : undefined,
    preventDefault: typeof search.preventDefault === 'boolean' ? search.preventDefault : undefined,
    deprecated: typeof search.deprecated === 'boolean' ? search.deprecated : undefined,
    keyboard: typeof search.keyboard === 'boolean' ? search.keyboard : undefined,
  }),
});
