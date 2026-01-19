import { useState, useMemo } from 'react'
import { faker } from '@faker-js/faker/locale/en'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CopyIcon,
  DownloadIcon,
  MinimizeIcon,
  SettingsIcon,
  ShuffleIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { NumberInput } from '@/components/ui/number-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useIsMobile } from '@/hooks/use-mobile'

// Types
type StringStyle = 'words' | 'realistic' | 'lorem'
type KeyStyle = 'camelCase' | 'snake_case' | 'words'
type Indentation = '2' | '4' | 'tab' | 'minified'

interface RandomJsonConfig {
  // Structure
  numKeys: number
  maxDepth: number

  // Probabilities (0-100)
  arrayProbability: number
  objectProbability: number
  nullProbability: number

  // Arrays
  arrayMinLength: number
  arrayMaxLength: number

  // Strings
  stringStyle: StringStyle

  // Keys
  keyStyle: KeyStyle

  // Numbers
  numberMin: number
  numberMax: number
  includeFloats: boolean

  // Output
  count: number
  indentation: Indentation

  // Advanced
  seed: string
}

interface SearchParams {
  numKeys?: number
  maxDepth?: number
  arrayProbability?: number
  objectProbability?: number
  nullProbability?: number
  arrayMinLength?: number
  arrayMaxLength?: number
  stringStyle?: StringStyle
  keyStyle?: KeyStyle
  numberMin?: number
  numberMax?: number
  includeFloats?: boolean
  count?: number
  indentation?: Indentation
  seed?: string
  advancedMode?: boolean
}

interface ControlGroupProps {
  children: React.ReactNode
  defaultOpen?: boolean
  title: string
}

interface SliderInputProps {
  label: string
  max: number
  min: number
  onChange: (value: number) => void
  suffix?: string
  value: number
}

// Constants
const DEFAULT_CONFIG: RandomJsonConfig = {
  numKeys: 5,
  maxDepth: 2,
  arrayProbability: 15,
  objectProbability: 20,
  nullProbability: 5,
  arrayMinLength: 1,
  arrayMaxLength: 4,
  stringStyle: 'words',
  keyStyle: 'snake_case',
  numberMin: 0,
  numberMax: 1000,
  includeFloats: true,
  count: 1,
  indentation: '2',
  seed: '',
}

const VALUE_COLORS = {
  string: 'text-green-600 dark:text-green-400',
  number: 'text-orange-500 dark:text-orange-400',
  boolean: 'text-violet-500 dark:text-violet-400',
  null: 'text-red-500 dark:text-red-400',
  key: 'text-blue-400 dark:text-blue-300',
  punctuation: 'text-muted-foreground',
} as const

// Helper: Generate random key based on style
function generateKey(style: KeyStyle, usedKeys: Set<string>): string {
  let key: string
  let attempts = 0
  const maxAttempts = 50

  do {
    const word1 = faker.word.adjective()
    const word2 = faker.word.noun()

    switch (style) {
      case 'camelCase':
        key = word1 + word2.charAt(0).toUpperCase() + word2.slice(1)
        break
      case 'snake_case':
        key = `${word1}_${word2}`
        break
      case 'words':
      default:
        key = faker.word.noun()
        break
    }
    attempts++
  } while (usedKeys.has(key) && attempts < maxAttempts)

  usedKeys.add(key)
  return key
}

// Helper: Generate random primitive value
function generatePrimitiveValue(config: RandomJsonConfig): unknown {
  // Check for null
  if (Math.random() * 100 < config.nullProbability) {
    return null
  }

  // Random type selection (weighted towards strings)
  const typeRoll = Math.random()
  if (typeRoll < 0.5) {
    // String (50%)
    return generateStringValue(config.stringStyle)
  } else if (typeRoll < 0.8) {
    // Number (30%)
    if (config.includeFloats && Math.random() < 0.3) {
      return parseFloat(
        (Math.random() * (config.numberMax - config.numberMin) + config.numberMin).toFixed(2)
      )
    }
    return Math.floor(Math.random() * (config.numberMax - config.numberMin + 1)) + config.numberMin
  } else {
    // Boolean (20%)
    return faker.datatype.boolean()
  }
}

