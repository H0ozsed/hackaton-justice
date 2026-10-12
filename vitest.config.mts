import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Unit, component and API integration tests (see docs/TESTING.md).
// E2E tests are run by Playwright (playwright.config.ts), not by Vitest.
const alias = { '@': fileURLToPath(new URL('./src', import.meta.url)) }

export default defineConfig({
  plugins: [react()],
  resolve: { alias },
  test: {
    projects: [
      {
        // Pure logic: src/**/*.test.ts, run in Node.
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
          exclude: ['src/**/*.int.test.ts'],
        },
      },
      {
        // React components: src/**/*.test.tsx, in a simulated DOM.
        extends: true,
        test: {
          name: 'components',
          environment: 'happy-dom',
          include: ['src/**/*.test.tsx'],
          setupFiles: ['./vitest.setup.ts'],
        },
      },
      {
        // API routes against the test database: src/**/*.int.test.ts (from #6 on).
        extends: true,
        test: {
          name: 'api',
          environment: 'node',
          include: ['src/**/*.int.test.ts'],
        },
      },
    ],
  },
})
