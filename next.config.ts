import type { NextConfig } from 'next'

// Tailwind CSS is processed by PostCSS (postcss.config.mjs), for both bundlers:
// `next dev --webpack` (#46, Turbopack dev bug in 16.4.0) and the Turbopack production build.
const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  reactCompiler: true,
  reactStrictMode: true,
  typescript: {
    // Build type check without .next/dev, left by `next dev` (see tsconfig.build.json).
    tsconfigPath: process.env.NODE_ENV === 'production' ? 'tsconfig.build.json' : 'tsconfig.json',
  },
}

export default nextConfig
