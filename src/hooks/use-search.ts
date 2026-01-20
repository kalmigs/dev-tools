import { useEffect, useMemo, useState } from 'react';
import Fuse, { type IFuseOptions, type FuseResultMatch } from 'fuse.js';
import { allPages, type PageInfo } from '@/lib/pages';

// Fuse.js configuration for fuzzy searching
const fuseOptions: IFuseOptions<PageInfo> = {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'description', weight: 0.25 },
    { name: 'keywords', weight: 0.2 },
    { name: 'tags', weight: 0.1 },
    { name: 'category', weight: 0.05 },
  ],
  threshold: 0.4, // 0 = exact match, 1 = match anything
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 1,
};

export interface SearchResult {
  item: PageInfo;
  score?: number;
  matches?: readonly FuseResultMatch[];
}

// Create fuse instance once
const fuse = new Fuse(allPages, fuseOptions);

// Perform search synchronously
function performSearch(query: string): SearchResult[] {
  if (!query.trim()) {
    // Show all pages when query is empty
    return allPages.map(item => ({ item }));
  }
  return fuse.search(query);
}

// Simple debounce hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function useSearch(query: string, debounceMs = 150) {
  const debouncedQuery = useDebounce(query, debounceMs);

  // Use useMemo for synchronous derived state
  const results = useMemo(() => {
    return performSearch(debouncedQuery);
  }, [debouncedQuery]);

  return {
    results,
    isSearching: query !== debouncedQuery,
  };
}
