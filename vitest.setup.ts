// Adds DOM matchers to expect(): toBeInTheDocument(), toHaveAttribute()...
import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { MotionGlobalConfig } from 'framer-motion'
import { afterEach } from 'vitest'

// framer-motion: jump to the end state. The simulated DOM cannot run animations
// (canceled ones throw), and tests check the result, not the motion.
MotionGlobalConfig.skipAnimations = true

afterEach(() => cleanup())