// Helper: Generate string value based on style
function generateStringValue(style: StringStyle): string {
  switch (style) {
    case 'realistic': {
      const generators = [
        () => faker.person.fullName(),
        () => faker.internet.email(),
        () => faker.internet.url(),
        () => faker.location.city(),
        () => faker.company.name(),
        () => faker.commerce.productName(),
        () => faker.string.uuid(),
        () => faker.date.past().toISOString(),
        () => faker.phone.number(),
        () => faker.location.country(),
      ]
      return generators[Math.floor(Math.random() * generators.length)]()
    }
    case 'lorem':
      return faker.lorem.sentence()
    case 'words':
    default:
      return faker.word.words({ count: { min: 1, max: 3 } })
  }
}

// Helper: Generate random array
function generateRandomArray(
  config: RandomJsonConfig,
  currentDepth: number,
  usedKeys: Set<string>
): unknown[] {
  const length =
    Math.floor(Math.random() * (config.arrayMaxLength - config.arrayMinLength + 1)) +
    config.arrayMinLength
  const arr: unknown[] = []

  for (let i = 0; i < length; i++) {
    arr.push(generateRandomValue(config, currentDepth, usedKeys))
  }

  return arr
}

// Helper: Generate random value (primitive, object, or array)
function generateRandomValue(
  config: RandomJsonConfig,
  currentDepth: number,
  usedKeys: Set<string>
): unknown {
  // If we haven't reached max depth, we can nest
  if (currentDepth < config.maxDepth) {
    const roll = Math.random() * 100

    if (roll < config.objectProbability) {
      // Generate nested object
      return generateRandomObject(config, currentDepth + 1, usedKeys)
    } else if (roll < config.objectProbability + config.arrayProbability) {
      // Generate array
      return generateRandomArray(config, currentDepth + 1, usedKeys)
    }
  }

  // Generate primitive value
  return generatePrimitiveValue(config)
}

// Main: Generate random JSON object
function generateRandomObject(
  config: RandomJsonConfig,
  currentDepth: number = 0,
  parentUsedKeys?: Set<string>
): Record<string, unknown> {
  const obj: Record<string, unknown> = {}
  const usedKeys = new Set<string>()

  // Vary key count slightly at nested levels
  const keyCount =
    currentDepth === 0
      ? config.numKeys
      : Math.max(1, Math.floor(config.numKeys * (0.5 + Math.random() * 0.5)))

  for (let i = 0; i < keyCount; i++) {
    const key = generateKey(config.keyStyle, usedKeys)
    obj[key] = generateRandomValue(config, currentDepth, parentUsedKeys ?? usedKeys)
  }

  return obj
}

// Main: Generate JSON with seed support
function generateJson(config: RandomJsonConfig): unknown {
  // Set seed if provided
  if (config.seed.trim()) {
    faker.seed(hashCode(config.seed))
  } else {
    faker.seed()
  }

  if (config.count === 1) {
    return generateRandomObject(config)
  }

  const results: Record<string, unknown>[] = []
  for (let i = 0; i < config.count; i++) {
    results.push(generateRandomObject(config))
  }
  return results
}

// Helper: Simple hash function for seed
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

// Helper: Format JSON string
function formatJson(data: unknown, indentation: Indentation): string {
  if (indentation === 'minified') {
    return JSON.stringify(data)
  }
  const indent = indentation === 'tab' ? '\t' : Number(indentation)
  return JSON.stringify(data, null, indent)
}

// Subcomponents
function ControlGroup({ children, defaultOpen = true, title }: ControlGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex items-center gap-2 w-full text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1">
          {isOpen ? <ChevronDownIcon className="size-4" /> : <ChevronRightIcon className="size-4" />}
          {title}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-6 pt-2 pb-4 space-y-4">{children}</CollapsibleContent>
    </Collapsible>
  )
}

