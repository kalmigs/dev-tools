import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier';

export default defineConfig([
  globalIgnores(['dist', 'tmp']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      prettier,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    // Route files define their page component locally and export only a `Route`
    // object, which is exactly the shape this rule rejects. Until 0.5 the plugin
    // mistook createFileRoute() for an HOC and let these files through, so it was
    // never really checking them; 0.5 tightened HOC detection and surfaced all of
    // them at once. Adding TanStack functions to `extraHOCs` is discouraged by the
    // plugin (they return route objects, not memoized components), and splitting
    // every page component out would fight file-based routing, so the rule is off
    // here and stays on everywhere else.
    files: ['src/routes/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
]);
