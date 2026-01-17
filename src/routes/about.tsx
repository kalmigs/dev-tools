import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  return (
    <div className="page">
      <h1>ℹ️ About</h1>
      <p>This is a React app using TanStack Router, hosted on GitHub Pages.</p>
    </div>
  )
}
