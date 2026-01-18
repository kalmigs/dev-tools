import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
// @ts-expect-error - @bugsnag/cuid has type export issues
import cuid from '@bugsnag/cuid'
import { nanoid } from 'nanoid'
import { createId as cuid2 } from '@paralleldrive/cuid2'
import { v1 as uuidv1, v3 as uuidv3, v4 as uuidv4, v5 as uuidv5, v6 as uuidv6, v7 as uuidv7 } from 'uuid'
import { CheckIcon, CopyIcon, ShuffleIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NumberInput } from '@/components/ui/number-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useIsMobile } from '@/hooks/use-mobile'

// Types
type IdType = 'cuid' | 'cuid2' | 'nanoid' | 'uuid'
type UuidVersion = 'v1' | 'v3' | 'v4' | 'v5' | 'v6' | 'v7'

interface IdTypeOptions {
  nanoid: { length?: number }
  uuid: { version: UuidVersion }
}

interface InputControlsProps {
  count: number
  idType: IdType
  onCountChange: (count: number) => void
  onGenerate: () => void
  onIdTypeChange: (type: IdType) => void
  onOptionsChange: (options: IdTypeOptions) => void
  options: IdTypeOptions
}

interface OutputSectionProps {
  copiedAll: boolean
  copiedIndex: number | null
  generatedIds: string[]
  onCopyAll: () => void
  onCopySingle: (id: string, index: number) => void
}

interface SearchParams {
  count?: number
  nanoidLength?: number
  type?: IdType
  uuidVersion?: UuidVersion
}

// Constants
const ID_TYPE_OPTIONS: { description: string; label: string; value: IdType }[] = [
  { description: 'Collision-resistant ID', label: 'CUID', value: 'cuid' },
  { description: 'Next generation CUID', label: 'CUID2', value: 'cuid2' },
  { description: 'Tiny, secure, URL-friendly', label: 'Nanoid', value: 'nanoid' },
  { description: 'Universally Unique Identifier', label: 'UUID', value: 'uuid' },
]

const UUID_NAMESPACE = '6ba7b811-9dad-11d1-80b4-00c04fd430c8'

const UUID_VERSION_OPTIONS: { label: string; value: UuidVersion }[] = [
  { label: 'v1 (Timestamp)', value: 'v1' },
  { label: 'v3 (MD5 Namespace)', value: 'v3' },
  { label: 'v4 (Random)', value: 'v4' },
  { label: 'v5 (SHA-1 Namespace)', value: 'v5' },
  { label: 'v6 (Reordered Time)', value: 'v6' },
  { label: 'v7 (Unix Epoch)', value: 'v7' },
]

// Helper functions
function generateId(type: IdType, options: IdTypeOptions): string {
  switch (type) {
    case 'cuid':
      return cuid()
    case 'cuid2':
      return cuid2()
    case 'nanoid':
      return nanoid(options.nanoid.length)
    case 'uuid':
      return generateUuid(options.uuid.version)
  }
}

function generateInitialIds(type: IdType, options: IdTypeOptions, count: number): string[] {
  const ids: string[] = []
  for (let i = 0; i < count; i++) {
    ids.push(generateId(type, options))
  }
  return ids
}

function generateUuid(version: UuidVersion): string {
  switch (version) {
    case 'v1':
      return uuidv1()
    case 'v3':
      return uuidv3(crypto.randomUUID(), UUID_NAMESPACE)
    case 'v4':
      return uuidv4()
    case 'v5':
      return uuidv5(crypto.randomUUID(), UUID_NAMESPACE)
    case 'v6':
      return uuidv6()
    case 'v7':
      return uuidv7()
  }
}

