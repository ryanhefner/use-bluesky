import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useProfile } from '../useProfile'
import { BlueskyProvider } from '../../context/BlueskyProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

const mockProfile = {
  did: 'test-did',
  handle: 'test.bsky.social',
  displayName: 'Test User',
}

describe('useProfile', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BlueskyProvider>{children}</BlueskyProvider>
    </QueryClientProvider>
  )

  beforeEach(() => {
    queryClient.clear()
    mockFetch.mockClear()
  })

  it('should not fetch when actor is not provided', () => {
    const { result } = renderHook(() => useProfile({ actor: undefined }), {
      wrapper,
    })

    expect(result.current.isLoading).toBe(false)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should fetch profile data when actor is provided', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockProfile),
    })

    const { result } = renderHook(
      () => useProfile({ actor: 'test.bsky.social' }),
      { wrapper },
    )

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockProfile)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(
        '/xrpc/app.bsky.actor.getProfile?actor=test.bsky.social',
      ),
      expect.any(Object),
    )
  })

  it('should handle fetch errors', async () => {
    const error = new Error('Failed to fetch')
    mockFetch.mockRejectedValueOnce(error)

    const { result } = renderHook(
      () => useProfile({ actor: 'test.bsky.social' }),
      { wrapper },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeDefined()
    expect(result.current.data).toEqual(mockProfile)
  })
})
