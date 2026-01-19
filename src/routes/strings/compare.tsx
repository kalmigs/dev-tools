import { useState, useMemo } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { diffWords, diffChars, type Change } from 'diff'
import { CheckIcon, XIcon, ChevronDownIcon } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

// Types
type DiffMode = 'inline' | 'side'

interface SearchParams {
  highlight?: boolean
  diffMode?: DiffMode
  deepJson?: boolean
  ignoreCase?: boolean
  ignoreWs?: boolean
  ignoreArrayOrder?: boolean
}

interface CompareResult {
  isEqual: boolean
  normalizedA: string
  normalizedB: string
}

// Utility functions
function countWords(text: string): number {
  if (!text.trim()) return 0
  return text.trim().split(/\s+/).filter(Boolean).length
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, '')
}

function sortObjectKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys)
  }
  if (obj !== null && typeof obj === 'object') {
    const sorted: Record<string, unknown> = {}
    for (const key of Object.keys(obj).sort()) {
      sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key])
    }
    return sorted
  }
  return obj
}

function sortArraysInObject(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    // Sort array elements by their JSON representation for consistent comparison
    const sorted = obj.map(sortArraysInObject)
    return sorted.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
  }
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = sortArraysInObject(value)
    }
    return result
  }
  return obj
}

function tryParseJson(text: string): { valid: boolean; parsed: unknown } {
  try {
    return { valid: true, parsed: JSON.parse(text) }
  } catch {
    return { valid: false, parsed: null }
  }
}

function compareStrings(
  a: string,
  b: string,
  options: {
    deepJson: boolean
    ignoreCase: boolean
    ignoreWhitespace: boolean
    ignoreArrayOrder: boolean
  }
): CompareResult {
  let normalizedA = a
  let normalizedB = b

  // Handle JSON comparison (enabled by deepJson OR ignoreArrayOrder)
  const shouldParseJson = options.deepJson || options.ignoreArrayOrder
  if (shouldParseJson) {
    // If ignoring whitespace, clean up JSON strings before parsing
    // This handles cases like "[1,2 ]" which is invalid JSON due to extra space
    const jsonStringA = options.ignoreWhitespace ? a.replace(/\s+/g, '') : a
    const jsonStringB = options.ignoreWhitespace ? b.replace(/\s+/g, '') : b

    const jsonA = tryParseJson(jsonStringA)
    const jsonB = tryParseJson(jsonStringB)

    if (jsonA.valid && jsonB.valid) {
      // Sort object keys if deepJson is enabled
      let parsedA = options.deepJson ? sortObjectKeys(jsonA.parsed) : jsonA.parsed
      let parsedB = options.deepJson ? sortObjectKeys(jsonB.parsed) : jsonB.parsed

      // Sort arrays if ignoreArrayOrder is enabled
      if (options.ignoreArrayOrder) {
        parsedA = sortArraysInObject(parsedA)
        parsedB = sortArraysInObject(parsedB)
      }

      normalizedA = JSON.stringify(parsedA, null, 2)
      normalizedB = JSON.stringify(parsedB, null, 2)
    }
  }

  // Apply case normalization for comparison
  let compareA = normalizedA
  let compareB = normalizedB

  if (options.ignoreCase) {
    compareA = compareA.toLowerCase()
    compareB = compareB.toLowerCase()
  }

  if (options.ignoreWhitespace) {
    compareA = normalizeWhitespace(compareA)
    compareB = normalizeWhitespace(compareB)
  }

  return {
    isEqual: compareA === compareB,
    normalizedA,
    normalizedB,
  }
}

// Diff rendering components
function InlineDiff({ changes }: { changes: Change[] }) {
  return (
    <div className="font-mono text-sm whitespace-pre-wrap break-all">
      {changes.map((change, i) => {
        if (change.added) {
          return (
            <span
              key={i}
              className="bg-green-500/20 text-green-700 dark:text-green-400"
            >
              {change.value}
            </span>
          )
        }
        if (change.removed) {
          return (
            <span
              key={i}
              className="bg-red-500/20 text-red-700 dark:text-red-400 line-through"
            >
              {change.value}
            </span>
          )
        }
        return <span key={i}>{change.value}</span>
      })}
    </div>
  )
}

