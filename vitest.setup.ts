// Adds DOM matchers to expect(): toBeInTheDocument(), toHaveAttribute()...
import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => cleanup())
