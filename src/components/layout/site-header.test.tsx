import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { SiteHeader } from './site-header'

const router = vi.hoisted(() => ({ pathname: '/simulation' }))
vi.mock('next/router', () => ({ useRouter: () => router }))

describe('SiteHeader', () => {
  beforeEach(() => {
    router.pathname = '/simulation'
  })

  it('marks the current page for screen readers', () => {
    render(<SiteHeader />)
    const current = screen.getAllByRole('link', { current: 'page' })
    expect(current.map((link) => link.textContent)).toContain('J’ai un conflit ?')
    expect(current.every((link) => link.textContent === 'J’ai un conflit ?')).toBe(true)
  })

  it('opens and closes the mobile menu, announcing its state', async () => {
    const user = userEvent.setup()
    render(<SiteHeader />)

    const open = screen.getByRole('button', { name: 'Ouvrir le menu' })
    expect(open).toHaveAttribute('aria-expanded', 'false')
    expect(document.getElementById('main-menu')).toBeNull()

    await user.click(open)
    const close = screen.getByRole('button', { name: 'Fermer le menu' })
    expect(close).toHaveAttribute('aria-expanded', 'true')
    expect(close).toHaveAttribute('aria-controls', 'main-menu')
    expect(document.getElementById('main-menu')).toBeInTheDocument()

    await user.click(close)
    expect(document.getElementById('main-menu')).toBeNull()
  })

  it('closes the mobile menu after choosing a link', async () => {
    const user = userEvent.setup()
    render(<SiteHeader />)
    await user.click(screen.getByRole('button', { name: 'Ouvrir le menu' }))

    const menu = document.getElementById('main-menu')!
    const link = Array.from(menu.querySelectorAll('a')).find((a) => a.textContent === 'Apprendre')!
    link.addEventListener('click', (event) => event.preventDefault())
    await user.click(link)

    expect(document.getElementById('main-menu')).toBeNull()
  })

  it('keeps a journey current on its sub-pages, but not the home page', () => {
    router.pathname = '/apprendre/lexique'
    render(<SiteHeader />)
    const current = screen.getAllByRole('link', { current: 'page' })
    expect(current.map((link) => link.textContent)).toEqual(['Apprendre'])
  })
})
