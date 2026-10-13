import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { STORAGE_KEY } from './use-iris'
import { ATTENTION_MS, OPENED_KEY, useLauncherAttention } from './use-launcher-attention'

beforeEach(() => {
  sessionStorage.clear()
  vi.useFakeTimers()
})

afterEach(() => vi.useRealTimers())

describe('useLauncherAttention', () => {
  it('catches the eye when the page opens, then stops by itself', () => {
    const { result } = renderHook(() => useLauncherAttention(false))
    expect(result.current).toBe(true)
    act(() => vi.advanceTimersByTime(ATTENTION_MS))
    expect(result.current).toBe(false)
  })

  it('stops as soon as IRIS is opened, and remembers it for the tab', () => {
    const { result, rerender } = renderHook(({ open }) => useLauncherAttention(open), {
      initialProps: { open: false },
    })
    rerender({ open: true })
    expect(result.current).toBe(false)
    expect(sessionStorage.getItem(OPENED_KEY)).toBe('1')
  })

  it('does not catch the eye once IRIS was opened in this tab', () => {
    sessionStorage.setItem(OPENED_KEY, '1')
    const { result } = renderHook(() => useLauncherAttention(false))
    expect(result.current).toBe(false)
  })

  it('does not catch the eye while a conversation is going on', () => {
    sessionStorage.setItem(STORAGE_KEY, '[]')
    const { result } = renderHook(() => useLauncherAttention(false))
    expect(result.current).toBe(false)
  })
})
