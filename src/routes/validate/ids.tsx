import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { validate as uuidValidate, version as uuidVersion } from 'uuid'
import { isCuid as isCuid2 } from '@paralleldrive/cuid2'
import { CheckIcon, XIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// Types
interface ValidationResult {
  type: string
  valid: boolean
  details?: string
}

// Helper functions
function isCuid(id: string): boolean {
  return /^c[a-z0-9]{24}$/.test(id)
}

function validateId(input: string): ValidationResult[] {
  const trimmed = input.trim()

  if (!trimmed) {
    return []
  }

  const results: ValidationResult[] = []

  // UUID validation
  const isValidUuid = uuidValidate(trimmed)
  if (isValidUuid) {
    const version = uuidVersion(trimmed)
    results.push({
      type: 'UUID',
      valid: true,
      details: `Version ${version}`,
    })
  } else {
    results.push({
      type: 'UUID',
      valid: false,
    })
  }

  // CUID validation
  const isValidCuid = isCuid(trimmed)
  results.push({
    type: 'CUID',
    valid: isValidCuid,
  })

  // CUID2 validation
  const isValidCuid2 = isCuid2(trimmed)
  results.push({
    type: 'CUID2',
    valid: isValidCuid2,
  })

  return results
}

// Main component
function ValidateIdsPage() {
  const [input, setInput] = useState('')
  const results = validateId(input)
  const hasInput = input.trim().length > 0
  const hasAnyValid = results.some((r) => r.valid)

  return (
    <div className="h-full flex flex-col items-center pt-8 md:pt-16">
      <div className="w-full max-w-xl space-y-6">
        {/* Input Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Paste an ID to validate
          </label>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
            className="font-mono text-sm"
            autoFocus
          />
        </div>

        {/* Results Section */}
        <div className="border rounded-lg overflow-hidden">
          {hasInput ? (
            <>
              {/* Header */}
              <div className="px-4 py-3 bg-muted/50 border-b">
                <span className="text-sm font-medium">
                  {hasAnyValid ? (
                    <span className="text-green-500">✓ Valid ID detected</span>
                  ) : (
                    <span className="text-red-500">✗ Not a recognized ID format</span>
                  )}
                </span>
              </div>

              {/* Results List */}
              <div className="divide-y">
                {results.map((result) => (
                  <div
                    key={result.type}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 transition-colors',
                      result.valid && 'bg-green-500/5'
                    )}
                  >
                    {result.valid ? (
                      <CheckIcon className="size-5 text-green-500 shrink-0" />
                    ) : (
                      <XIcon className="size-5 text-muted-foreground/50 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <span
                        className={cn(
                          'font-medium',
                          result.valid ? 'text-foreground' : 'text-muted-foreground/50'
                        )}
                      >
                        {result.type}
                      </span>
                      {result.details && (
                        <span className="ml-2 text-sm text-muted-foreground">
                          ({result.details})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-12 text-muted-foreground border-dashed">
              <p>Paste an ID above to validate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Route export
export const Route = createFileRoute('/validate/ids')({
  component: ValidateIdsPage,
})
