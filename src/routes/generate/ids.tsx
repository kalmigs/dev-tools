import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/generate/ids')({
  component: IdsPage,
})

function IdsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">ℹ️ IDs</h1>
      <p className="text-muted-foreground text-lg">Generate UUIDs, CUIDs, and more.</p>
    </div>
  )
}
