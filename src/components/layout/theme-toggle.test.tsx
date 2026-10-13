import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { THEME_STORAGE_KEY } from '@/lib/theme'

import { ThemeToggle } from './theme-toggle'

function systemPrefers(dark: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: dark, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  )
}

const html = () => document.documentElement
const toggle = () => screen.getByRole('button', { name: 'Thème sombre' })

beforeEach(() => {
  localStorage.clear()
  html().classList.remove('dark')
  systemPrefers(false)
})

afterEach(() => vi.unstubAllGlobals())

describe('ThemeToggle', () => {
  it('is a toggle button that says whether the dark theme is on', () => {
    render(<ThemeToggle />)
    expect(toggle()).toHaveAttribute('aria-pressed', 'false')
  })

  it('follows the system preference when nothing was chosen', () => {
    systemPrefers(true)
    render(<ThemeToggle />)
    expect(toggle()).toHaveAttribute('aria-pressed', 'true')
  })

  it('switches to the dark theme and remembers the choice on the device', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    await user.click(toggle())
    expect(toggle()).toHaveAttribute('aria-pressed', 'true')
    expect(html()).toHaveClass('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
  })

  it('switches back to the light theme, even when the system prefers dark', async () => {
    systemPrefers(true)
    const user = userEvent.setup()
    render(<ThemeToggle />)
    await user.click(toggle())
    expect(toggle()).toHaveAttribute('aria-pressed', 'false')
    expect(html()).not.toHaveClass('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
  })

  it('keeps the stored choice over the system preference', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    render(<ThemeToggle />)
    expect(toggle()).toHaveAttribute('aria-pressed', 'true')
  })
})
