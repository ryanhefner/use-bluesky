import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useSearchActors } from '../useSearchActors'
import { BlueskyProvider } from '../../context/BlueskyProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

const mockResults = {
  actors: [
    { did: 'actor1', handle: 'actor1.bsky.social' },
    { did: 'actor2', handle: 'actor2.bsky.social' },
  ],
  cursor: 'next-cursor',
}

describe('useSearchActors', () => {
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

  it('should fetch search results', async () => {
    const mockResults = {
      actors: [
        { did: 'actor1', handle: 'actor1.bsky.social' },
        { did: 'actor2', handle: 'actor2.bsky.social' },
      ],
      cursor: 'next-cursor',
    }

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResults),
    })

    const { result } = renderHook(
      () => useSearchActors({ search: 'test', limit: 10 }),
      { wrapper },
    )

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockResults)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(
        '/xrpc/app.bsky.actor.searchActors?q=test*&limit=10',
      ),
      expect.any(Object),
    )
  })

  it('should handle fetch errors', async () => {
    const error = new Error('Failed to fetch')
    mockFetch.mockRejectedValueOnce(error)

    const { result } = renderHook(
      () => useSearchActors({ search: 'test', limit: 10 }),
      { wrapper },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeDefined()
    expect(result.current.data).toEqual(mockResults)
  })

  it('should include cursor in request when provided', async () => {
    const mockResults = {
      actors: [{ did: 'actor1', handle: 'actor1.bsky.social' }],
      cursor: null,
    }

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResults),
    })

    const { result } = renderHook(
      () =>
        useSearchActors({ search: 'test', limit: 10, cursor: 'next-cursor' }),
      { wrapper },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(
        '/xrpc/app.bsky.actor.searchActors?q=test*&limit=10&cursor=next-cursor',
      ),
      expect.any(Object),
    )
  })
})
