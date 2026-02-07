import { useEffect, useState } from 'react';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { NotFound } from '@/components/errors/not-found';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { TopNav } from '@/components/layout/TopNav';

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

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopNav onToggleTheme={toggleTheme} theme={theme} />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </SidebarInset>
      <Toaster />
      <TanStackRouterDevtools />
    </SidebarProvider>
  );
}

// Route export
export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});
