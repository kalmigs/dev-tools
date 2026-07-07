# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, and any tool that reads `AGENTS.md`) when working with code in this repository.

## Commands

- `pnpm dev`: Vite dev server.
- `pnpm build`: `tsc -b && vite build`.
- `pnpm typecheck`: `tsc -b --noEmit`.
- `pnpm lint`: ESLint (flat config, `eslint.config.js`).
- `pnpm format` / `pnpm format:check`: Prettier.
- `pnpm test`: Vitest (watch). `pnpm test -- --run` for one-shot (used in CI). Tests live under `tests/` mirroring the `src/` path (e.g. `tests/lib/utils/dateParser.spec.ts` for `src/lib/utils/dateParser.ts`) and must match `tests/**/*.{spec,test}.ts`. Keep `src/` free of test files.

Toolchain is pinned to Node 24+ and pnpm 10+ (`.node-version`, `packageManager`). `vite` is overridden to `rolldown-vite` in `pnpm.overrides`. `pnpm-workspace.yaml` sets `minimumReleaseAge` (7-day dependency cooldown) as supply-chain hardening.

## Architecture

**SPA deployed to GitHub Pages.** `vite.config.ts` sets `base` to `/dev-tools/`, and `src/main.tsx` uses `createHashHistory()` so every route is served from `index.html` (URLs are `/#/path`).

**Routing** is TanStack Router file-based from `src/routes/`, with `autoCodeSplitting` enabled in the router plugin. The plugin auto-generates `src/routeTree.gen.ts`; never hand-edit it. Routes are grouped by category folder: `convert/`, `generate/`, `inspect/`, `strings/`, `validate/`. Each route exports `Route = createFileRoute(...)`.

**Page registry.** `src/lib/pages.ts` exports `PageInfo` entries (route, title, description, keywords, tags, category, icon) grouped by category. This single source drives the sidebar, the global search index, and the homepage grid. Adding a tool means adding a `PageInfo` entry here.

**Global search.** `src/components/global-search.tsx` is a cmdk command palette backed by fuse.js via `src/hooks/use-search.ts`, which indexes the entries in `src/lib/pages.ts`.

**Page state in the URL.** Persist user-visible settings in URL search params so links are shareable and refresh-safe. Params are validated with a hand-written `validateSearch` (this project does not use zod) and updated with `navigate({ search: prev => ..., replace: true })`.

**UI layer** is [basecn](https://basecn.dev) (shadcn/ui rebuilt on Base UI) in `src/components/ui/`. Install new components with `pnpm dlx shadcn@latest add https://basecn.dev/r/<name>.json`. The layout shell (`AppSidebar`, `TopNav`) lives in `src/components/layout/` and is mounted by `src/routes/__root.tsx` inside the basecn `SidebarProvider`, alongside the sonner `Toaster`.

**Theme.** Light/dark state lives in `src/routes/__root.tsx`: it reads `localStorage['theme']` (falling back to `prefers-color-scheme`), toggles the `.dark` class on `<html>`, and passes `theme` / `onToggleTheme` to `TopNav`. Colors are OKLCH CSS variables in `src/index.css`. Always style with semantic Tailwind classes (`bg-primary`, `bg-sidebar`), not hardcoded palette colors, so dark mode works.

**No build-time codegen.** `src/routeTree.gen.ts` is the only generated file; there is no `predev`/`prebuild` step.

## Conventions

- Imports grouped `react → external → @/components → @/hooks → @/lib`, alphabetized within groups. File structure: Imports → Types → Constants → Helpers → Subcomponents → Main component → Route export.
- `@/*` resolves to `src/*` (`vite.config.ts` + `tsconfig`).
- Prettier: single quotes, trailing commas, 100-char width.
- Type-only imports: `import type { Foo }` or `import { type Foo }`.
- Reuse over duplication: generic hooks go in `src/hooks/`, pure helpers in `src/lib/` (or `src/lib/utils/`).
- Conventional commit types: `feat`, `fix`, `docs`, `style`, `refactor`, `chore`.

## Further reading

Scope-limited conventions live in nested `AGENTS.md` files, which agents load when working in that subtree:

- `src/routes/AGENTS.md`: TanStack Router + hash history, URL search-param state, new-page checklist (incl. required ASCII layout mockup).
- `src/components/AGENTS.md`: Base UI / basecn install + import patterns.
- `src/components/layout/AGENTS.md`: `AppSidebar` / `TopNav` shell, theme wiring, and `src/lib/pages.ts`.

## CI

`.github/workflows/deploy.yml` runs on push to `main`: `pnpm audit --audit-level=high` then `pnpm test -- --run` then `pnpm build`, then deploys to GitHub Pages.
