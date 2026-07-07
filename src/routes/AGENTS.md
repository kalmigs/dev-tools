# Routes

This directory holds TanStack Router file-based routes, grouped by category folder (`convert/`, `generate/`, `inspect/`, `strings/`, `validate/`). The router plugin auto-generates `../routeTree.gen.ts`; never hand-edit it. `src/main.tsx` uses `createHashHistory()` so URLs are `/#/path` (GitHub Pages compat).

## Creating a Route

```tsx
// src/routes/generate/uuid.tsx → /#/generate/uuid
import { createFileRoute } from '@tanstack/react-router';

function UuidPage() {
  return <div>UUID</div>;
}

export const Route = createFileRoute('/generate/uuid')({
  component: UuidPage,
});
```

Link with `import { Link } from '@tanstack/react-router'`, e.g. `<Link to="/generate/uuid" />`.

## Query Parameters (page state)

Persist every user-visible setting in URL search params so links are shareable and refresh-safe. This project validates with a hand-written `validateSearch` (there is no zod dependency).

```tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router';

// Types
interface SearchParams {
  count?: number;
  mode?: string;
}

// Main component
function ToolPage() {
  const navigate = useNavigate({ from: '/tool' });
  const search = Route.useSearch();

  const updateSearch = useCallback(
    (updates: Partial<SearchParams>) => {
      navigate({
        search: prev => ({ ...prev, ...updates }),
        replace: true,
      });
    },
    [navigate],
  );

  const value = search.count ?? DEFAULT_VALUE;
  return <Control value={value} onChange={v => updateSearch({ count: v })} />;
}

// Route export with validateSearch
export const Route = createFileRoute('/tool')({
  component: ToolPage,
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    count: typeof search.count === 'number' ? search.count : undefined,
    mode: typeof search.mode === 'string' ? search.mode : undefined,
  }),
});
```

Guidelines:

- `replace: true` on every update so the back button doesn't fill with slider drags.
- Validate every param in `validateSearch`; fall back to `undefined` for anything invalid so a bad URL can't crash the route.
- Provide defaults when params are undefined; keep names short but descriptive.

## Adding a New Page

Before implementing, answer: how to implement it, which packages (if any) are needed, what options it should have, and the ideal route path.

**Required: show an ASCII layout for desktop and mobile (plus any dialogs) before writing code.**

```
┌─────────────────────────────┐
│  TopNav                     │
├─────────────────────────────┤
│                             │
│  Main content area          │
│                             │
└─────────────────────────────┘
```

Then:

1. **Create the route** at `src/routes/<category>/<page>.tsx`.
2. **Register the page** by adding a `PageInfo` entry to `src/lib/pages.ts` (route, title, description, keywords, tags, category, icon). This one source drives the sidebar, the global command-palette search, and the homepage grid.
3. **Update `README.md`** Features list under the matching category.
4. Put reusable state logic in `src/hooks/use-*.ts` and pure helpers in `src/lib/` (or `src/lib/utils/`).
5. If the page handles keyboard input, add the `keydown` listener in an effect and guard against typing targets (`INPUT` / `TEXTAREA` / `isContentEditable`).

Checklist:

- [ ] Route file created under the right `src/routes/<category>/`
- [ ] `PageInfo` entry added to `src/lib/pages.ts`
- [ ] `README.md` features list updated
- [ ] Query parameters for settings (if applicable)
