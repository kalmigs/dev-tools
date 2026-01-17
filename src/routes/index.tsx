import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="page">
      <h1>🏠 Home</h1>
      <p>Welcome to Dev Tools!</p>
    </div>
  )
}
