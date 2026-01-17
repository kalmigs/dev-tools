import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from '@/components/ui/navigation-menu'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="px-2 py-2 border-b border-border bg-card">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/">
                {({ isActive }) => (
                  <NavigationMenuLink active={isActive}>
                    Home
                  </NavigationMenuLink>
                )}
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Generate</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-48 gap-1 p-2">
                  <li>
                    <Link to="/generate/ids">
                      <NavigationMenuLink>
                        <div className="font-medium">IDs</div>
                        <p className="text-muted-foreground text-xs">
                          UUIDs, CUIDs, and more
                        </p>
                      </NavigationMenuLink>
                    </Link>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Strings</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-48 gap-1 p-2">
                  <li>
                    <Link to="/strings/json-format">
                      <NavigationMenuLink>
                        <div className="font-medium">JSON Format</div>
                        <p className="text-muted-foreground text-xs">
                          Format and prettify JSON
                        </p>
                      </NavigationMenuLink>
                    </Link>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </nav>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </div>
  )
}
