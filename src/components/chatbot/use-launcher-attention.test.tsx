import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { STORAGE_KEY } from './use-iris'
import { ATTENTION_MS, useLauncherAttention } from './use-launcher-attention'

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

  it('stops as soon as IRIS is opened', () => {
    const { result, rerender } = renderHook(({ open }) => useLauncherAttention(open), {
      initialProps: { open: false },
    })
    rerender({ open: true })
    expect(result.current).toBe(false)
  })

  it('catches the eye again on every page load, even during a conversation', () => {
    sessionStorage.setItem(STORAGE_KEY, '[]')
    const first = renderHook(() => useLauncherAttention(false))
    first.rerender()
    first.unmount()
    expect(renderHook(() => useLauncherAttention(false)).result.current).toBe(true)
  })
})
