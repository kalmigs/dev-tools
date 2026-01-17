import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/strings/json-format')({
  component: JsonFormatPage,
})

function JsonFormatPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">JSON Format</h1>
      <p className="text-muted-foreground text-lg">Format and prettify JSON data.</p>
    </div>
  )
}
