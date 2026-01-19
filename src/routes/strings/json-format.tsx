import { useState, useMemo, useCallback } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CopyIcon,
  CheckIcon,
  DownloadIcon,
  XIcon,
  ChevronsDownUpIcon,
  ChevronsUpDownIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

// Types
type Spacing = '2' | '4' | 'tab';

interface InputSectionProps {
  charCount: number;
  error: string | null;
  inputJson: string;
  lineCount: number;
  onClear: () => void;
  onInputChange: (value: string) => void;
  onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
}

interface JsonNodeProps {
  collapsedPaths: Set<string>;
  depth: number;
  hoveredBracket: string | null;
  isLast: boolean;
  lineNumbers: Map<string, number>;
  onClickPath: (path: string) => void;
  onHoverBracket: (path: string | null) => void;
  onHoverPath: (path: string | null) => void;
  onSelectBracket: (path: string | null) => void;
  onToggleCollapse: (path: string) => void;
  path: string;
  selectedBracket: string | null;
  showLines: boolean;
  value: unknown;
  wrap: boolean;
}

interface JsonTreeProps {
  collapsedPaths: Set<string>;
  data: unknown;
  hoveredBracket: string | null;
  onClickPath: (path: string) => void;
  onHoverBracket: (path: string | null) => void;
  onHoverPath: (path: string | null) => void;
  onSelectBracket: (path: string | null) => void;
  onToggleCollapse: (path: string) => void;
  selectedBracket: string | null;
  showLines: boolean;
  wrap: boolean;
}

interface JsonValueProps {
  onClickPath: (path: string) => void;
  onHoverPath: (path: string | null) => void;
  path: string;
  value: unknown;
}

interface LineNumberProps {
  num: number;
  show: boolean;
}

interface OptionsPanelProps {
  autofmt: boolean;
  escape: boolean;
  isMobile: boolean;
  lines: boolean;
  minify: boolean;
  onAutofmtChange: (v: boolean) => void;
  onEscapeChange: (v: boolean) => void;
  onLinesChange: (v: boolean) => void;
  onMinifyChange: (v: boolean) => void;
  onSortChange: (v: boolean) => void;
  onSpacingChange: (v: Spacing) => void;
  onStripNullChange: (v: boolean) => void;
  onWrapChange: (v: boolean) => void;
  sort: boolean;
  spacing: Spacing;
  stripNull: boolean;
  wrap: boolean;
}

interface OutputSectionProps {
  collapsedPaths: Set<string>;
  copied: boolean;
  error: string | null;
  formattedString: string;
  hoveredBracket: string | null;
  hoveredPath: string | null;
  lines: boolean;
  minify: boolean;
  onClickPath: (path: string) => void;
  onCollapseAll: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onExpandAll: () => void;
  onHoverBracket: (path: string | null) => void;
  onHoverPath: (path: string | null) => void;
  onSelectBracket: (path: string | null) => void;
  onToggleCollapse: (path: string) => void;
  selectedBracket: string | null;
  transformed: unknown;
  wrap: boolean;
}

interface ToggleOptionProps {
  checked: boolean;
  disabled?: boolean;
  id: string;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}

interface SearchParams {
  autofmt?: boolean;
  escape?: boolean;
  lines?: boolean;
  minify?: boolean;
  sort?: boolean;
  spacing?: Spacing;
  stripNull?: boolean;
  wrap?: boolean;
}

// Constants
const BRACKET_COLORS = ['text-yellow-400', 'text-fuchsia-400', 'text-sky-400'] as const;

const BRACKET_LINE_COLORS = ['bg-yellow-400/30', 'bg-fuchsia-400/30', 'bg-sky-400/30'] as const;

const VALUE_COLORS = {
  string: 'text-green-600 dark:text-green-400',
  number: 'text-orange-500 dark:text-orange-400',
  boolean: 'text-violet-500 dark:text-violet-400',
  null: 'text-red-500 dark:text-red-400',
  key: 'text-blue-400 dark:text-blue-300',
  punctuation: 'text-muted-foreground',
} as const;

// Helper functions
function getBracketColor(depth: number): string {
  return BRACKET_COLORS[depth % BRACKET_COLORS.length];
}

function getBracketLineColor(depth: number): string {
  return BRACKET_LINE_COLORS[depth % BRACKET_LINE_COLORS.length];
}

// Get the parent bracket path from a child path
// e.g., "$.user.name" -> "$.user", "$[0].id" -> "$[0]", "$.items[2]" -> "$.items"
function getParentPath(path: string): string | null {
  if (path === '$') return null;

  // Handle array index: $.items[0] -> $.items
  const arrayMatch = path.match(/^(.+)\[\d+\]$/);
  if (arrayMatch) return arrayMatch[1];

  // Handle object key: $.user.name -> $.user
  const lastDot = path.lastIndexOf('.');
  if (lastDot > 0) return path.substring(0, lastDot);

  return '$';
}

function sortKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortKeys);
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj)
      .sort((a, b) => a.localeCompare(b))
      .reduce(
        (acc, key) => {
          acc[key] = sortKeys((obj as Record<string, unknown>)[key]);
          return acc;
        },
        {} as Record<string, unknown>,
      );
  }
  return obj;
}

