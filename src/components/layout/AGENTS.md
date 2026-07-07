# Layout

App shell mounted by `src/routes/__root.tsx` inside the basecn `SidebarProvider`.

```
TopNav.tsx          # Top bar; receives `theme` + `onToggleTheme` props
app-sidebar.tsx     # AppSidebar; collapsible nav built from src/lib/pages.ts
```

## Theme

There is no theme context. `__root.tsx` owns light/dark state: it reads `localStorage['theme']` (falling back to `prefers-color-scheme`), toggles the `.dark` class on `<html>`, and passes `theme` / `onToggleTheme` down to `TopNav`. To change theme behavior, edit `__root.tsx`.

## Nav items

The sidebar, the global search, and the homepage grid are all driven by `src/lib/pages.ts`. Add or edit a `PageInfo` entry there rather than hardcoding links in the sidebar:

```tsx
export const generatePages: PageInfo[] = [
  {
    route: '/generate/uuid',
    title: 'UUID',
    description: 'Generate UUIDs',
    keywords: ['uuid', 'id'],
    tags: ['id'],
    category: 'Generate',
    icon: Fingerprint,
  },
];
```
