import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useSearch } from '@/hooks/use-search';
import { type PageInfo } from '@/lib/pages';

// Detect if user is on Mac
function useIsMac() {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  return isMac;
}

// Group pages by category
function groupByCategory(pages: PageInfo[]): Record<string, PageInfo[]> {
  return pages.reduce(
    (acc, page) => {
      if (!acc[page.category]) {
        acc[page.category] = [];
      }
      acc[page.category].push(page);
      return acc;
    },
    {} as Record<string, PageInfo[]>,
  );
}

// Keyboard shortcut display component
function KeyboardShortcut({ isMac }: { isMac: boolean }) {
  return (
    <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
      {isMac ? '⌘' : 'Ctrl'}
      <span className="text-xs">K</span>
    </kbd>
  );
}

// Search trigger button
export function SearchTrigger({ onClick }: { onClick: () => void }) {
  const isMac = useIsMac();

  return (
    <Button
      variant="outline"
      className="relative h-9 w-9 p-0 xl:h-9 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
      onClick={onClick}
    >
      <Search className="h-4 w-4 xl:mr-2" />
      <span className="hidden xl:inline-flex text-muted-foreground">Search pages...</span>
      <span className="sr-only">Search pages</span>
      <span className="hidden xl:flex absolute right-1.5 top-1/2 -translate-y-1/2">
        <KeyboardShortcut isMac={isMac} />
      </span>
    </Button>
  );
}

// Mobile search trigger (icon only)
export function MobileSearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" onClick={onClick} aria-label="Search pages">
      <Search className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Search pages</span>
    </Button>
  );
}

// Main global search component
export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { results } = useSearch(query);
  const navigate = useNavigate();
  const isMac = useIsMac();

  // Handle keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(open => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Handle page selection
  const handleSelect = useCallback(
    (page: PageInfo) => {
      setOpen(false);
      setQuery('');
      navigate({ to: page.route });
    },
    [navigate],
  );

  // Reset query when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  // Group results by category
  const groupedResults = groupByCategory(results.map(r => r.item));

  // Define category order
  const categoryOrder = ['Navigation', 'Generate', 'Strings', 'Validate', 'Inspect'];
  const sortedCategories = Object.keys(groupedResults).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b),
  );

  return (
    <>
      {/* Desktop trigger */}
      <div className="hidden md:flex">
        <SearchTrigger onClick={() => setOpen(true)} />
      </div>

      {/* Mobile trigger */}
      <div className="flex md:hidden">
        <MobileSearchTrigger onClick={() => setOpen(true)} />
      </div>

      {/* Search dialog */}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search Pages"
        description="Search for a page by name, description, or keywords"
        showCloseButton={false}
      >
        <CommandInput
          placeholder={`Search pages... ${isMac ? '⌘K' : 'Ctrl+K'}`}
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No pages found.</CommandEmpty>
          {sortedCategories.map(category => (
            <CommandGroup key={category} heading={category}>
              {groupedResults[category].map(page => (
                <CommandItem
                  key={page.route}
                  value={`${page.title} ${page.description} ${page.keywords.join(' ')}`}
                  onSelect={() => handleSelect(page)}
                  className="cursor-pointer"
                >
                  <page.icon className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="font-medium">{page.title}</span>
                    <span className="text-xs text-muted-foreground">{page.description}</span>
                  </div>
                  {page.tags.length > 0 && (
                    <div className="ml-auto flex gap-1">
                      {page.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}

// Export hook for external control
export function useGlobalSearch() {
  const [open, setOpen] = useState(false);

  // Handle keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(open => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return { open, setOpen };
}