function SideBySideDiff({ changes }: { changes: Change[] }) {
  // Split changes into left (removals + unchanged) and right (additions + unchanged)
  const leftParts: { text: string; type: 'removed' | 'unchanged' }[] = []
  const rightParts: { text: string; type: 'added' | 'unchanged' }[] = []

  for (const change of changes) {
    if (change.removed) {
      leftParts.push({ text: change.value, type: 'removed' })
    } else if (change.added) {
      rightParts.push({ text: change.value, type: 'added' })
    } else {
      leftParts.push({ text: change.value, type: 'unchanged' })
      rightParts.push({ text: change.value, type: 'unchanged' })
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted/50 px-3 py-2 border-b text-sm font-medium text-muted-foreground">
          Original (A)
        </div>
        <div className="p-3 font-mono text-sm whitespace-pre-wrap break-all min-h-[100px]">
          {leftParts.map((part, i) => (
            <span
              key={i}
              className={cn(
                part.type === 'removed' &&
                  'bg-red-500/20 text-red-700 dark:text-red-400'
              )}
            >
              {part.text}
            </span>
          ))}
        </div>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted/50 px-3 py-2 border-b text-sm font-medium text-muted-foreground">
          Modified (B)
        </div>
        <div className="p-3 font-mono text-sm whitespace-pre-wrap break-all min-h-[100px]">
          {rightParts.map((part, i) => (
            <span
              key={i}
              className={cn(
                part.type === 'added' &&
                  'bg-green-500/20 text-green-700 dark:text-green-400'
              )}
            >
              {part.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function MobileSideBySideDiff({ changes }: { changes: Change[] }) {
  const [activeTab, setActiveTab] = useState<'original' | 'modified'>('original')

  const leftParts: { text: string; type: 'removed' | 'unchanged' }[] = []
  const rightParts: { text: string; type: 'added' | 'unchanged' }[] = []

  for (const change of changes) {
    if (change.removed) {
      leftParts.push({ text: change.value, type: 'removed' })
    } else if (change.added) {
      rightParts.push({ text: change.value, type: 'added' })
    } else {
      leftParts.push({ text: change.value, type: 'unchanged' })
      rightParts.push({ text: change.value, type: 'unchanged' })
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'original' | 'modified')}>
      <TabsList className="w-full">
        <TabsTrigger value="original" className="flex-1">Original (A)</TabsTrigger>
        <TabsTrigger value="modified" className="flex-1">Modified (B)</TabsTrigger>
      </TabsList>
      <TabsContent value="original" className="mt-3">
        <div className="border rounded-lg p-3 font-mono text-sm whitespace-pre-wrap break-all min-h-[100px]">
          {leftParts.map((part, i) => (
            <span
              key={i}
              className={cn(
                part.type === 'removed' &&
                  'bg-red-500/20 text-red-700 dark:text-red-400'
              )}
            >
              {part.text}
            </span>
          ))}
        </div>
      </TabsContent>
      <TabsContent value="modified" className="mt-3">
        <div className="border rounded-lg p-3 font-mono text-sm whitespace-pre-wrap break-all min-h-[100px]">
          {rightParts.map((part, i) => (
            <span
              key={i}
              className={cn(
                part.type === 'added' &&
                  'bg-green-500/20 text-green-700 dark:text-green-400'
              )}
            >
              {part.text}
            </span>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}

// Toggle checkbox component
function ToggleOption({
  id,
  label,
  checked,
  onCheckedChange,
  description,
}: {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  description?: string
}) {
  return (
    <div className="flex items-start gap-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="mt-0.5"
      />
      <div className="grid gap-0.5 leading-none">
        <label
          htmlFor={id}
          className="text-sm font-medium cursor-pointer select-none"
        >
          {label}
        </label>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
    </div>
  )
}

// Options panel
function OptionsPanel({
  highlight,
  diffMode,
  deepJson,
  ignoreCase,
  ignoreWhitespace,
  ignoreArrayOrder,
  onHighlightChange,
  onDiffModeChange,
  onDeepJsonChange,
  onIgnoreCaseChange,
  onIgnoreWhitespaceChange,
  onIgnoreArrayOrderChange,
  isMobile,
}: {
  highlight: boolean
  diffMode: DiffMode
  deepJson: boolean
  ignoreCase: boolean
  ignoreWhitespace: boolean
  ignoreArrayOrder: boolean
  onHighlightChange: (v: boolean) => void
  onDiffModeChange: (v: DiffMode) => void
  onDeepJsonChange: (v: boolean) => void
  onIgnoreCaseChange: (v: boolean) => void
  onIgnoreWhitespaceChange: (v: boolean) => void
  onIgnoreArrayOrderChange: (v: boolean) => void
  isMobile: boolean
}) {
  const content = (
    <div className={cn('space-y-4', !isMobile && 'flex gap-8 space-y-0')}>
      {/* Comparison Options */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Comparison
        </h3>
        <div className="space-y-2.5">
          <ToggleOption
            id="highlight"
            label="Highlight Differences"
            checked={highlight}
            onCheckedChange={onHighlightChange}
          />
          <ToggleOption
            id="ignoreCase"
            label="Ignore Case"
            checked={ignoreCase}
            onCheckedChange={onIgnoreCaseChange}
          />
          <ToggleOption
            id="ignoreWhitespace"
            label="Ignore Whitespace"
            checked={ignoreWhitespace}
            onCheckedChange={onIgnoreWhitespaceChange}
          />
        </div>
      </div>

      {/* JSON Options */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          JSON Options
        </h3>
        <div className="space-y-2.5">
          <ToggleOption
            id="deepJson"
            label="Deep JSON Compare"
            checked={deepJson}
            onCheckedChange={onDeepJsonChange}
            description="Ignore field order"
          />
          <ToggleOption
            id="ignoreArrayOrder"
            label="Ignore Array Order"
            checked={ignoreArrayOrder}
            onCheckedChange={onIgnoreArrayOrderChange}
          />
        </div>
      </div>

      {/* Diff Style */}
      {highlight && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Diff Style
          </h3>
          <RadioGroup
            value={diffMode}
            onValueChange={(v) => onDiffModeChange(v as DiffMode)}
            className="flex gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="inline" id="diff-inline" />
              <label htmlFor="diff-inline" className="text-sm cursor-pointer">
                Inline
              </label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="side" id="diff-side" />
              <label htmlFor="diff-side" className="text-sm cursor-pointer">
                Side-by-Side
              </label>
            </div>
          </RadioGroup>
        </div>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <Collapsible defaultOpen={false}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
          Options
          <ChevronDownIcon className="size-4 transition-transform [[data-state=open]>&]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 pb-1">
          {content}
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return <div className="border rounded-lg p-4">{content}</div>
}

// Main component
function ComparePage() {
  const isMobile = useIsMobile()
  const navigate = useNavigate({ from: '/strings/compare' })
  const search = Route.useSearch()

  // Initialize from search params with defaults
  const highlight = search.highlight ?? true
  const diffMode = search.diffMode ?? 'inline'
  const deepJson = search.deepJson ?? false
  const ignoreCase = search.ignoreCase ?? false
  const ignoreWhitespace = search.ignoreWs ?? false
  const ignoreArrayOrder = search.ignoreArrayOrder ?? false

  const [stringA, setStringA] = useState('')
  const [stringB, setStringB] = useState('')

  // Update URL helper
  const updateSearchParams = (updates: Partial<SearchParams>) => {
    navigate({
      search: (prev) => ({ ...prev, ...updates }),
      replace: true,
    })
  }

  // Compute comparison result
  const result = useMemo(() => {
    if (!stringA && !stringB) return null

    return compareStrings(stringA, stringB, {
      deepJson,
      ignoreCase,
      ignoreWhitespace,
      ignoreArrayOrder,
    })
  }, [stringA, stringB, deepJson, ignoreCase, ignoreWhitespace, ignoreArrayOrder])

  // Compute diff changes
  const diffChanges = useMemo(() => {
    if (!result || !highlight) return null

    // Use word diff for better readability, fall back to char diff for short strings
    const useCharDiff = result.normalizedA.length < 50 && result.normalizedB.length < 50
    const diffFn = useCharDiff ? diffChars : diffWords

    return diffFn(result.normalizedA, result.normalizedB, {
      ignoreCase: ignoreCase,
    })
  }, [result, highlight, ignoreCase])

  // Word counts
  const wordCountA = useMemo(() => countWords(stringA), [stringA])
  const wordCountB = useMemo(() => countWords(stringB), [stringB])

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Options */}
      <OptionsPanel
        highlight={highlight}
        diffMode={diffMode}
        deepJson={deepJson}
        ignoreCase={ignoreCase}
        ignoreWhitespace={ignoreWhitespace}
        ignoreArrayOrder={ignoreArrayOrder}
        onHighlightChange={(v) => updateSearchParams({ highlight: v })}
        onDiffModeChange={(v) => updateSearchParams({ diffMode: v })}
        onDeepJsonChange={(v) => updateSearchParams({ deepJson: v })}
        onIgnoreCaseChange={(v) => updateSearchParams({ ignoreCase: v })}
        onIgnoreWhitespaceChange={(v) => updateSearchParams({ ignoreWs: v })}
        onIgnoreArrayOrderChange={(v) => updateSearchParams({ ignoreArrayOrder: v })}
        isMobile={isMobile}
      />

      {/* Input Areas */}
      <div className={cn('grid gap-4', !isMobile && 'grid-cols-2')}>
        <div className="space-y-2">
          <label className="text-sm font-medium">String A</label>
          <Textarea
            value={stringA}
            onChange={(e) => setStringA(e.target.value)}
            placeholder="Paste first string here..."
            className="h-40 font-mono resize-y"
          />
          <p className="text-xs text-muted-foreground">
            {wordCountA} {wordCountA === 1 ? 'word' : 'words'}
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">String B</label>
          <Textarea
            value={stringB}
            onChange={(e) => setStringB(e.target.value)}
            placeholder="Paste second string here..."
            className="h-40 font-mono resize-y"
          />
          <p className="text-xs text-muted-foreground">
            {wordCountB} {wordCountB === 1 ? 'word' : 'words'}
          </p>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div
          className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-lg font-medium',
            result.isEqual
              ? 'bg-green-500/10 text-green-700 dark:text-green-400'
              : 'bg-red-500/10 text-red-700 dark:text-red-400'
          )}
        >
          {result.isEqual ? (
            <>
              <CheckIcon className="size-5" />
              Strings are equal
            </>
          ) : (
            <>
              <XIcon className="size-5" />
              Strings are not equal
            </>
          )}
        </div>
      )}

      {/* Diff View */}
      {highlight && diffChanges && !result?.isEqual && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Differences
          </h2>
          {diffMode === 'inline' ? (
            <div className="border rounded-lg p-4 bg-muted/30">
              <InlineDiff changes={diffChanges} />
            </div>
          ) : isMobile ? (
            <MobileSideBySideDiff changes={diffChanges} />
          ) : (
            <SideBySideDiff changes={diffChanges} />
          )}
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded bg-red-500/20 border border-red-500/30" />
              Removed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded bg-green-500/20 border border-green-500/30" />
              Added
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// Route export
export const Route = createFileRoute('/strings/compare')({
  component: ComparePage,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      highlight: typeof search.highlight === 'boolean'
        ? search.highlight
        : search.highlight === 'true'
          ? true
          : search.highlight === 'false'
            ? false
            : undefined,
      diffMode: search.diffMode === 'inline' || search.diffMode === 'side'
        ? search.diffMode
        : undefined,
      deepJson: typeof search.deepJson === 'boolean'
        ? search.deepJson
        : search.deepJson === 'true'
          ? true
          : search.deepJson === 'false'
            ? false
            : undefined,
      ignoreCase: typeof search.ignoreCase === 'boolean'
        ? search.ignoreCase
        : search.ignoreCase === 'true'
          ? true
          : search.ignoreCase === 'false'
            ? false
            : undefined,
      ignoreWs: typeof search.ignoreWs === 'boolean'
        ? search.ignoreWs
        : search.ignoreWs === 'true'
          ? true
          : search.ignoreWs === 'false'
            ? false
            : undefined,
      ignoreArrayOrder: typeof search.ignoreArrayOrder === 'boolean'
        ? search.ignoreArrayOrder
        : search.ignoreArrayOrder === 'true'
          ? true
          : search.ignoreArrayOrder === 'false'
            ? false
            : undefined,
    }
  },
})
