import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'

import { ClearBrowserStorage } from './clear-browser-storage'

describe('ClearBrowserStorage', () => {
  afterEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('erases what the site stored and announces it', async () => {
    localStorage.setItem('role-play-progress', '{"voisin-du-dessus":{"best":80}}')
    sessionStorage.setItem('iris-conversation', '[]')
    render(<ClearBrowserStorage />)
    expect(screen.getByRole('status')).toBeEmptyDOMElement()

    await userEvent.click(
      screen.getByRole('button', { name: 'Effacer les données du site sur cet appareil' }),
    )

    expect(localStorage.getItem('role-play-progress')).toBeNull()
    expect(sessionStorage.getItem('iris-conversation')).toBeNull()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Les données du site ont été effacées de ce navigateur.',
    )
  })

  it('leaves data it did not write untouched', async () => {
    localStorage.setItem('other-app', 'kept')
    render(<ClearBrowserStorage />)
    await userEvent.click(screen.getByRole('button'))
    expect(localStorage.getItem('other-app')).toBe('kept')
  })
})
