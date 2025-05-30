import React from 'react'
import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useFollowers } from '../useFollowers'
import { BlueskyProvider } from '../../context/BlueskyProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('useFollowers', () => {
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
    const { result } = renderHook(() => useFollowers({ actor: undefined }), {
      wrapper,
    })

    expect(result.current.isLoading).toBe(false)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should fetch followers data when actor is provided', async () => {
    const mockFollowers = {
      cursor: 'next-cursor',
      followers: [
        { did: 'follower1', handle: 'follower1.bsky.social' },
        { did: 'follower2', handle: 'follower2.bsky.social' },
      ],
    }

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockFollowers),
    })

    const { result } = renderHook(
      () => useFollowers({ actor: 'test.bsky.social' }),
      { wrapper },
    )

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeDefined()
    expect(result.current.data?.pages[0]).toEqual(mockFollowers)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(
        '/xrpc/app.bsky.graph.getFollowers?actor=test.bsky.social&limit=100',
      ),
      expect.any(Object),
    )
  })

  it('should handle fetch errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'))

    const { result } = renderHook(() => useFollowers({ actor: 'test-actor' }), {
      wrapper: ({ children }) => (
        <BlueskyProvider>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </BlueskyProvider>
      ),
    })

    await waitFor(() => {
      expect(result.current.error).toBeDefined()
      expect(result.current.data).toBeUndefined()
    })
  })

  it('should fetch next page when fetchNextPage is called', async () => {
    const mockFollowers = {
      cursor: 'next-cursor',
      followers: [
        { did: 'follower1', handle: 'follower1.bsky.social' },
        { did: 'follower2', handle: 'follower2.bsky.social' },
      ],
    }

    const mockFollowers1 = {
      cursor: 'next-cursor',
      followers: [
        { did: 'follower1', handle: 'follower1.bsky.social' },
        { did: 'follower2', handle: 'follower2.bsky.social' },
      ],
    }

    const mockFollowers2 = {
      cursor: 'next-cursor-2',
      followers: [
        { did: 'follower3', handle: 'follower3.bsky.social' },
        { did: 'follower4', handle: 'follower4.bsky.social' },
      ],
    }

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFollowers1),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFollowers2),
      })

    const { result } = renderHook(() => useFollowers({ actor: 'test-actor' }), {
      wrapper: ({ children }) => (
        <BlueskyProvider>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </BlueskyProvider>
      ),
    })

    await waitFor(() => {
      expect(result.current.data?.pages).toHaveLength(1)
      expect(result.current.data?.pages[0]).toEqual(mockFollowers1)
    })

    act(() => {
      result.current.fetchNextPage()
    })

    await waitFor(() => {
      expect(result.current.data?.pages).toHaveLength(2)
      expect(result.current.data?.pages[0]).toEqual(mockFollowers1)
      expect(result.current.data?.pages[1]).toEqual(mockFollowers2)
    })
  })
})
