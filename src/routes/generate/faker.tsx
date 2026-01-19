import { useState } from 'react'
import { faker } from '@faker-js/faker/locale/en'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { CheckIcon, ChevronsUpDownIcon, CopyIcon, ShuffleIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { NumberInput } from '@/components/ui/number-input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

// Types
type Category = 'person' | 'internet' | 'location' | 'commerce' | 'finance' | 'date' | 'lorem' | 'phone'

interface CategoryConfig {
  icon: string
  label: string
  value: Category
}

interface DataTypeConfig {
  generate: () => string
  label: string
  value: string
}

interface DataTypeOptions {
  lorem: { paragraphSentences: number; sentenceCount: number; wordCount: number }
}

interface InputControlsProps {
  category: Category
  count: number
  dataType: string
  onCategoryChange: (category: Category) => void
  onCountChange: (count: number) => void
  onDataTypeChange: (type: string) => void
  onGenerate: () => void
  onOptionsChange: (options: DataTypeOptions) => void
  options: DataTypeOptions
}

interface OutputSectionProps {
  category: Category
  copiedAll: boolean
  copiedIndex: number | null
  dataType: string
  generatedData: string[]
  onCopyAll: () => void
  onCopySingle: (item: string, index: number) => void
}

interface SearchParams {
  category?: Category
  count?: number
  paragraphSentences?: number
  sentenceCount?: number
  type?: string
  wordCount?: number
}

// Constants
const CATEGORIES: CategoryConfig[] = [
  { icon: '👤', label: 'Person', value: 'person' },
  { icon: '🌐', label: 'Internet', value: 'internet' },
  { icon: '📍', label: 'Location', value: 'location' },
  { icon: '🛒', label: 'Commerce', value: 'commerce' },
  { icon: '💳', label: 'Finance', value: 'finance' },
  { icon: '📅', label: 'Date & Time', value: 'date' },
  { icon: '📝', label: 'Lorem', value: 'lorem' },
  { icon: '📞', label: 'Phone', value: 'phone' },
]

const DATA_TYPES: Record<Category, DataTypeConfig[]> = {
  person: [
    { generate: () => faker.person.fullName(), label: 'Full Name', value: 'fullName' },
    { generate: () => faker.person.firstName(), label: 'First Name', value: 'firstName' },
    { generate: () => faker.person.lastName(), label: 'Last Name', value: 'lastName' },
    { generate: () => faker.person.jobTitle(), label: 'Job Title', value: 'jobTitle' },
    { generate: () => faker.person.jobArea(), label: 'Job Area', value: 'jobArea' },
    { generate: () => faker.person.bio(), label: 'Bio', value: 'bio' },
    { generate: () => faker.person.gender(), label: 'Gender', value: 'gender' },
    { generate: () => faker.person.prefix(), label: 'Prefix', value: 'prefix' },
  ],
  internet: [
    { generate: () => faker.internet.email(), label: 'Email', value: 'email' },
    { generate: () => faker.internet.username(), label: 'Username', value: 'username' },
    { generate: () => faker.internet.password(), label: 'Password', value: 'password' },
    { generate: () => faker.internet.url(), label: 'URL', value: 'url' },
    { generate: () => faker.internet.domainName(), label: 'Domain Name', value: 'domainName' },
    { generate: () => faker.internet.ipv4(), label: 'IPv4', value: 'ipv4' },
    { generate: () => faker.internet.ipv6(), label: 'IPv6', value: 'ipv6' },
    { generate: () => faker.internet.mac(), label: 'MAC Address', value: 'mac' },
    { generate: () => faker.internet.userAgent(), label: 'User Agent', value: 'userAgent' },
  ],
  location: [
    { generate: () => faker.location.streetAddress(), label: 'Street Address', value: 'streetAddress' },
    { generate: () => faker.location.city(), label: 'City', value: 'city' },
    { generate: () => faker.location.state(), label: 'State', value: 'state' },
    { generate: () => faker.location.country(), label: 'Country', value: 'country' },
    { generate: () => faker.location.zipCode(), label: 'Zip Code', value: 'zipCode' },
    { generate: () => faker.location.latitude().toString(), label: 'Latitude', value: 'latitude' },
    { generate: () => faker.location.longitude().toString(), label: 'Longitude', value: 'longitude' },
    { generate: () => faker.location.timeZone(), label: 'Time Zone', value: 'timeZone' },
  ],
  commerce: [
    { generate: () => faker.commerce.productName(), label: 'Product Name', value: 'productName' },
    { generate: () => faker.commerce.productDescription(), label: 'Product Description', value: 'productDescription' },
    { generate: () => `$${faker.commerce.price()}`, label: 'Price', value: 'price' },
    { generate: () => faker.commerce.department(), label: 'Department', value: 'department' },
    { generate: () => faker.commerce.isbn(), label: 'ISBN', value: 'isbn' },
  ],
  finance: [
    { generate: () => faker.finance.accountNumber(), label: 'Account Number', value: 'accountNumber' },
    { generate: () => faker.finance.creditCardNumber(), label: 'Credit Card', value: 'creditCardNumber' },
    { generate: () => faker.finance.creditCardCVV(), label: 'Credit Card CVV', value: 'creditCardCVV' },
    { generate: () => faker.finance.currencyCode(), label: 'Currency Code', value: 'currencyCode' },
    { generate: () => faker.finance.currencyName(), label: 'Currency Name', value: 'currencyName' },
    { generate: () => faker.finance.bitcoinAddress(), label: 'Bitcoin Address', value: 'bitcoinAddress' },
    { generate: () => faker.finance.ethereumAddress(), label: 'Ethereum Address', value: 'ethereumAddress' },
    { generate: () => faker.finance.iban(), label: 'IBAN', value: 'iban' },
    { generate: () => faker.finance.bic(), label: 'BIC', value: 'bic' },
  ],
  date: [
    { generate: () => faker.date.past().toISOString(), label: 'Past Date', value: 'past' },
    { generate: () => faker.date.future().toISOString(), label: 'Future Date', value: 'future' },
    { generate: () => faker.date.recent().toISOString(), label: 'Recent Date', value: 'recent' },
    { generate: () => faker.date.birthdate().toISOString().split('T')[0], label: 'Birthdate', value: 'birthdate' },
    { generate: () => faker.date.weekday(), label: 'Weekday', value: 'weekday' },
    { generate: () => faker.date.month(), label: 'Month', value: 'month' },
  ],
  lorem: [
    { generate: () => faker.lorem.word(), label: 'Word', value: 'word' },
    { generate: () => '', label: 'Words', value: 'words' }, // Uses options.lorem.wordCount
    { generate: () => faker.lorem.sentence(), label: 'Sentence', value: 'sentence' },
    { generate: () => '', label: 'Sentences', value: 'sentences' }, // Uses options.lorem.sentenceCount
    { generate: () => '', label: 'Paragraph', value: 'paragraph' }, // Uses options.lorem.paragraphSentences
    { generate: () => faker.lorem.slug(), label: 'Slug', value: 'slug' },
  ],
  phone: [
    { generate: () => faker.phone.number(), label: 'Phone Number', value: 'number' },
    { generate: () => faker.phone.imei(), label: 'IMEI', value: 'imei' },
  ],
}

// Helper functions
function getDefaultDataType(category: Category): string {
  return DATA_TYPES[category][0].value
}

function generateData(category: Category, dataType: string, count: number, options: DataTypeOptions): string[] {
  const typeConfig = DATA_TYPES[category].find((t) => t.value === dataType)
  if (!typeConfig) return []

  const results: string[] = []
  for (let i = 0; i < count; i++) {
    // Handle special cases with options
    if (category === 'lorem') {
      if (dataType === 'words') {
        results.push(faker.lorem.words(options.lorem.wordCount))
      } else if (dataType === 'sentences') {
        results.push(faker.lorem.sentences(options.lorem.sentenceCount))
      } else if (dataType === 'paragraph') {
        results.push(faker.lorem.paragraph(options.lorem.paragraphSentences))
      } else {
        results.push(typeConfig.generate())
      }
    } else {
      results.push(typeConfig.generate())
    }
  }
  return results
}

// Subcomponents
function InputControls({
  category,
  count,
  dataType,
  onCategoryChange,
  onCountChange,
  onDataTypeChange,
  onGenerate,
  onOptionsChange,
  options,
}: InputControlsProps) {
  const [categoryOpen, setCategoryOpen] = useState(false)
  const dataTypes = DATA_TYPES[category]
  const selectedCategory = CATEGORIES.find((cat) => cat.value === category)

  return (
    <div className="flex flex-col gap-6">
      {/* Category Selector (Combobox) */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground">Category</label>
        <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={categoryOpen}
              className="w-[200px] justify-between"
            >
              {selectedCategory ? (
                <span className="flex items-center gap-2">
                  <span>{selectedCategory.icon}</span>
                  <span>{selectedCategory.label}</span>
                </span>
              ) : (
                'Select category...'
              )}
              <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search category..." />
              <CommandList>
                <CommandEmpty>No category found.</CommandEmpty>
                <CommandGroup>
                  {CATEGORIES.map((cat) => (
                    <CommandItem
                      key={cat.value}
                      value={cat.value}
                      onSelect={(value) => {
                        onCategoryChange(value as Category)
                        setCategoryOpen(false)
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </span>
                      <CheckIcon
                        className={cn(
                          'ml-auto size-4',
                          category === cat.value ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Data Type Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground">Data Type</label>
        <Select value={dataType} onValueChange={onDataTypeChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {dataTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Type-specific Options */}
      {category === 'lorem' && dataType === 'words' && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground">Word Count</label>
          <div className="w-[100px]">
            <NumberInput
              value={options.lorem.wordCount}
              onValueChange={(v) => onOptionsChange({ ...options, lorem: { ...options.lorem, wordCount: v ?? 3 } })}
              min={1}
              max={100}
              stepper={1}
              onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
            />
          </div>
        </div>
      )}

      {category === 'lorem' && dataType === 'sentences' && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground">Sentence Count</label>
          <div className="w-[100px]">
            <NumberInput
              value={options.lorem.sentenceCount}
              onValueChange={(v) => onOptionsChange({ ...options, lorem: { ...options.lorem, sentenceCount: v ?? 3 } })}
              min={1}
              max={20}
              stepper={1}
              onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
            />
          </div>
        </div>
      )}

      {category === 'lorem' && dataType === 'paragraph' && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground">Sentences per Paragraph</label>
          <div className="w-[100px]">
            <NumberInput
              value={options.lorem.paragraphSentences}
              onValueChange={(v) => onOptionsChange({ ...options, lorem: { ...options.lorem, paragraphSentences: v ?? 3 } })}
              min={1}
              max={20}
              stepper={1}
              onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
            />
          </div>
        </div>
      )}

      {/* Count Input */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground">Count</label>
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

      {/* Generate Button */}
      <Button onClick={onGenerate} className="w-fit gap-2">
        <ShuffleIcon className="size-4" />
        Generate
      </Button>
    </div>
  )
}

function OutputSection({
  category,
  copiedAll,
  copiedIndex,
  dataType,
  generatedData,
  onCopyAll,
  onCopySingle,
}: OutputSectionProps) {
  return (
    <div className="h-full flex flex-col">
      {generatedData.length > 0 ? (
        <div className="border rounded-lg overflow-hidden flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Generated Data ({generatedData.length})</span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {category}.{dataType}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={onCopyAll} className="gap-2">
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

          {/* Data List */}
          <div className="divide-y flex-1 overflow-y-auto min-h-0">
            {generatedData.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-2 py-2 hover:bg-muted/30 transition-colors group"
              >
                <div className="flex-1 min-w-0 overflow-x-auto">
                  <code className="text-sm font-mono whitespace-nowrap select-all">{item}</code>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onCopySingle(item, index)}
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
          <p>Generated data will appear here</p>
        </div>
      )}
    </div>
  )
}

// Main component
function FakerPage() {
  const isMobile = useIsMobile()
  const navigate = useNavigate({ from: '/generate/faker' })
  const search = Route.useSearch()

  // Initialize state from search params or defaults
  const initialCategory = search.category ?? 'person'
  const initialDataType = search.type ?? getDefaultDataType(initialCategory)
  const initialCount = search.count ?? 10
  const initialOptions: DataTypeOptions = {
    lorem: {
      paragraphSentences: search.paragraphSentences ?? 3,
      sentenceCount: search.sentenceCount ?? 3,
      wordCount: search.wordCount ?? 3,
    },
  }

  const [activeTab, setActiveTab] = useState('input')
  const [category, setCategory] = useState<Category>(initialCategory)
  const [copiedAll, setCopiedAll] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [count, setCount] = useState<number>(initialCount)
  const [dataType, setDataType] = useState<string>(initialDataType)
  const [generatedData, setGeneratedData] = useState<string[]>(() =>
    generateData(initialCategory, initialDataType, initialCount, initialOptions)
  )
  const [options, setOptions] = useState<DataTypeOptions>(initialOptions)

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

  const handleCategoryChange = (newCategory: Category) => {
    setCategory(newCategory)
    const newDataType = getDefaultDataType(newCategory)
    setDataType(newDataType)
    updateSearchParams({ category: newCategory, type: newDataType })
  }

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(generatedData.join('\n'))
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  const handleCopySingle = async (item: string, index: number) => {
    await navigator.clipboard.writeText(item)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleCountChange = (newCount: number) => {
    setCount(newCount)
    updateSearchParams({ count: newCount })
  }

  const handleDataTypeChange = (newType: string) => {
    setDataType(newType)
    updateSearchParams({ type: newType })
  }

  const handleGenerate = () => {
    const data = generateData(category, dataType, count, options)
    setGeneratedData(data)
    setCopiedAll(false)
    setCopiedIndex(null)
    // Switch to output tab on mobile
    if (isMobile) {
      setActiveTab('output')
    }
  }

  const handleOptionsChange = (newOptions: DataTypeOptions) => {
    setOptions(newOptions)
    updateSearchParams({
      paragraphSentences: newOptions.lorem.paragraphSentences,
      sentenceCount: newOptions.lorem.sentenceCount,
      wordCount: newOptions.lorem.wordCount,
    })
  }

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
            category={category}
            count={count}
            dataType={dataType}
            onCategoryChange={handleCategoryChange}
            onCountChange={handleCountChange}
            onDataTypeChange={handleDataTypeChange}
            onGenerate={handleGenerate}
            onOptionsChange={handleOptionsChange}
            options={options}
          />
        </TabsContent>
        <TabsContent
          value="output"
          className="flex-1 pt-4 min-h-0 overflow-auto max-h-[calc(100vh-8.5rem)] max-w-[calc(100vw-2rem)]"
        >
          <OutputSection
            category={category}
            copiedAll={copiedAll}
            copiedIndex={copiedIndex}
            dataType={dataType}
            generatedData={generatedData}
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
          category={category}
          count={count}
          dataType={dataType}
          onCategoryChange={handleCategoryChange}
          onCountChange={handleCountChange}
          onDataTypeChange={handleDataTypeChange}
          onGenerate={handleGenerate}
          onOptionsChange={handleOptionsChange}
          options={options}
        />
      </div>

      {/* Right - Output */}
      <div className="flex-1 min-w-0 max-h-[calc(100vh-6rem)] overflow-y-auto">
        <OutputSection
          category={category}
          copiedAll={copiedAll}
          copiedIndex={copiedIndex}
          dataType={dataType}
          generatedData={generatedData}
          onCopyAll={handleCopyAll}
          onCopySingle={handleCopySingle}
        />
      </div>
    </div>
  )
}

// Route export
export const Route = createFileRoute('/generate/faker')({
  component: FakerPage,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    const validCategories: Category[] = ['person', 'internet', 'location', 'commerce', 'finance', 'date', 'lorem', 'phone']

    const category = validCategories.includes(search.category as Category)
      ? (search.category as Category)
      : undefined

    return {
      category,
      count:
        typeof search.count === 'number' && search.count >= 1 && search.count <= 100
          ? search.count
          : typeof search.count === 'string' && !isNaN(Number(search.count))
            ? Math.min(100, Math.max(1, Number(search.count)))
            : undefined,
      paragraphSentences:
        typeof search.paragraphSentences === 'number' && search.paragraphSentences >= 1 && search.paragraphSentences <= 20
          ? search.paragraphSentences
          : typeof search.paragraphSentences === 'string' && !isNaN(Number(search.paragraphSentences))
            ? Math.min(20, Math.max(1, Number(search.paragraphSentences)))
            : undefined,
      sentenceCount:
        typeof search.sentenceCount === 'number' && search.sentenceCount >= 1 && search.sentenceCount <= 20
          ? search.sentenceCount
          : typeof search.sentenceCount === 'string' && !isNaN(Number(search.sentenceCount))
            ? Math.min(20, Math.max(1, Number(search.sentenceCount)))
            : undefined,
      type: typeof search.type === 'string' ? search.type : undefined,
      wordCount:
        typeof search.wordCount === 'number' && search.wordCount >= 1 && search.wordCount <= 100
          ? search.wordCount
          : typeof search.wordCount === 'string' && !isNaN(Number(search.wordCount))
            ? Math.min(100, Math.max(1, Number(search.wordCount)))
            : undefined,
    }
  },
})