function stripNulls(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(stripNulls).filter(v => v !== null);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj).reduce(
      (acc, [key, value]) => {
        if (value !== null) {
          acc[key] = stripNulls(value);
        }
        return acc;
      },
      {} as Record<string, unknown>,
    );
  }
  return obj;
}

function escapeStrings(obj: unknown): unknown {
  if (typeof obj === 'string') {
    // Convert special characters to visible escape sequences
    return obj
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }
  if (Array.isArray(obj)) return obj.map(escapeStrings);
  if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj).reduce(
      (acc, [key, value]) => {
        acc[key] = escapeStrings(value);
        return acc;
      },
      {} as Record<string, unknown>,
    );
  }
  return obj;
}

function getCollapsiblePaths(obj: unknown, prefix = '$'): string[] {
  const paths: string[] = [];
  if (Array.isArray(obj) && obj.length > 0) {
    paths.push(prefix);
    obj.forEach((item, index) => {
      paths.push(...getCollapsiblePaths(item, `${prefix}[${index}]`));
    });
  } else if (obj !== null && typeof obj === 'object' && Object.keys(obj).length > 0) {
    paths.push(prefix);
    Object.entries(obj).forEach(([key, value]) => {
      paths.push(...getCollapsiblePaths(value, `${prefix}.${key}`));
    });
  }
  return paths;
}

// Pre-compute line numbers for each path (uses :close suffix for closing brackets)
function computeLineNumbers(
  obj: unknown,
  collapsedPaths: Set<string>,
  prefix = '$',
): Map<string, number> {
  const lineNumbers = new Map<string, number>();
  let lineNum = 1;

  function traverse(value: unknown, path: string): void {
    lineNumbers.set(path, lineNum);

    if (value === null || typeof value !== 'object') {
      lineNum++;
      return;
    }

    if (Array.isArray(value)) {
      if (value.length === 0 || collapsedPaths.has(path)) {
        lineNum++;
        return;
      }
      lineNum++; // Opening bracket line
      value.forEach((item, index) => {
        traverse(item, `${path}[${index}]`);
      });
      lineNumbers.set(`${path}:close`, lineNum);
      lineNum++; // Closing bracket line
      return;
    }

    const entries = Object.entries(value);
    if (entries.length === 0 || collapsedPaths.has(path)) {
      lineNum++;
      return;
    }
    lineNum++; // Opening bracket line
    entries.forEach(([key, val]) => {
      const childPath = `${path}.${key}`;
      const isChildPrimitive = val === null || typeof val !== 'object';
      const isChildEmpty =
        (Array.isArray(val) && val.length === 0) ||
        (val !== null && typeof val === 'object' && Object.keys(val).length === 0);

      if (isChildPrimitive || isChildEmpty || collapsedPaths.has(childPath)) {
        lineNumbers.set(childPath, lineNum);
        lineNum++;
      } else {
        lineNumbers.set(childPath, lineNum);
        lineNum++; // Key + opening bracket line
        if (Array.isArray(val)) {
          val.forEach((item, index) => {
            traverse(item, `${childPath}[${index}]`);
          });
        } else {
          Object.entries(val).forEach(([childKey, childVal]) => {
            traverse(childVal, `${childPath}.${childKey}`);
          });
        }
        lineNumbers.set(`${childPath}:close`, lineNum);
        lineNum++; // Closing bracket line
      }
    });
    lineNumbers.set(`${path}:close`, lineNum);
    lineNum++; // Closing bracket line
  }

  traverse(obj, prefix);
  return lineNumbers;
}

// Subcomponents
function ToggleOption({ checked, disabled, id, label, onCheckedChange }: ToggleOptionProps) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
      <label
        htmlFor={id}
        className={cn(
          'text-sm cursor-pointer select-none',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        {label}
      </label>
    </div>
  );
}

