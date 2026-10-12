// @ts-check
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'

// ---- Architecture guards (see docs/STRUCTURE.md) ----------------------------
// A domain in src/shared/ is only reachable through its index: `@/shared/glossary`,
// never `@/shared/glossary/data`. Inside a domain, use relative imports.
const sharedInternals = {
  group: ['@/shared/*/*'],
  message: 'Import a domain through its public index: `@/shared/<domain>` (see docs/STRUCTURE.md).',
}
// The front never talks to the database: it calls the API (src/pages/api), which
// calls src/server. Only API routes and src/server may import server code / Prisma.
const serverCode = {
  group: ['@/server', '@/server/*', '@/generated/*', '@prisma/*'],
  message:
    'Front code must not import server code or Prisma: call an API route (src/pages/api) instead (see docs/STRUCTURE.md).',
}

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // No `any`, even explicit: type it properly.
      '@typescript-eslint/no-explicit-any': 'error',
      // `==` hides type coercions.
      eqeqeq: ['error', 'always'],
      // Debug logs left behind.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': ['error', { patterns: [sharedInternals] }] },
  },
  {
    // Same rule redefined (ESLint replaces it, it does not merge): front files get both guards.
    files: ['src/pages/**', 'src/components/**', 'src/shared/**', 'src/lib/**'],
    ignores: ['src/pages/api/**'],
    rules: { 'no-restricted-imports': ['error', { patterns: [sharedInternals, serverCode] }] },
  },
  // Last: turns off the ESLint rules that conflict with Prettier (formatting is Prettier's job).
  prettier,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'src/generated/**',
    'test-results/**',
    'playwright-report/**',
  ]),
])
