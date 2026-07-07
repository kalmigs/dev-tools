# Components

- `ui/`: [basecn](https://basecn.dev) primitives (shadcn/ui rebuilt on Base UI). Copy-paste-customize pattern.
- `layout/`: app shell (`AppSidebar`, `TopNav`), mounted by `src/routes/__root.tsx`.
- `errors/`: error/boundary components (e.g. `not-found`).
- `global-search.tsx`: cmdk command palette backed by fuse.js (`src/hooks/use-search.ts`) over `src/lib/pages.ts`.

## Installing a new basecn component

```bash
pnpm dlx shadcn@latest add https://basecn.dev/r/<component-name>.json
```

Component index: https://basecn.dev/llms.txt. Common: accordion, alert-dialog, alert, avatar, badge, button, card, checkbox, dialog, drawer, dropdown-menu, input, label, popover, select, separator, sheet, sidebar, skeleton, slider, switch, table, tabs, textarea, toggle, tooltip.

## Import pattern

```tsx
import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
```

Base UI primitives come from `@base-ui/react/<component>`. Use type-only imports (`import type`, or `import { type Foo }`) for types.
