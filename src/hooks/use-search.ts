import { useMemo } from 'react';
import Fuse, { type IFuseOptions, type FuseResultMatch } from 'fuse.js';
import { allPages, type PageInfo } from '@/lib/pages';
import { useDebounce } from '@/hooks/use-debounce';

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
  useExtendedSearch: true, // Enable extended search for OR queries
};

export interface SearchResult {
  item: PageInfo;
  score?: number;
  matches?: readonly FuseResultMatch[];
}

// Create fuse instance once
const fuse = new Fuse(allPages, fuseOptions);

// Transform multi-word query into OR search (e.g., "strings compare" -> "strings | compare")
// Also handles path-like queries (e.g., "strings/compare" -> "strings | compare")
function transformQueryForExtendedSearch(query: string): string {
  // Split on whitespace or slash to handle both "strings compare" and "strings/compare"
  const words = query
    .trim()
    .split(/[\s/]+/)
    .filter(Boolean);
  if (words.length <= 1) {
    return query.trim();
  }
  // Use OR operator for multi-word queries so each word is searched independently
  return words.join(' | ');
}

// Perform search synchronously
function performSearch(query: string): SearchResult[] {
  if (!query.trim()) {
    // Show all pages when query is empty
    return allPages.map(item => ({ item }));
  }
  const extendedQuery = transformQueryForExtendedSearch(query);
  return fuse.search(extendedQuery);
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
