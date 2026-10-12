import { defineConfig, devices } from '@playwright/test'

// End-to-end tests: a real browser on the running app (see docs/TESTING.md).
// The production build is tested, locally as in CI (CI builds in an earlier step).
// E2E_DEV=1 uses the dev server instead: faster to iterate, but Next 16.4.0 dev
// crashes on / (vercel/next.js#99789, see #46).
const PORT = 3100
const isCI = Boolean(process.env.CI)
const useDevServer = Boolean(process.env.E2E_DEV)

const serverCommand = useDevServer
  ? `npm run dev -- -p ${PORT}`
  : isCI
    ? `npm run start -- -p ${PORT}`
    : `npm run build && npm run start -- -p ${PORT}`

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    // Optional: use an already installed Chromium instead of `npx playwright install`.
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: serverCommand,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !isCI,
    // Locally the build runs first.
    timeout: 300_000,
  },
})
