import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">ℹ️ About</h1>
      <p className="text-muted-foreground text-lg">This is a React app using TanStack Router, hosted on GitHub Pages.</p>
    </div>
  )
}
