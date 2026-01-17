import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex gap-4 px-6 py-4 border-b border-border bg-card">
        <Link
          to="/"
          className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors font-medium [&.active]:text-primary [&.active]:bg-primary/10"
          activeProps={{ className: 'active' }}
        >
          Home
        </Link>
        <Link
          to="/about"
          className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors font-medium [&.active]:text-primary [&.active]:bg-primary/10"
          activeProps={{ className: 'active' }}
        >
          About
        </Link>
      </nav>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </div>
  )
}