// Subcomponents
function InputControls({
  count,
  idType,
  onCountChange,
  onGenerate,
  onIdTypeChange,
  onOptionsChange,
  options,
}: InputControlsProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* ID Type Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground">
          ID Type
        </label>
        <Select value={idType} onValueChange={(v) => onIdTypeChange(v as IdType)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select ID type" />
          </SelectTrigger>
          <SelectContent>
            {ID_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Count Input */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground">
          Count
        </label>
        <div className="w-[100px]">
          <NumberInput
            value={count}
            onValueChange={(v) => onCountChange(v ?? 1)}
            min={1}
            max={100}
            stepper={1}
            onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
          />
        </div>
      </div>

      {/* Type-specific Options */}
      {idType === 'uuid' && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground">
            Version
          </label>
          <Select
            value={options.uuid.version}
            onValueChange={(v) => onOptionsChange({ ...options, uuid: { ...options.uuid, version: v as UuidVersion } })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select version" />
            </SelectTrigger>
            <SelectContent>
              {UUID_VERSION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {idType === 'nanoid' && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground">
            Length
          </label>
          <div className="w-[100px]">
            <NumberInput
              value={options.nanoid.length}
              onValueChange={(v) => onOptionsChange({ ...options, nanoid: { ...options.nanoid, length: v } })}
              min={1}
              max={256}
              stepper={1}
              placeholder="21"
              onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
            />
          </div>
        </div>
      )}

      {/* Generate Button */}
      <Button onClick={onGenerate} className="w-fit">
        <ShuffleIcon className="size-4" />
        Generate
      </Button>
    </div>
  )
}

function OutputSection({
  copiedAll,
  copiedIndex,
  generatedIds,
  onCopyAll,
  onCopySingle,
}: OutputSectionProps) {
  return (
    <div className="h-full flex flex-col">
      {generatedIds.length > 0 ? (
        <div className="border rounded-lg overflow-hidden flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b shrink-0">
            <span className="text-sm font-medium">
              Generated IDs ({generatedIds.length})
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onCopyAll}
              className="gap-2"
            >
              {copiedAll ? (
                <>
                  <CheckIcon className="size-4 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <CopyIcon className="size-4" />
                  Copy All
                </>
              )}
            </Button>
          </div>

          {/* ID List */}
          <div className="divide-y flex-1 overflow-y-auto min-h-0">
            {generatedIds.map((id, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-2 py-0.5 hover:bg-muted/30 transition-colors group"
              >
                <div className="flex-1 min-w-0 overflow-x-auto">
                  <code className="text-sm font-mono whitespace-nowrap select-all">{id}</code>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onCopySingle(id, index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                >
                  {copiedIndex === index ? (
                    <CheckIcon className="size-4 text-green-500" />
                  ) : (
                    <CopyIcon className="size-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground border rounded-lg border-dashed">
          <p>Generated IDs will appear here</p>
        </div>
      )}
    </div>
  )
}

// Main component
function IdsPage() {
  const isMobile = useIsMobile()
  const navigate = useNavigate({ from: '/generate/ids' })
  const search = Route.useSearch()

  // Initialize state from search params or defaults
  const initialType = search.type ?? 'uuid'
  const initialOptions: IdTypeOptions = {
    nanoid: { length: search.nanoidLength },
    uuid: { version: search.uuidVersion ?? 'v4' },
  }
  const initialCount = search.count ?? 1

  const [activeTab, setActiveTab] = useState('input')
  const [copiedAll, setCopiedAll] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [count, setCount] = useState<number>(initialCount)
  const [generatedIds, setGeneratedIds] = useState<string[]>(() =>
    generateInitialIds(initialType, initialOptions, initialCount)
  )
  const [idType, setIdType] = useState<IdType>(initialType)
  const [options, setOptions] = useState<IdTypeOptions>(initialOptions)

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

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(generatedIds.join('\n'))
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  const handleCopySingle = async (id: string, index: number) => {
    await navigator.clipboard.writeText(id)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleCountChange = (newCount: number) => {
    setCount(newCount)
    updateSearchParams({ count: newCount })
  }

  const handleGenerate = () => {
    const ids: string[] = []
    for (let i = 0; i < count; i++) {
      ids.push(generateId(idType, options))
    }
    setGeneratedIds(ids)
    setCopiedAll(false)
    setCopiedIndex(null)
    // Switch to output tab on mobile
    if (isMobile) {
      setActiveTab('output')
    }
  }

  const handleIdTypeChange = (type: IdType) => {
    setIdType(type)
    updateSearchParams({ type })
  }

  const handleOptionsChange = (newOptions: IdTypeOptions) => {
    setOptions(newOptions)
    updateSearchParams({
      nanoidLength: newOptions.nanoid.length,
      uuidVersion: newOptions.uuid.version,
    })
  }

  // Mobile Layout with Tabs
  if (isMobile) {
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <TabsList className="w-full">
          <TabsTrigger value="input" className="flex-1">Input</TabsTrigger>
          <TabsTrigger value="output" className="flex-1">Output</TabsTrigger>
        </TabsList>
        <TabsContent value="input" className="flex-1 pt-4">
          <InputControls
            count={count}
            idType={idType}
            onCountChange={handleCountChange}
            onGenerate={handleGenerate}
            onIdTypeChange={handleIdTypeChange}
            onOptionsChange={handleOptionsChange}
            options={options}
          />
        </TabsContent>
        <TabsContent value="output" className="flex-1 pt-4 min-h-0 overflow-auto max-h-[calc(100vh-8.5rem)] max-w-[calc(100vw-2rem)]">
          <OutputSection
            copiedAll={copiedAll}
            copiedIndex={copiedIndex}
            generatedIds={generatedIds}
            onCopyAll={handleCopyAll}
            onCopySingle={handleCopySingle}
          />
        </TabsContent>
      </Tabs>
    )
  }

  // Desktop Layout - Side by Side
  return (
    <div className="h-full flex gap-8">
      {/* Left - Input Controls */}
      <div className="w-[250px] shrink-0">
        <InputControls
          count={count}
          idType={idType}
          onCountChange={handleCountChange}
          onGenerate={handleGenerate}
          onIdTypeChange={handleIdTypeChange}
          onOptionsChange={handleOptionsChange}
          options={options}
        />
      </div>

      {/* Right - Output */}
      <div className="flex-1 min-w-0 max-h-[calc(100vh-6rem)] overflow-y-auto">
        <OutputSection
          copiedAll={copiedAll}
          copiedIndex={copiedIndex}
          generatedIds={generatedIds}
          onCopyAll={handleCopyAll}
          onCopySingle={handleCopySingle}
        />
      </div>
    </div>
  )
}

// Route export
export const Route = createFileRoute('/generate/ids')({
  component: IdsPage,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    const validTypes: IdType[] = ['cuid', 'cuid2', 'nanoid', 'uuid']
    const validUuidVersions: UuidVersion[] = ['v1', 'v3', 'v4', 'v5', 'v6', 'v7']

    return {
      count: typeof search.count === 'number' && search.count >= 1 && search.count <= 100
        ? search.count
        : typeof search.count === 'string' && !isNaN(Number(search.count))
          ? Math.min(100, Math.max(1, Number(search.count)))
          : undefined,
      nanoidLength: typeof search.nanoidLength === 'number' && search.nanoidLength >= 1 && search.nanoidLength <= 256
        ? search.nanoidLength
        : typeof search.nanoidLength === 'string' && !isNaN(Number(search.nanoidLength))
          ? Math.min(256, Math.max(1, Number(search.nanoidLength)))
          : undefined,
      type: validTypes.includes(search.type as IdType) ? (search.type as IdType) : undefined,
      uuidVersion: validUuidVersions.includes(search.uuidVersion as UuidVersion)
        ? (search.uuidVersion as UuidVersion)
        : undefined,
    }
  },
})
