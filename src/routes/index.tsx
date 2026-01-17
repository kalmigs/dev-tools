import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">🏠 Home</h1>
      <p className="text-muted-foreground text-lg">Welcome to Dev Tools!</p>
    </div>
  )
}