function OptionsPanel({
  autofmt,
  escape,
  isMobile,
  lines,
  minify,
  onAutofmtChange,
  onEscapeChange,
  onLinesChange,
  onMinifyChange,
  onSortChange,
  onSpacingChange,
  onStripNullChange,
  onWrapChange,
  sort,
  spacing,
  stripNull,
  wrap,
}: OptionsPanelProps) {
  const content = (
    <div className={cn('space-y-4', !isMobile && 'flex gap-8 space-y-0')}>
      {/* Display Options */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Display
        </h3>
        <div className="space-y-2.5">
          <ToggleOption id="wrap" label="Word Wrap" checked={wrap} onCheckedChange={onWrapChange} />
          <ToggleOption
            id="lines"
            label="Line Numbers"
            checked={lines}
            onCheckedChange={onLinesChange}
          />
          <ToggleOption
            id="minify"
            label="Minify"
            checked={minify}
            onCheckedChange={onMinifyChange}
          />
          <ToggleOption
            id="autofmt"
            label="Auto-format on paste"
            checked={autofmt}
            onCheckedChange={onAutofmtChange}
          />
        </div>
      </div>

      {/* Spacing */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Spacing
        </h3>
        <Select
          value={spacing}
          onValueChange={v => onSpacingChange(v as Spacing)}
          disabled={minify}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 spaces</SelectItem>
            <SelectItem value="4">4 spaces</SelectItem>
            <SelectItem value="tab">Tab</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transform Options */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Transform
        </h3>
        <div className="space-y-2.5">
          <ToggleOption id="sort" label="Sort keys" checked={sort} onCheckedChange={onSortChange} />
          <ToggleOption
            id="stripNull"
            label="Remove nulls"
            checked={stripNull}
            onCheckedChange={onStripNullChange}
          />
          <ToggleOption
            id="escape"
            label="Escape strings"
            checked={escape}
            onCheckedChange={onEscapeChange}
          />
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Collapsible defaultOpen={false}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
          Options
          <ChevronDownIcon className="size-4 transition-transform [[data-state=open]>&]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 pb-1">{content}</CollapsibleContent>
      </Collapsible>
    );
  }

  return <div className="border rounded-lg p-4">{content}</div>;
}

function LineNumber({ num, show }: LineNumberProps) {
  if (!show) return null;
  return (
    <span className="select-none text-muted-foreground/50 w-8 inline-block text-right mr-4 text-xs">
      {num}
    </span>
  );
}

function JsonValue({ onClickPath, onHoverPath, path, value }: JsonValueProps) {
  const type = value === null ? 'null' : typeof value;

  let display: string;
  let colorClass: string;

  switch (type) {
    case 'string':
      display = `"${value}"`;
      colorClass = VALUE_COLORS.string;
      break;
    case 'number':
      display = String(value);
      colorClass = VALUE_COLORS.number;
      break;
    case 'boolean':
      display = String(value);
      colorClass = VALUE_COLORS.boolean;
      break;
    case 'null':
      display = 'null';
      colorClass = VALUE_COLORS.null;
      break;
    default:
      display = String(value);
      colorClass = '';
  }

  return (
    <span
      className={cn(colorClass, 'cursor-pointer')}
      onMouseEnter={() => onHoverPath(path)}
      onMouseLeave={() => onHoverPath(null)}
      onClick={() => onClickPath(path)}
    >
      {display}
    </span>
  );
}

function JsonNode({
  collapsedPaths,
  depth,
  hoveredBracket,
  isLast,
  lineNumbers,
  onClickPath,
  onHoverBracket,
  onHoverPath,
  onSelectBracket,
  onToggleCollapse,
  path,
  selectedBracket,
  showLines,
  value,
  wrap,
}: JsonNodeProps) {
  const isCollapsed = collapsedPaths.has(path);
  const bracketColor = getBracketColor(depth);
  const bracketLineColor = getBracketLineColor(depth);
  const indent = '  '.repeat(depth);
  const childIndent = '  '.repeat(depth + 1);

  const lineNum = lineNumbers.get(path) ?? 0;

  // Check if this bracket should show a vertical line
  const isHighlighted = hoveredBracket === path || selectedBracket === path;

  // Primitive values
  if (value === null || typeof value !== 'object') {
    return (
      <div className={cn(!wrap && 'whitespace-pre')}>
        <LineNumber num={lineNum} show={showLines} />
        <span>{indent}</span>
        <JsonValue value={value} onHoverPath={onHoverPath} onClickPath={onClickPath} path={path} />
        {!isLast && <span className={VALUE_COLORS.punctuation}>,</span>}
      </div>
    );
  }

  // Arrays
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <div className={cn(!wrap && 'whitespace-pre')}>
          <LineNumber num={lineNum} show={showLines} />
          <span>{indent}</span>
          <span
            className={cn(bracketColor, 'cursor-pointer')}
            onMouseEnter={() => onHoverBracket(path)}
            onMouseLeave={() => onHoverBracket(null)}
            onClick={() => onSelectBracket(selectedBracket === path ? null : path)}
          >
            []
          </span>
          {!isLast && <span className={VALUE_COLORS.punctuation}>,</span>}
        </div>
      );
    }

    if (isCollapsed) {
      return (
        <div className={cn(!wrap && 'whitespace-pre')}>
          <LineNumber num={lineNum} show={showLines} />
          <span>{indent}</span>
          <button
            onClick={() => onToggleCollapse(path)}
            onMouseEnter={() => onHoverBracket(path)}
            onMouseLeave={() => onHoverBracket(null)}
            className="inline-flex items-center hover:bg-muted rounded px-0.5 -mx-0.5"
          >
            <ChevronRightIcon className="size-3 text-muted-foreground" />
            <span className={bracketColor}>[</span>
            <span className="text-muted-foreground text-xs mx-1">{value.length} items</span>
            <span className={bracketColor}>]</span>
          </button>
          {!isLast && <span className={VALUE_COLORS.punctuation}>,</span>}
        </div>
      );
    }

    return (
      <div>
        <div className={cn(!wrap && 'whitespace-pre')}>
          <LineNumber num={lineNum} show={showLines} />
          <span>{indent}</span>
          <button
            onClick={() => {
              onToggleCollapse(path);
              onSelectBracket(null);
            }}
            onMouseEnter={() => onHoverBracket(path)}
            onMouseLeave={() => onHoverBracket(null)}
            className="inline-flex items-center hover:bg-muted rounded px-0.5 -mx-0.5"
          >
            <ChevronDownIcon className="size-3 text-muted-foreground" />
            <span className={bracketColor}>[</span>
          </button>
        </div>
        <div className="relative">
          {isHighlighted && (
            <div
              className={cn('absolute w-0.5 top-0 bottom-0', bracketLineColor)}
              style={{ left: `${depth * 2 + 1}ch` }}
              onClick={() => onSelectBracket(selectedBracket === path ? null : path)}
            />
          )}
          {value.map((item, index) => (
            <JsonNode
              key={index}
              value={item}
              path={`${path}[${index}]`}
              depth={depth + 1}
              isLast={index === value.length - 1}
              showLines={showLines}
              lineNumbers={lineNumbers}
              collapsedPaths={collapsedPaths}
              onToggleCollapse={onToggleCollapse}
              onHoverPath={onHoverPath}
              onClickPath={onClickPath}
              hoveredBracket={hoveredBracket}
              selectedBracket={selectedBracket}
              onHoverBracket={onHoverBracket}
              onSelectBracket={onSelectBracket}
              wrap={wrap}
            />
          ))}
        </div>
        <div className={cn(!wrap && 'whitespace-pre')}>
          <LineNumber num={lineNumbers.get(`${path}:close`) ?? 0} show={showLines} />
          <span>{indent}</span>
          <span
            className={bracketColor}
            onMouseEnter={() => onHoverBracket(path)}
            onMouseLeave={() => onHoverBracket(null)}
            onClick={() => onSelectBracket(selectedBracket === path ? null : path)}
            style={{ cursor: 'pointer' }}
          >
            ]
          </span>
          {!isLast && <span className={VALUE_COLORS.punctuation}>,</span>}
        </div>
      </div>
    );
  }

  // Objects
  const entries = Object.entries(value);

  if (entries.length === 0) {
    return (
      <div className={cn(!wrap && 'whitespace-pre')}>
        <LineNumber num={lineNum} show={showLines} />
        <span>{indent}</span>
        <span
          className={cn(bracketColor, 'cursor-pointer')}
          onMouseEnter={() => onHoverBracket(path)}
          onMouseLeave={() => onHoverBracket(null)}
          onClick={() => onSelectBracket(selectedBracket === path ? null : path)}
        >
          {'{}'}
        </span>
        {!isLast && <span className={VALUE_COLORS.punctuation}>,</span>}
      </div>
    );
  }

  if (isCollapsed) {
    return (
      <div className={cn(!wrap && 'whitespace-pre')}>
        <LineNumber num={lineNum} show={showLines} />
        <span>{indent}</span>
        <button
          onClick={() => onToggleCollapse(path)}
          onMouseEnter={() => onHoverBracket(path)}
          onMouseLeave={() => onHoverBracket(null)}
          className="inline-flex items-center hover:bg-muted rounded px-0.5 -mx-0.5"
        >
          <ChevronRightIcon className="size-3 text-muted-foreground" />
          <span className={bracketColor}>{'{'}</span>
          <span className="text-muted-foreground text-xs mx-1">
            {entries.length} {entries.length === 1 ? 'key' : 'keys'}
          </span>
          <span className={bracketColor}>{'}'}</span>
        </button>
        {!isLast && <span className={VALUE_COLORS.punctuation}>,</span>}
      </div>
    );
  }
  return (
    <div>
      <div className={cn(!wrap && 'whitespace-pre')}>
        <LineNumber num={lineNum} show={showLines} />
        <span>{indent}</span>
        <button
          onClick={() => {
            onToggleCollapse(path);
            onSelectBracket(null);
          }}
          onMouseEnter={() => onHoverBracket(path)}
          onMouseLeave={() => onHoverBracket(null)}
          className="inline-flex items-center hover:bg-muted rounded px-0.5 -mx-0.5"
        >
          <ChevronDownIcon className="size-3 text-muted-foreground" />
          <span className={bracketColor}>{'{'}</span>
        </button>
      </div>
      <div className="relative">
        {isHighlighted && (
          <div
            className={cn('absolute w-0.5 top-0 bottom-0', bracketLineColor)}
            style={{ left: `${depth * 2 + 1}ch` }}
            onClick={() => onSelectBracket(selectedBracket === path ? null : path)}
          />
        )}
        {entries.map(([key, val], index) => {
          const childPath = `${path}.${key}`;
          const isChildLast = index === entries.length - 1;
          const isChildPrimitive = val === null || typeof val !== 'object';
          const isChildEmpty =
            (Array.isArray(val) && val.length === 0) ||
            (val !== null && typeof val === 'object' && Object.keys(val).length === 0);
          const childLineNum = lineNumbers.get(childPath) ?? 0;

          if (isChildPrimitive || isChildEmpty) {
            return (
              <div key={key} className={cn(!wrap && 'whitespace-pre')}>
                <LineNumber num={childLineNum} show={showLines} />
                <span>{childIndent}</span>
                <span
                  className={cn(VALUE_COLORS.key, 'cursor-pointer')}
                  onMouseEnter={() => onHoverPath(childPath)}
                  onMouseLeave={() => onHoverPath(null)}
                  onClick={() => onClickPath(childPath)}
                >
                  "{key}"
                </span>
                <span className={VALUE_COLORS.punctuation}>: </span>
                {isChildEmpty ? (
                  <span className={getBracketColor(depth + 1)}>
                    {Array.isArray(val) ? '[]' : '{}'}
                  </span>
                ) : (
                  <JsonValue
                    value={val}
                    onHoverPath={onHoverPath}
                    onClickPath={onClickPath}
                    path={childPath}
                  />
                )}
                {!isChildLast && <span className={VALUE_COLORS.punctuation}>,</span>}
              </div>
            );
          }

          // Complex child (object or array with content)
          const childBracketColor = getBracketColor(depth + 1);
          const isArray = Array.isArray(val);
          const isChildCollapsed = collapsedPaths.has(childPath);
          const childCount = isArray ? val.length : Object.keys(val).length;

          if (isChildCollapsed) {
            return (
              <div key={key} className={cn(!wrap && 'whitespace-pre')}>
                <LineNumber num={childLineNum} show={showLines} />
                <span>{childIndent}</span>
                <span
                  className={cn(VALUE_COLORS.key, 'cursor-pointer')}
                  onMouseEnter={() => onHoverPath(childPath)}
                  onMouseLeave={() => onHoverPath(null)}
                  onClick={() => onClickPath(childPath)}
                >
                  "{key}"
                </span>
                <span className={VALUE_COLORS.punctuation}>: </span>
                <button
                  onClick={() => onToggleCollapse(childPath)}
                  onMouseEnter={() => onHoverBracket(childPath)}
                  onMouseLeave={() => onHoverBracket(null)}
                  className="inline-flex items-center hover:bg-muted rounded px-0.5 -mx-0.5"
                >
                  <ChevronRightIcon className="size-3 text-muted-foreground" />
                  <span className={childBracketColor}>{isArray ? '[' : '{'}</span>
                  <span className="text-muted-foreground text-xs mx-1">
                    {childCount} {isArray ? 'items' : childCount === 1 ? 'key' : 'keys'}
                  </span>
                  <span className={childBracketColor}>{isArray ? ']' : '}'}</span>
                </button>
                {!isChildLast && <span className={VALUE_COLORS.punctuation}>,</span>}
              </div>
            );
          }

          // Expanded complex child
          return (
            <div key={key}>
              <div className={cn(!wrap && 'whitespace-pre')}>
                <LineNumber num={childLineNum} show={showLines} />
                <span>{childIndent}</span>
                <span
                  className={cn(VALUE_COLORS.key, 'cursor-pointer')}
                  onMouseEnter={() => onHoverPath(childPath)}
                  onMouseLeave={() => onHoverPath(null)}
                  onClick={() => onClickPath(childPath)}
                >
                  "{key}"
                </span>
                <span className={VALUE_COLORS.punctuation}>: </span>
                <button
                  onClick={() => {
                    onToggleCollapse(childPath);
                    onSelectBracket(null);
                  }}
                  onMouseEnter={() => onHoverBracket(childPath)}
                  onMouseLeave={() => onHoverBracket(null)}
                  className="inline-flex items-center hover:bg-muted rounded px-0.5 -mx-0.5"
                >
                  <ChevronDownIcon className="size-3 text-muted-foreground" />
                  <span className={childBracketColor}>{isArray ? '[' : '{'}</span>
                </button>
              </div>
              <div className="relative">
                {(hoveredBracket === childPath || selectedBracket === childPath) && (
                  <div
                    className={cn('absolute w-0.5 top-0 bottom-0', getBracketLineColor(depth + 1))}
                    style={{ left: `${(depth + 1) * 2 + 1}ch` }}
                    onClick={() =>
                      onSelectBracket(selectedBracket === childPath ? null : childPath)
                    }
                  />
                )}
                {isArray
                  ? (val as unknown[]).map((item, idx) => (
                      <JsonNode
                        key={idx}
                        value={item}
                        path={`${childPath}[${idx}]`}
                        depth={depth + 2}
                        isLast={idx === (val as unknown[]).length - 1}
                        showLines={showLines}
                        lineNumbers={lineNumbers}
                        collapsedPaths={collapsedPaths}
                        onToggleCollapse={onToggleCollapse}
                        onHoverPath={onHoverPath}
                        onClickPath={onClickPath}
                        hoveredBracket={hoveredBracket}
                        selectedBracket={selectedBracket}
                        onHoverBracket={onHoverBracket}
                        onSelectBracket={onSelectBracket}
                        wrap={wrap}
                      />
                    ))
                  : Object.entries(val as Record<string, unknown>).map(
                      ([childKey, childVal], idx, arr) => {
                        const grandchildPath = `${childPath}.${childKey}`;
                        const isGrandchildPrimitive =
                          childVal === null || typeof childVal !== 'object';
                        const isGrandchildEmpty =
                          (Array.isArray(childVal) && childVal.length === 0) ||
                          (childVal !== null &&
                            typeof childVal === 'object' &&
                            Object.keys(childVal).length === 0);

                        if (isGrandchildPrimitive || isGrandchildEmpty) {
                          return (
                            <div key={childKey} className={cn(!wrap && 'whitespace-pre')}>
                              <LineNumber
                                num={lineNumbers.get(grandchildPath) ?? 0}
                                show={showLines}
                              />
                              <span>{'  '.repeat(depth + 2)}</span>
                              <span
                                className={cn(VALUE_COLORS.key, 'cursor-pointer')}
                                onMouseEnter={() => onHoverPath(grandchildPath)}
                                onMouseLeave={() => onHoverPath(null)}
                                onClick={() => onClickPath(grandchildPath)}
                              >
                                "{childKey}"
                              </span>
                              <span className={VALUE_COLORS.punctuation}>: </span>
                              {isGrandchildEmpty ? (
                                <span className={getBracketColor(depth + 2)}>
                                  {Array.isArray(childVal) ? '[]' : '{}'}
                                </span>
                              ) : (
                                <JsonValue
                                  value={childVal}
                                  onHoverPath={onHoverPath}
                                  onClickPath={onClickPath}
                                  path={grandchildPath}
                                />
                              )}
                              {idx !== arr.length - 1 && (
                                <span className={VALUE_COLORS.punctuation}>,</span>
                              )}
                            </div>
                          );
                        }

                        return (
                          <JsonNode
                            key={childKey}
                            value={{ [childKey]: childVal }}
                            path={childPath}
                            depth={depth + 1}
                            isLast={idx === arr.length - 1}
                            showLines={showLines}
                            lineNumbers={lineNumbers}
                            collapsedPaths={collapsedPaths}
                            onToggleCollapse={onToggleCollapse}
                            onHoverPath={onHoverPath}
                            onClickPath={onClickPath}
                            hoveredBracket={hoveredBracket}
                            selectedBracket={selectedBracket}
                            onHoverBracket={onHoverBracket}
                            onSelectBracket={onSelectBracket}
                            wrap={wrap}
                          />
                        );
                      },
                    )}
              </div>
              <div className={cn(!wrap && 'whitespace-pre')}>
                <LineNumber num={lineNumbers.get(`${childPath}:close`) ?? 0} show={showLines} />
                <span>{childIndent}</span>
                <span
                  className={cn(childBracketColor, 'cursor-pointer')}
                  onMouseEnter={() => onHoverBracket(childPath)}
                  onMouseLeave={() => onHoverBracket(null)}
                  onClick={() => onSelectBracket(selectedBracket === childPath ? null : childPath)}
                >
                  {isArray ? ']' : '}'}
                </span>
                {!isChildLast && <span className={VALUE_COLORS.punctuation}>,</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div className={cn(!wrap && 'whitespace-pre')}>
        <LineNumber num={lineNumbers.get(`${path}:close`) ?? 0} show={showLines} />
        <span>{indent}</span>
        <span
          className={bracketColor}
          onMouseEnter={() => onHoverBracket(path)}
          onMouseLeave={() => onHoverBracket(null)}
          onClick={() => onSelectBracket(selectedBracket === path ? null : path)}
          style={{ cursor: 'pointer' }}
        >
          {'}'}
        </span>
        {!isLast && <span className={VALUE_COLORS.punctuation}>,</span>}
      </div>
    </div>
  );
}

function JsonTree({
  collapsedPaths,
  data,
  hoveredBracket,
  onClickPath,
  onHoverBracket,
  onHoverPath,
  onSelectBracket,
  onToggleCollapse,
  selectedBracket,
  showLines,
  wrap,
}: JsonTreeProps) {
  const lineNumbers = useMemo(
    () => computeLineNumbers(data, collapsedPaths),
    [data, collapsedPaths],
  );

  return (
    <div className="font-mono text-sm">
      <JsonNode
        value={data}
        path="$"
        depth={0}
        isLast={true}
        showLines={showLines}
        lineNumbers={lineNumbers}
        collapsedPaths={collapsedPaths}
        onToggleCollapse={onToggleCollapse}
        onHoverPath={onHoverPath}
        onClickPath={onClickPath}
        hoveredBracket={hoveredBracket}
        selectedBracket={selectedBracket}
        onHoverBracket={onHoverBracket}
        onSelectBracket={onSelectBracket}
        wrap={wrap}
      />
    </div>
  );
}

function InputSection({
  charCount,
  error,
  inputJson,
  lineCount,
  onClear,
  onInputChange,
  onPaste,
}: InputSectionProps) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between mb-2 shrink-0">
        <label className="text-sm font-medium">Input</label>
        <Button variant="ghost" size="icon-sm" onClick={onClear} disabled={!inputJson}>
          <XIcon className="size-4" />
        </Button>
      </div>
      <div className="flex-1 min-h-0">
        <Textarea
          value={inputJson}
          onChange={e => onInputChange(e.target.value)}
          onPaste={onPaste}
          placeholder="Paste your JSON here..."
          className="h-full min-h-[200px] font-mono text-sm resize-none"
        />
      </div>
      <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2 shrink-0">
        <span>{charCount} chars</span>
        <span>·</span>
        <span>{lineCount} lines</span>
        <span>·</span>
        {error ? (
          <span className="text-red-500 flex items-center gap-1">
            <XIcon className="size-3" />
            {error}
          </span>
        ) : inputJson.trim() ? (
          <span className="text-green-500 flex items-center gap-1">
            <CheckIcon className="size-3" />
            Valid JSON
          </span>
        ) : (
          <span>Waiting for input</span>
        )}
      </div>
    </div>
  );
}

function OutputSection({
  collapsedPaths,
  copied,
  error,
  formattedString,
  hoveredBracket,
  hoveredPath,
  lines,
  minify,
  onClickPath,
  onCollapseAll,
  onCopy,
  onDownload,
  onExpandAll,
  onHoverBracket,
  onHoverPath,
  onSelectBracket,
  onToggleCollapse,
  selectedBracket,
  transformed,
  wrap,
}: OutputSectionProps) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between mb-2 shrink-0">
        <label className="text-sm font-medium">Output</label>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={onExpandAll} disabled={!transformed}>
                <ChevronsUpDownIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Expand All</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onCollapseAll}
                disabled={!transformed}
              >
                <ChevronsDownUpIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Collapse All</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={onCopy} disabled={!formattedString}>
                {copied ? (
                  <CheckIcon className="size-4 text-green-500" />
                ) : (
                  <CopyIcon className="size-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{copied ? 'Copied!' : 'Copy'}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onDownload}
                disabled={!formattedString}
              >
                <DownloadIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download</TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="flex-1 min-h-0 border rounded-lg overflow-hidden">
        {transformed ? (
          <div
            className={cn(
              'h-full overflow-auto p-4 bg-muted/30',
              wrap ? 'break-all' : 'overflow-x-auto',
            )}
          >
            {minify ? (
              <pre className="font-mono text-sm whitespace-pre-wrap break-all">
                {formattedString}
              </pre>
            ) : (
              <JsonTree
                data={transformed}
                showLines={lines}
                collapsedPaths={collapsedPaths}
                onToggleCollapse={onToggleCollapse}
                onHoverPath={onHoverPath}
                onClickPath={onClickPath}
                hoveredBracket={hoveredBracket}
                selectedBracket={selectedBracket}
                onHoverBracket={onHoverBracket}
                onSelectBracket={onSelectBracket}
                wrap={wrap}
              />
            )}
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center text-muted-foreground p-4">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground border-dashed">
            <p>Formatted JSON will appear here</p>
          </div>
        )}
      </div>
      <div className="mt-2 text-xs text-muted-foreground font-mono shrink-0 truncate h-4">
        {hoveredPath || '\u00A0'}
      </div>
    </div>
  );
}

// Main component
function JsonFormatPage() {
  const isMobile = useIsMobile();
  const navigate = useNavigate({ from: '/strings/json-format' });
  const search = Route.useSearch();

  // Search params with defaults
  const wrap = search.wrap ?? false;
  const spacing = search.spacing ?? '2';
  const lines = search.lines ?? false;
  const minify = search.minify ?? false;
  const autofmt = search.autofmt ?? false;
  const sort = search.sort ?? false;
  const stripNull = search.stripNull ?? false;
  const escape = search.escape ?? false;

  // Local state
  const [inputJson, setInputJson] = useState('');
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set());
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [hoveredBracket, setHoveredBracket] = useState<string | null>(null);
  const [selectedBracket, setSelectedBracket] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'input' | 'output'>('input');

  // Handler that sets both hoveredPath and hoveredBracket (parent container)
  const handleHoverPath = useCallback((path: string | null) => {
    setHoveredPath(path);
    if (path) {
      const parent = getParentPath(path);
      setHoveredBracket(parent);
    } else {
      // Only clear hoveredBracket if it wasn't set directly by bracket hover
      setHoveredBracket(null);
    }
  }, []);

  // Handler to select a bracket when clicking on a key/value
  const handleSelectFromPath = useCallback((path: string | null) => {
    if (path) {
      const parent = getParentPath(path);
      if (parent) {
        setSelectedBracket(prev => (prev === parent ? null : parent));
      }
    }
  }, []);

  // Update URL helper
  const updateSearchParams = (updates: Partial<SearchParams>) => {
    navigate({
      search: prev => ({ ...prev, ...updates }),
      replace: true,
    });
  };

  // Parse and transform JSON
  const { error, transformed, formattedString } = useMemo(() => {
    if (!inputJson.trim()) {
      return { error: null, transformed: null, formattedString: '' };
    }

    try {
      const parsed = JSON.parse(inputJson);
      let transformed = parsed;

      // Apply transformations
      if (sort) transformed = sortKeys(transformed);
      if (stripNull) transformed = stripNulls(transformed);
      if (escape) transformed = escapeStrings(transformed);

      // Format string for copy/download
      const indent = minify ? undefined : spacing === 'tab' ? '\t' : spacing === '4' ? 4 : 2;
      const formattedString = JSON.stringify(transformed, null, indent);

      return { error: null, transformed, formattedString };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Invalid JSON';
      return { error: message, transformed: null, formattedString: '' };
    }
  }, [inputJson, sort, stripNull, escape, minify, spacing]);

  // Stats
  const charCount = inputJson.length;
  const lineCount = inputJson.split('\n').length;

  // Handlers
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      if (!autofmt) return;

      const pastedText = e.clipboardData.getData('text');
      try {
        const parsed = JSON.parse(pastedText);
        const indent = spacing === 'tab' ? '\t' : spacing === '4' ? 4 : 2;
        const formatted = JSON.stringify(parsed, null, indent);
        e.preventDefault();
        setInputJson(formatted);
        if (isMobile) setActiveTab('output');
      } catch {
        // Not valid JSON, let default paste happen
      }
    },
    [autofmt, spacing, isMobile],
  );

  const handleClear = () => {
    setInputJson('');
    setCollapsedPaths(new Set());
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formattedString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([formattedString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExpandAll = () => {
    setCollapsedPaths(new Set());
  };

  const handleCollapseAll = () => {
    if (transformed) {
      const paths = getCollapsiblePaths(transformed);
      setCollapsedPaths(new Set(paths));
    }
  };

  const toggleCollapse = (path: string) => {
    setCollapsedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  // Render input section
  const inputSection = (
    <InputSection
      inputJson={inputJson}
      onInputChange={setInputJson}
      onPaste={handlePaste}
      onClear={handleClear}
      error={error}
      charCount={charCount}
      lineCount={lineCount}
    />
  );

  // Render output section
  const outputSection = (
    <OutputSection
      transformed={transformed}
      formattedString={formattedString}
      error={error}
      minify={minify}
      lines={lines}
      wrap={wrap}
      copied={copied}
      hoveredPath={hoveredPath}
      hoveredBracket={hoveredBracket}
      selectedBracket={selectedBracket}
      collapsedPaths={collapsedPaths}
      onExpandAll={handleExpandAll}
      onCollapseAll={handleCollapseAll}
      onCopy={handleCopy}
      onDownload={handleDownload}
      onToggleCollapse={toggleCollapse}
      onHoverPath={handleHoverPath}
      onClickPath={handleSelectFromPath}
      onHoverBracket={setHoveredBracket}
      onSelectBracket={setSelectedBracket}
    />
  );

  // Mobile layout
  if (isMobile) {
    return (
      <div className="flex flex-col h-full gap-4">
        <OptionsPanel
          wrap={wrap}
          lines={lines}
          minify={minify}
          autofmt={autofmt}
          sort={sort}
          stripNull={stripNull}
          escape={escape}
          spacing={spacing}
          onWrapChange={v => updateSearchParams({ wrap: v })}
          onLinesChange={v => updateSearchParams({ lines: v })}
          onMinifyChange={v => updateSearchParams({ minify: v })}
          onAutofmtChange={v => updateSearchParams({ autofmt: v })}
          onSortChange={v => updateSearchParams({ sort: v })}
          onStripNullChange={v => updateSearchParams({ stripNull: v })}
          onEscapeChange={v => updateSearchParams({ escape: v })}
          onSpacingChange={v => updateSearchParams({ spacing: v })}
          isMobile={true}
        />

        <Tabs
          value={activeTab}
          onValueChange={v => setActiveTab(v as 'input' | 'output')}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="w-full shrink-0">
            <TabsTrigger value="input" className="flex-1">
              Input
            </TabsTrigger>
            <TabsTrigger value="output" className="flex-1">
              Output
            </TabsTrigger>
          </TabsList>
          <TabsContent value="input" className="flex-1 pt-4 min-h-0 max-h-[calc(100vh-14rem)]">
            {inputSection}
          </TabsContent>
          <TabsContent value="output" className="flex-1 pt-4 min-h-0 max-h-[calc(100vh-14rem)]">
            {outputSection}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="flex flex-col h-full gap-6">
      <OptionsPanel
        wrap={wrap}
        lines={lines}
        minify={minify}
        autofmt={autofmt}
        sort={sort}
        stripNull={stripNull}
        escape={escape}
        spacing={spacing}
        onWrapChange={v => updateSearchParams({ wrap: v })}
        onLinesChange={v => updateSearchParams({ lines: v })}
        onMinifyChange={v => updateSearchParams({ minify: v })}
        onAutofmtChange={v => updateSearchParams({ autofmt: v })}
        onSortChange={v => updateSearchParams({ sort: v })}
        onStripNullChange={v => updateSearchParams({ stripNull: v })}
        onEscapeChange={v => updateSearchParams({ escape: v })}
        onSpacingChange={v => updateSearchParams({ spacing: v })}
        isMobile={false}
      />

      <div className="flex-1 grid grid-cols-2 gap-6 min-h-0 max-h-[calc(100vh-18.75rem)]">
        {inputSection}
        {outputSection}
      </div>
    </div>
  );
}

// Route export
export const Route = createFileRoute('/strings/json-format')({
  component: JsonFormatPage,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    const parseBoolean = (value: unknown): boolean | undefined => {
      if (typeof value === 'boolean') return value;
      if (value === 'true') return true;
      if (value === 'false') return false;
      return undefined;
    };

    const validSpacing: Spacing[] = ['2', '4', 'tab'];

    return {
      wrap: parseBoolean(search.wrap),
      spacing: validSpacing.includes(search.spacing as Spacing)
        ? (search.spacing as Spacing)
        : undefined,
      lines: parseBoolean(search.lines),
      minify: parseBoolean(search.minify),
      autofmt: parseBoolean(search.autofmt),
      sort: parseBoolean(search.sort),
      stripNull: parseBoolean(search.stripNull),
      escape: parseBoolean(search.escape),
    };
  },
});
