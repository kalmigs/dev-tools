import { useEffect, useState } from 'react';
import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { NotFound } from '@/components/errors/not-found';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

// Subcomponents
function DesktopNav({ onToggleTheme }: { onToggleTheme: () => void }) {
  return (
    <nav className="px-2 py-2 border-b border-border bg-card flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            DT
          </div>
          <span className="font-semibold text-lg">Dev Tools</span>
        </Link>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Generate</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-48 gap-1 p-2">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link to="/generate/faker">
                        <div className="font-medium">Faker</div>
                        <p className="text-muted-foreground text-xs">Generate fake data</p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link to="/generate/ids">
                        <div className="font-medium">IDs</div>
                        <p className="text-muted-foreground text-xs">UUIDs, CUIDs, and more</p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link to="/generate/json">
                        <div className="font-medium">JSON</div>
                        <p className="text-muted-foreground text-xs">Random JSON structures</p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Strings</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-48 gap-1 p-2">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link to="/strings/compare">
                        <div className="font-medium">Compare</div>
                        <p className="text-muted-foreground text-xs">Compare and diff text</p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link to="/strings/json-format">
                        <div className="font-medium">JSON Format</div>
                        <p className="text-muted-foreground text-xs">Format and prettify JSON</p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Validate</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-48 gap-1 p-2">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link to="/validate/ids">
                        <div className="font-medium">IDs</div>
                        <p className="text-muted-foreground text-xs">Validate ID formats</p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <ThemeToggle onClick={onToggleTheme} />
    </nav>
  );
}

function MobileNav({ onToggleTheme }: { onToggleTheme: () => void }) {
  return (
    <nav className="px-2 py-2 border-b border-border bg-card flex items-center justify-between">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">
            DT
          </div>
          <span className="font-semibold text-lg">Dev Tools</span>
        </Link>
      </div>
      <ThemeToggle onClick={onToggleTheme} />
    </nav>
  );
}

function ThemeToggle({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" onClick={onClick} aria-label="Toggle theme">
      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

// Main component
function RootLayout() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (stored) return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const isMobile = useIsMobile();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  // Render with SidebarProvider for mobile
  if (isMobile) {
    return (
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
        <div className="min-h-screen flex flex-col flex-1">
          <MobileNav onToggleTheme={toggleTheme} />
          <main className="flex-1 p-4">
            <Outlet />
          </main>
        </div>
        <TanStackRouterDevtools />
      </SidebarProvider>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen flex flex-col">
      <DesktopNav onToggleTheme={toggleTheme} />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </div>
  );
}

// Route export
export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});
