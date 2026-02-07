import { Link } from '@tanstack/react-router';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { GlobalSearch } from '@/components/global-search';

// Types
interface TopNavProps {
  onToggleTheme: () => void;
  theme: 'light' | 'dark';
}

// Main component
export function TopNav({ onToggleTheme, theme }: TopNavProps) {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
      <SidebarTrigger />

      <Link to="/" className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">
          DT
        </div>
        <span className="font-semibold">Dev Tools</span>
      </Link>

      <nav className="ml-auto flex items-center gap-1">
        <GlobalSearch />
        <Button variant="ghost" size="icon" onClick={onToggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </nav>
    </header>
  );
}
