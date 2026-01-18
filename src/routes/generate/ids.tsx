import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { v1 as uuidv1, v3 as uuidv3, v4 as uuidv4, v5 as uuidv5, v6 as uuidv6, v7 as uuidv7 } from 'uuid'
// @ts-expect-error - @bugsnag/cuid has type export issues
import cuid from '@bugsnag/cuid'
import { createId as cuid2 } from '@paralleldrive/cuid2'
import { nanoid } from 'nanoid'
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
import { CheckIcon, CopyIcon } from 'lucide-react'

interface SearchParams {
  type?: IdType
  count?: number
  uuidVersion?: UuidVersion
  nanoidLength?: number
}

export const Route = createFileRoute('/generate/ids')({
  component: IdsPage,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    const validTypes: IdType[] = ['uuid', 'cuid', 'cuid2', 'nanoid']
    const validUuidVersions: UuidVersion[] = ['v1', 'v3', 'v4', 'v5', 'v6', 'v7']
    
    return {
      type: validTypes.includes(search.type as IdType) ? (search.type as IdType) : undefined,
      count: typeof search.count === 'number' && search.count >= 1 && search.count <= 100 
        ? search.count 
        : typeof search.count === 'string' && !isNaN(Number(search.count))
          ? Math.min(100, Math.max(1, Number(search.count)))
          : undefined,
      uuidVersion: validUuidVersions.includes(search.uuidVersion as UuidVersion) 
        ? (search.uuidVersion as UuidVersion) 
        : undefined,
      nanoidLength: typeof search.nanoidLength === 'number' && search.nanoidLength >= 1 && search.nanoidLength <= 256
        ? search.nanoidLength
        : typeof search.nanoidLength === 'string' && !isNaN(Number(search.nanoidLength))
          ? Math.min(256, Math.max(1, Number(search.nanoidLength)))
          : undefined,
    }
  },
})

type IdType = 'uuid' | 'cuid' | 'cuid2' | 'nanoid'
type UuidVersion = 'v1' | 'v3' | 'v4' | 'v5' | 'v6' | 'v7'

interface IdTypeOptions {
  uuid: { version: UuidVersion }
  nanoid: { length?: number }
}


const ID_TYPE_OPTIONS: { value: IdType; label: string; description: string }[] = [
  { value: 'uuid', label: 'UUID', description: 'Universally Unique Identifier' },
  { value: 'cuid', label: 'CUID', description: 'Collision-resistant ID' },
  { value: 'cuid2', label: 'CUID2', description: 'Next generation CUID' },
  { value: 'nanoid', label: 'Nanoid', description: 'Tiny, secure, URL-friendly' },
]

const UUID_VERSION_OPTIONS: { value: UuidVersion; label: string }[] = [
  { value: 'v1', label: 'v1 (Timestamp)' },
  { value: 'v3', label: 'v3 (MD5 Namespace)' },
  { value: 'v4', label: 'v4 (Random)' },
  { value: 'v5', label: 'v5 (SHA-1 Namespace)' },
  { value: 'v6', label: 'v6 (Reordered Time)' },
  { value: 'v7', label: 'v7 (Unix Epoch)' },
]

// Namespace for v3/v5 UUIDs (using URL namespace)
const UUID_NAMESPACE = '6ba7b811-9dad-11d1-80b4-00c04fd430c8'

function generateId(type: IdType, options: IdTypeOptions): string {
  switch (type) {
    case 'uuid':
      return generateUuid(options.uuid.version)
    case 'cuid':
      return cuid()
    case 'cuid2':
      return cuid2()
    case 'nanoid':
      return nanoid(options.nanoid.length)
  }
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

interface InputControlsProps {
  idType: IdType
  options: IdTypeOptions
  count: number
  onIdTypeChange: (type: IdType) => void
  onOptionsChange: (options: IdTypeOptions) => void
  onCountChange: (count: number) => void
  onGenerate: () => void
}

function InputControls({
  idType,
  options,
  count,
  onIdTypeChange,
  onOptionsChange,
  onCountChange,
  onGenerate,
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
        Generate
      </Button>
    </div>
  )
}

interface OutputSectionProps {
  generatedIds: string[]
  copiedAll: boolean
  copiedIndex: number | null
  onCopyAll: () => void
  onCopySingle: (id: string, index: number) => void
}

function OutputSection({
  generatedIds,
  copiedAll,
  copiedIndex,
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

// Helper to generate initial IDs
function generateInitialIds(type: IdType, options: IdTypeOptions, count: number): string[] {
  const ids: string[] = []
  for (let i = 0; i < count; i++) {
    ids.push(generateId(type, options))
  }
  return ids
}

function IdsPage() {
  const isMobile = useIsMobile()
  const navigate = useNavigate({ from: '/generate/ids' })
  const search = Route.useSearch()
  
  // Initialize state from search params or defaults
  const initialType = search.type ?? 'uuid'
  const initialOptions: IdTypeOptions = {
    uuid: { version: search.uuidVersion ?? 'v4' },
    nanoid: { length: search.nanoidLength },
  }
  const initialCount = search.count ?? 1

  const [idType, setIdType] = useState<IdType>(initialType)
  const [options, setOptions] = useState<IdTypeOptions>(initialOptions)
  const [count, setCount] = useState<number>(initialCount)
  const [generatedIds, setGeneratedIds] = useState<string[]>(() => 
    generateInitialIds(initialType, initialOptions, initialCount)
  )
  const [copiedAll, setCopiedAll] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState('input')

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

  const handleIdTypeChange = (type: IdType) => {
    setIdType(type)
    updateSearchParams({ type })
  }

  const handleOptionsChange = (newOptions: IdTypeOptions) => {
    setOptions(newOptions)
    updateSearchParams({
      uuidVersion: newOptions.uuid.version,
      nanoidLength: newOptions.nanoid.length,
    })
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
            idType={idType}
            options={options}
            count={count}
            onIdTypeChange={handleIdTypeChange}
            onOptionsChange={handleOptionsChange}
            onCountChange={handleCountChange}
            onGenerate={handleGenerate}
          />
        </TabsContent>
        <TabsContent value="output" className="flex-1 pt-4 min-h-0 overflow-auto max-h-[calc(100vh-8.5rem)] max-w-[calc(100vw-2rem)]">
          <OutputSection
            generatedIds={generatedIds}
            copiedAll={copiedAll}
            copiedIndex={copiedIndex}
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
          idType={idType}
          options={options}
          count={count}
          onIdTypeChange={handleIdTypeChange}
          onOptionsChange={handleOptionsChange}
          onCountChange={handleCountChange}
          onGenerate={handleGenerate}
        />
      </div>

      {/* Right - Output */}
      <div className="flex-1 min-w-0 max-h-[calc(100vh-6rem)] overflow-y-auto">
        <OutputSection
          generatedIds={generatedIds}
          copiedAll={copiedAll}
          copiedIndex={copiedIndex}
          onCopyAll={handleCopyAll}
          onCopySingle={handleCopySingle}
        />
      </div>
    </div>
  )
}