function LabelWithTooltip({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <label className="text-xs text-muted-foreground cursor-help border-b border-dotted border-muted-foreground/50">
          {label}
        </label>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[200px]">
        <p className="text-xs">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  )
}

function SliderInput({
  label,
  max,
  min,
  onChange,
  suffix = '',
  tooltip,
  value,
}: SliderInputProps & { tooltip?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        {tooltip ? (
          <LabelWithTooltip label={label} tooltip={tooltip} />
        ) : (
          <label className="text-xs text-muted-foreground">{label}</label>
        )}
        <span className="text-xs font-mono text-muted-foreground">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
      />
    </div>
  )
}

function ToggleOption({
  checked,
  id,
  label,
  onCheckedChange,
  tooltip,
}: {
  checked: boolean
  id: string
  label: string
  onCheckedChange: (checked: boolean) => void
  tooltip?: string
}) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
      {tooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <label
              htmlFor={id}
              className="text-xs text-muted-foreground cursor-pointer border-b border-dotted border-muted-foreground/50"
            >
              {label}
            </label>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-[200px]">
            <p className="text-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <label htmlFor={id} className="text-xs text-muted-foreground cursor-pointer">
          {label}
        </label>
      )}
    </div>
  )
}

function InputControls({
  advancedMode,
  config,
  onAdvancedModeChange,
  onConfigChange,
  onGenerate,
}: {
  advancedMode: boolean
  config: RandomJsonConfig
  onAdvancedModeChange: (mode: boolean) => void
  onConfigChange: (updates: Partial<RandomJsonConfig>) => void
  onGenerate: () => void
}) {
  return (
    <div className="flex flex-col gap-2">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between pb-2 border-b">
        <span className="text-sm font-medium">Options</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAdvancedModeChange(!advancedMode)}
          className="gap-1.5 h-7 text-xs"
        >
          <SettingsIcon className="size-3" />
          {advancedMode ? 'Simple' : 'Advanced'}
        </Button>
      </div>

      {/* Structure */}
      <ControlGroup title="Structure" defaultOpen={true}>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <LabelWithTooltip label="Keys" tooltip="Number of top-level properties in the generated JSON object" />
            <NumberInput
              value={config.numKeys}
              onValueChange={(v) => onConfigChange({ numKeys: v ?? 5 })}
              min={1}
              max={20}
              stepper={1}
              onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <LabelWithTooltip label="Max Depth" tooltip="Maximum nesting level for objects and arrays. 0 = flat, no nesting" />
            <NumberInput
              value={config.maxDepth}
              onValueChange={(v) => onConfigChange({ maxDepth: v ?? 2 })}
              min={0}
              max={5}
              stepper={1}
              onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
            />
          </div>
        </div>
      </ControlGroup>

      {/* Probabilities */}
      {advancedMode && (
        <ControlGroup title="Probabilities" defaultOpen={true}>
          <SliderInput
            label="Array"
            tooltip="Chance that a value becomes an array instead of a primitive"
            value={config.arrayProbability}
            onChange={(v) => onConfigChange({ arrayProbability: v })}
            min={0}
            max={50}
            suffix="%"
          />
          <SliderInput
            label="Object"
            tooltip="Chance that a value becomes a nested object instead of a primitive"
            value={config.objectProbability}
            onChange={(v) => onConfigChange({ objectProbability: v })}
            min={0}
            max={50}
            suffix="%"
          />
          <SliderInput
            label="Null"
            tooltip="Chance that a primitive value is null instead of string/number/boolean"
            value={config.nullProbability}
            onChange={(v) => onConfigChange({ nullProbability: v })}
            min={0}
            max={30}
            suffix="%"
          />
        </ControlGroup>
      )}

      {/* Arrays */}
      {advancedMode && (
        <ControlGroup title="Arrays" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <LabelWithTooltip label="Min Length" tooltip="Minimum number of elements in generated arrays" />
              <NumberInput
                value={config.arrayMinLength}
                onValueChange={(v) => onConfigChange({ arrayMinLength: v ?? 1 })}
                min={0}
                max={10}
                stepper={1}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <LabelWithTooltip label="Max Length" tooltip="Maximum number of elements in generated arrays" />
              <NumberInput
                value={config.arrayMaxLength}
                onValueChange={(v) => onConfigChange({ arrayMaxLength: v ?? 4 })}
                min={1}
                max={20}
                stepper={1}
              />
            </div>
          </div>
        </ControlGroup>
      )}

      {/* Values */}
      {advancedMode && (
        <ControlGroup title="Values" defaultOpen={false}>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <LabelWithTooltip
                label="String Style"
                tooltip="Words: random words. Realistic: names, emails, URLs, dates. Lorem: lorem ipsum sentences"
              />
              <Select
                value={config.stringStyle}
                onValueChange={(v) => onConfigChange({ stringStyle: v as StringStyle })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="words">Words</SelectItem>
                  <SelectItem value="realistic">Realistic</SelectItem>
                  <SelectItem value="lorem">Lorem</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <LabelWithTooltip
                label="Key Style"
                tooltip="Format for generated property names: camelCase, snake_case, or simple words"
              />
              <Select
                value={config.keyStyle}
                onValueChange={(v) => onConfigChange({ keyStyle: v as KeyStyle })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="camelCase">camelCase</SelectItem>
                  <SelectItem value="snake_case">snake_case</SelectItem>
                  <SelectItem value="words">simple words</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <LabelWithTooltip label="Number Min" tooltip="Minimum value for generated numbers" />
                <NumberInput
                  value={config.numberMin}
                  onValueChange={(v) => onConfigChange({ numberMin: v ?? 0 })}
                  min={-10000}
                  max={config.numberMax - 1}
                  stepper={10}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <LabelWithTooltip label="Number Max" tooltip="Maximum value for generated numbers" />
                <NumberInput
                  value={config.numberMax}
                  onValueChange={(v) => onConfigChange({ numberMax: v ?? 1000 })}
                  min={config.numberMin + 1}
                  max={100000}
                  stepper={100}
                />
              </div>
            </div>

            <ToggleOption
              id="includeFloats"
              label="Include floats"
              tooltip="When enabled, some numbers will have decimal places (e.g. 42.75)"
              checked={config.includeFloats}
              onCheckedChange={(v) => onConfigChange({ includeFloats: v as boolean })}
            />
          </div>
        </ControlGroup>
      )}

      {/* Output */}
      <ControlGroup title="Output" defaultOpen={true}>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <LabelWithTooltip label="Count" tooltip="Generate multiple JSON objects as an array" />
              <NumberInput
                value={config.count}
                onValueChange={(v) => onConfigChange({ count: v ?? 1 })}
                min={1}
                max={100}
                stepper={1}
                onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <LabelWithTooltip label="Indent" tooltip="Indentation style for the output JSON" />
              <Select
                value={config.indentation}
                onValueChange={(v) => onConfigChange({ indentation: v as Indentation })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 spaces</SelectItem>
                  <SelectItem value="4">4 spaces</SelectItem>
                  <SelectItem value="tab">Tab</SelectItem>
                  <SelectItem value="minified">Minified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {advancedMode && (
            <div className="flex flex-col gap-1.5">
              <LabelWithTooltip label="Seed" tooltip="Enter any text to generate reproducible output. Same seed = same JSON" />
              <input
                type="text"
                value={config.seed}
                onChange={(e) => onConfigChange({ seed: e.target.value })}
                placeholder="For reproducible output"
                className="h-8 px-2 text-xs rounded-md border bg-background"
                onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
              />
            </div>
          )}
        </div>
      </ControlGroup>

      {/* Generate Button */}
      <Button onClick={onGenerate} className="w-fit gap-2">
        <ShuffleIcon className="size-4" />
        Generate
      </Button>
    </div>
  )
}

function OutputSection({
  copied,
  copiedMinified,
  generatedJson,
  onCopy,
  onCopyMinified,
  onDownload,
}: {
  copied: boolean
  copiedMinified: boolean
  generatedJson: string
  onCopy: () => void
  onCopyMinified: () => void
  onDownload: () => void
}) {
  // Simple syntax highlighting
  const highlightedJson = useMemo(() => {
    if (!generatedJson) return null

    // Split by line and highlight each
    return generatedJson.split('\n').map((line, lineIndex) => {
      const parts: React.ReactNode[] = []
      const remaining = line
      let keyIndex = 0

      // Match patterns: strings, numbers, booleans, null, punctuation
      const regex = /("(?:\\.|[^"\\])*")\s*:|("(?:\\.|[^"\\])*")|(-?\d+\.?\d*)|(\btrue\b|\bfalse\b)|(\bnull\b)|([{}[\],:])/g
      let match
      let lastIndex = 0

      while ((match = regex.exec(remaining)) !== null) {
        // Add any text before this match (whitespace)
        if (match.index > lastIndex) {
          parts.push(
            <span key={`ws-${lineIndex}-${keyIndex++}`}>{remaining.slice(lastIndex, match.index)}</span>
          )
        }

        if (match[1]) {
          // Key
          parts.push(
            <span key={`k-${lineIndex}-${keyIndex++}`} className={VALUE_COLORS.key}>
              {match[1]}
            </span>
          )
          parts.push(
            <span key={`c-${lineIndex}-${keyIndex++}`} className={VALUE_COLORS.punctuation}>
              :
            </span>
          )
        } else if (match[2]) {
          // String value
          parts.push(
            <span key={`s-${lineIndex}-${keyIndex++}`} className={VALUE_COLORS.string}>
              {match[2]}
            </span>
          )
        } else if (match[3]) {
          // Number
          parts.push(
            <span key={`n-${lineIndex}-${keyIndex++}`} className={VALUE_COLORS.number}>
              {match[3]}
            </span>
          )
        } else if (match[4]) {
          // Boolean
          parts.push(
            <span key={`b-${lineIndex}-${keyIndex++}`} className={VALUE_COLORS.boolean}>
              {match[4]}
            </span>
          )
        } else if (match[5]) {
          // Null
          parts.push(
            <span key={`null-${lineIndex}-${keyIndex++}`} className={VALUE_COLORS.null}>
              {match[5]}
            </span>
          )
        } else if (match[6]) {
          // Punctuation
          parts.push(
            <span key={`p-${lineIndex}-${keyIndex++}`} className={VALUE_COLORS.punctuation}>
              {match[6]}
            </span>
          )
        }

        lastIndex = regex.lastIndex
      }

      // Add remaining text
      if (lastIndex < remaining.length) {
        parts.push(<span key={`end-${lineIndex}`}>{remaining.slice(lastIndex)}</span>)
      }

      return (
        <div key={lineIndex} className="leading-relaxed">
          {parts.length > 0 ? parts : '\u00A0'}
        </div>
      )
    })
  }, [generatedJson])

  return (
    <div className="h-full flex flex-col">
      {generatedJson ? (
        <div className="border rounded-lg overflow-hidden flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Generated JSON</span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded font-mono">
                {(generatedJson.length / 1024).toFixed(1)} KB
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onDownload} className="gap-2">
                <DownloadIcon className="size-4" />
                <span className="hidden sm:inline">Download</span>
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={onCopyMinified} className="gap-2">
                    {copiedMinified ? (
                      <>
                        <CheckIcon className="size-4 text-green-500" />
                        <span className="hidden sm:inline">Copied!</span>
                      </>
                    ) : (
                      <>
                        <MinimizeIcon className="size-4" />
                        <span className="hidden sm:inline">Copy Min</span>
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Copy as minified JSON (no whitespace)</p>
                </TooltipContent>
              </Tooltip>
              <Button variant="outline" size="sm" onClick={onCopy} className="gap-2">
                {copied ? (
                  <>
                    <CheckIcon className="size-4 text-green-500" />
                    <span className="hidden sm:inline">Copied!</span>
                  </>
                ) : (
                  <>
                    <CopyIcon className="size-4" />
                    <span className="hidden sm:inline">Copy</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* JSON Output */}
          <div className="flex-1 overflow-auto min-h-0 p-4">
            <pre className="text-sm font-mono whitespace-pre">{highlightedJson}</pre>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground border rounded-lg border-dashed">
          <p>Generated JSON will appear here</p>
        </div>
      )}
    </div>
  )
}

// Main component
function RandomJsonPage() {
  const isMobile = useIsMobile()
  const navigate = useNavigate({ from: '/generate/json' })
  const search = Route.useSearch()

  // Initialize state from search params or defaults
  const initialConfig: RandomJsonConfig = {
    numKeys: search.numKeys ?? DEFAULT_CONFIG.numKeys,
    maxDepth: search.maxDepth ?? DEFAULT_CONFIG.maxDepth,
    arrayProbability: search.arrayProbability ?? DEFAULT_CONFIG.arrayProbability,
    objectProbability: search.objectProbability ?? DEFAULT_CONFIG.objectProbability,
    nullProbability: search.nullProbability ?? DEFAULT_CONFIG.nullProbability,
    arrayMinLength: search.arrayMinLength ?? DEFAULT_CONFIG.arrayMinLength,
    arrayMaxLength: search.arrayMaxLength ?? DEFAULT_CONFIG.arrayMaxLength,
    stringStyle: search.stringStyle ?? DEFAULT_CONFIG.stringStyle,
    keyStyle: search.keyStyle ?? DEFAULT_CONFIG.keyStyle,
    numberMin: search.numberMin ?? DEFAULT_CONFIG.numberMin,
    numberMax: search.numberMax ?? DEFAULT_CONFIG.numberMax,
    includeFloats: search.includeFloats ?? DEFAULT_CONFIG.includeFloats,
    count: search.count ?? DEFAULT_CONFIG.count,
    indentation: search.indentation ?? DEFAULT_CONFIG.indentation,
    seed: search.seed ?? DEFAULT_CONFIG.seed,
  }

  const [activeTab, setActiveTab] = useState('input')
  const [advancedMode, setAdvancedMode] = useState(search.advancedMode ?? false)
  const [config, setConfig] = useState<RandomJsonConfig>(initialConfig)
  const [copied, setCopied] = useState(false)
  const [copiedMinified, setCopiedMinified] = useState(false)
  const [generatedJson, setGeneratedJson] = useState<string>(() => {
    const data = generateJson(initialConfig)
    return formatJson(data, initialConfig.indentation)
  })

  // Update URL when settings change
  const updateSearchParams = (updates: Partial<SearchParams>) => {
    navigate({
      search: (prev) => ({
        ...prev,
        ...updates,
      }),
      replace: true,
    })
  }

  const handleConfigChange = (updates: Partial<RandomJsonConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }))
    updateSearchParams(updates)
  }

  const handleAdvancedModeChange = (mode: boolean) => {
    setAdvancedMode(mode)
    updateSearchParams({ advancedMode: mode })
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedJson)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyMinified = async () => {
    // Parse and re-stringify to get minified version
    try {
      const parsed = JSON.parse(generatedJson)
      const minified = JSON.stringify(parsed)
      await navigator.clipboard.writeText(minified)
      setCopiedMinified(true)
      setTimeout(() => setCopiedMinified(false), 2000)
    } catch {
      // If parsing fails, just copy the original
      await navigator.clipboard.writeText(generatedJson.replace(/\s+/g, ''))
      setCopiedMinified(true)
      setTimeout(() => setCopiedMinified(false), 2000)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([generatedJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'generated.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleGenerate = () => {
    const data = generateJson(config)
    setGeneratedJson(formatJson(data, config.indentation))
    setCopied(false)
    setCopiedMinified(false)
    // Switch to output tab on mobile
    if (isMobile) {
      setActiveTab('output')
    }
  }

  // Mobile Layout with Tabs
  if (isMobile) {
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <TabsList className="w-full">
          <TabsTrigger value="input" className="flex-1">
            Options
          </TabsTrigger>
          <TabsTrigger value="output" className="flex-1">
            Output
          </TabsTrigger>
        </TabsList>
        <TabsContent value="input" className="flex-1 pt-4 overflow-auto">
          <InputControls
            advancedMode={advancedMode}
            config={config}
            onAdvancedModeChange={handleAdvancedModeChange}
            onConfigChange={handleConfigChange}
            onGenerate={handleGenerate}
          />
        </TabsContent>
        <TabsContent
          value="output"
          className="flex-1 pt-4 min-h-0 overflow-auto max-h-[calc(100vh-8.5rem)] max-w-[calc(100vw-2rem)]"
        >
          <OutputSection
            copied={copied}
            copiedMinified={copiedMinified}
            generatedJson={generatedJson}
            onCopy={handleCopy}
            onCopyMinified={handleCopyMinified}
            onDownload={handleDownload}
          />
        </TabsContent>
      </Tabs>
    )
  }

  // Desktop Layout - Side by Side
  return (
    <div className="h-full flex gap-8">
      {/* Left - Input Controls */}
      <div className="w-[250px] shrink-0 overflow-y-auto">
        <InputControls
          advancedMode={advancedMode}
          config={config}
          onAdvancedModeChange={handleAdvancedModeChange}
          onConfigChange={handleConfigChange}
          onGenerate={handleGenerate}
        />
      </div>

      {/* Right - Output */}
      <div className="flex-1 min-w-0 max-h-[calc(100vh-6.5rem)] overflow-y-auto">
        <OutputSection
          copied={copied}
          copiedMinified={copiedMinified}
          generatedJson={generatedJson}
          onCopy={handleCopy}
          onCopyMinified={handleCopyMinified}
          onDownload={handleDownload}
        />
      </div>
    </div>
  )
}

// Route export
export const Route = createFileRoute('/generate/json')({
  component: RandomJsonPage,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    const validStringStyles: StringStyle[] = ['words', 'realistic', 'lorem']
    const validKeyStyles: KeyStyle[] = ['camelCase', 'snake_case', 'words']
    const validIndentations: Indentation[] = ['2', '4', 'tab', 'minified']

    const parseNumber = (val: unknown, min: number, max: number, defaultVal?: number): number | undefined => {
      if (typeof val === 'number' && val >= min && val <= max) return val
      if (typeof val === 'string' && !isNaN(Number(val))) {
        return Math.min(max, Math.max(min, Number(val)))
      }
      return defaultVal
    }

    return {
      numKeys: parseNumber(search.numKeys, 1, 20),
      maxDepth: parseNumber(search.maxDepth, 0, 5),
      arrayProbability: parseNumber(search.arrayProbability, 0, 50),
      objectProbability: parseNumber(search.objectProbability, 0, 50),
      nullProbability: parseNumber(search.nullProbability, 0, 30),
      arrayMinLength: parseNumber(search.arrayMinLength, 0, 10),
      arrayMaxLength: parseNumber(search.arrayMaxLength, 1, 20),
      stringStyle: validStringStyles.includes(search.stringStyle as StringStyle)
        ? (search.stringStyle as StringStyle)
        : undefined,
      keyStyle: validKeyStyles.includes(search.keyStyle as KeyStyle)
        ? (search.keyStyle as KeyStyle)
        : undefined,
      numberMin: parseNumber(search.numberMin, -10000, 99999),
      numberMax: parseNumber(search.numberMax, -9999, 100000),
      includeFloats: typeof search.includeFloats === 'boolean' ? search.includeFloats : undefined,
      count: parseNumber(search.count, 1, 100),
      indentation: validIndentations.includes(search.indentation as Indentation)
        ? (search.indentation as Indentation)
        : undefined,
      seed: typeof search.seed === 'string' ? search.seed : undefined,
      advancedMode: typeof search.advancedMode === 'boolean' ? search.advancedMode : undefined,
    }
  },
})
