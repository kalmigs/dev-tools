import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/strings/compare')({
  component: ComparePage,
})

function ComparePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">Compare</h1>
      <p className="text-muted-foreground text-lg">Compare and diff strings or text.</p>
    </div>
  )
}
