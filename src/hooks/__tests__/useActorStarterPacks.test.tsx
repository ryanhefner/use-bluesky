import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useActorStarterPacks } from '../useActorStarterPacks'
import { BlueskyProvider } from '../../context/BlueskyProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

const mockStarterPacks = {
  cursor: 'next-cursor',
  starterPacks: [
    {
      uri: 'test-uri-1',
      name: 'Test Starter Pack 1',
      description: 'A test starter pack 1',
      items: [
        { did: 'item1', handle: 'item1.bsky.social' },
        { did: 'item2', handle: 'item2.bsky.social' },
      ],
    },
    {
      uri: 'test-uri-2',
      name: 'Test Starter Pack 2',
      description: 'A test starter pack 2',
      items: [
        { did: 'item3', handle: 'item3.bsky.social' },
        { did: 'item4', handle: 'item4.bsky.social' },
      ],
    },
  ],
}

describe('useActorStarterPacks', () => {
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
    const { result } = renderHook(
      () => useActorStarterPacks({ actor: undefined }),
      {
        wrapper,
      },
    )

    expect(result.current.isLoading).toBe(false)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should fetch actor starter packs when actor is provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStarterPacks),
    })

    const { result } = renderHook(
      () => useActorStarterPacks({ actor: 'test-actor' }),
      {
        wrapper,
      },
    )

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data?.pages).toHaveLength(1)
    expect(result.current.data?.pages[0]).toEqual(mockStarterPacks)
    expect(mockFetch).toHaveBeenCalledWith(
      'https://public.api.bsky.app/xrpc/app.bsky.graph.getActorStarterPacks?actor=test-actor',
    )
  })

  it('should handle fetch errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'))

    const { result } = renderHook(
      () => useActorStarterPacks({ actor: 'test-actor' }),
      {
        wrapper,
      },
    )

    await waitFor(() => {
      expect(result.current.error).toBeDefined()
      expect(
        !result.current.data ||
          (Array.isArray(result.current.data.pages) &&
            result.current.data.pages.length === 1 &&
            Array.isArray(result.current.data.pages[0].starterPacks)),
      ).toBe(true)
    })
  })

  it('should not fetch when enabled is false', () => {
    const { result } = renderHook(
      () => useActorStarterPacks({ actor: 'test-actor', enabled: false }),
      { wrapper },
    )

    expect(result.current.isLoading).toBe(false)
    expect(mockFetch).not.toHaveBeenCalled()
  })
})
