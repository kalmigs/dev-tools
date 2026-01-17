import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <>
      <nav className="nav">
        <Link to="/" className="nav-link" activeProps={{ className: 'nav-link active' }}>
          Home
        </Link>
        <Link to="/about" className="nav-link" activeProps={{ className: 'nav-link active' }}>
          About
        </Link>
      </nav>
      <main className="main">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </>
  )
}
