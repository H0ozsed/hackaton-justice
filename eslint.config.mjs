// @ts-check
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'

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
  // Last: turns off the ESLint rules that conflict with Prettier (formatting is Prettier's job).
  prettier,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'src/generated/**']),
])
