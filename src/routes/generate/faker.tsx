import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/generate/faker')({
  component: FakerPage,
})

function FakerPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">🎭 Faker</h1>
      <p className="text-muted-foreground text-lg">Generate fake data for testing and development.</p>
    </div>
  )
}
