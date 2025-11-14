import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useDebounce } from '@/hooks/useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    expect(result.current).toBe('initial')
  })

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    )

    expect(result.current).toBe('initial')

    // Update value
    rerender({ value: 'updated', delay: 500 })

    // Value should still be initial before delay
    expect(result.current).toBe('initial')

    // Fast-forward time
    vi.advanceTimersByTime(500)

    await waitFor(() => {
      expect(result.current).toBe('updated')
    })
  })

  it('should reset timer on rapid changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    )

    // First update
    rerender({ value: 'update1', delay: 500 })
    vi.advanceTimersByTime(200)

    // Second update before first completes
    rerender({ value: 'update2', delay: 500 })
    vi.advanceTimersByTime(200)

    // Third update before second completes
    rerender({ value: 'final', delay: 500 })

    // Should still have initial value
    expect(result.current).toBe('initial')

    // Complete the debounce
    vi.advanceTimersByTime(500)

    await waitFor(() => {
      expect(result.current).toBe('final')
    })
  })

  it('should work with different delay values', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 1000 },
      }
    )

    rerender({ value: 'updated', delay: 1000 })

    vi.advanceTimersByTime(500)
    expect(result.current).toBe('initial')

    vi.advanceTimersByTime(500)

    await waitFor(() => {
      expect(result.current).toBe('updated')
    })
  })

  it('should handle number values', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 0, delay: 300 },
      }
    )

    rerender({ value: 42, delay: 300 })
    vi.advanceTimersByTime(300)

    await waitFor(() => {
      expect(result.current).toBe(42)
    })
  })

  it('should handle object values', async () => {
    const obj1 = { name: 'test1' }
    const obj2 = { name: 'test2' }

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: obj1, delay: 300 },
      }
    )

    rerender({ value: obj2, delay: 300 })
    vi.advanceTimersByTime(300)

    await waitFor(() => {
      expect(result.current).toBe(obj2)
    })
  })

  it('should cleanup timer on unmount', () => {
    const { unmount } = renderHook(() => useDebounce('test', 500))

    unmount()

    // Should not throw error
    vi.advanceTimersByTime(500)
  })

  it('should work with zero delay', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 0 },
      }
    )

    rerender({ value: 'updated', delay: 0 })
    vi.advanceTimersByTime(0)

    await waitFor(() => {
      expect(result.current).toBe('updated')
    })
  })
})
