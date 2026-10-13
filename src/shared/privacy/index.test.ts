import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { browserStorage, clearBrowserStorage } from '.'

// "No data collected without a reason" (#25): the code may only store in the browser what the
// inventory declares, with its purpose, and never sets cookies (/cookies says there are none).

const SRC = join(import.meta.dirname, '../..')

function sourceFiles() {
  return readdirSync(SRC, { recursive: true, encoding: 'utf8' })
    .filter((file) => /\.tsx?$/.test(file) && !/\.test\.tsx?$/.test(file))
    .filter((file) => !file.startsWith('generated') && !file.startsWith('shared/privacy'))
    .map((path) => ({ path, text: readFileSync(join(SRC, path), 'utf8') }))
}

describe('privacy inventory', () => {
  const files = sourceFiles()

  it('declares every storage key the code uses', () => {
    const keys = browserStorage.all.map(({ key }) => key)
    const undeclared = files
      .filter(({ text }) => /\b(local|session)Storage\./.test(text))
      .filter(({ text }) => !keys.some((key) => text.includes(`'${key}'`)))
      .map(({ path }) => path)
    // Each file using browser storage must name one of the declared keys.
    expect(undeclared).toEqual([])
  })

  it('only declares keys the code really uses', () => {
    const unused = browserStorage.all
      .map(({ key }) => key)
      .filter((key) => !files.some(({ text }) => text.includes(`'${key}'`)))
    expect(unused).toEqual([])
  })

  it('sets no cookie and uses no other browser database', () => {
    const offending = files
      .filter(({ text }) => /document\.cookie|indexedDB|setHeader\(\s*'Set-Cookie'/i.test(text))
      .map(({ path }) => path)
    expect(offending).toEqual([])
  })
})

describe('clearBrowserStorage', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('removes every declared key from its storage', () => {
    const local = { removeItem: vi.fn() }
    const session = { removeItem: vi.fn() }
    vi.stubGlobal('window', { localStorage: local, sessionStorage: session })

    expect(clearBrowserStorage()).toBe(true)
    expect(local.removeItem).toHaveBeenCalledWith('role-play-progress')
    expect(session.removeItem).toHaveBeenCalledWith('iris-conversation')
    expect(local.removeItem.mock.calls.length + session.removeItem.mock.calls.length).toBe(
      browserStorage.all.length,
    )
  })

  it('reports failure when storage is blocked', () => {
    vi.stubGlobal('window', {
      get localStorage(): Storage {
        throw new Error('SecurityError')
      },
      get sessionStorage(): Storage {
        throw new Error('SecurityError')
      },
    })
    expect(clearBrowserStorage()).toBe(false)
  })
})
