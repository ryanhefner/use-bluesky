import React from 'react'
import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useFollows } from '../useFollows'
import { BlueskyProvider } from '../../context/BlueskyProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('useFollows', () => {
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
    const { result } = renderHook(() => useFollows({ actor: undefined }), {
      wrapper,
    })

    expect(result.current.isLoading).toBe(false)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should fetch follows data when actor is provided', async () => {
    const mockFollows = {
      cursor: 'next-cursor',
      follows: [
        { did: 'follow1', handle: 'follow1.bsky.social' },
        { did: 'follow2', handle: 'follow2.bsky.social' },
      ],
    }

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockFollows),
    })

    const { result } = renderHook(
      () => useFollows({ actor: 'test.bsky.social' }),
      { wrapper },
    )

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeDefined()
    expect(result.current.data?.pages[0]).toEqual(mockFollows)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(
        '/xrpc/app.bsky.graph.getFollows?actor=test.bsky.social&limit=100',
      ),
      expect.any(Object),
    )
  })

  it('should handle fetch errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'))

    const { result } = renderHook(() => useFollows({ actor: 'test-actor' }), {
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
    const mockFollows1 = {
      cursor: 'next-cursor',
      follows: [
        { did: 'follow1', handle: 'follow1.bsky.social' },
        { did: 'follow2', handle: 'follow2.bsky.social' },
      ],
    }

    const mockFollows2 = {
      cursor: 'next-cursor-2',
      follows: [
        { did: 'follow3', handle: 'follow3.bsky.social' },
        { did: 'follow4', handle: 'follow4.bsky.social' },
      ],
    }

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFollows1),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFollows2),
      })

    const { result } = renderHook(() => useFollows({ actor: 'test-actor' }), {
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
      expect(result.current.data?.pages[0]).toEqual(mockFollows1)
    })

    act(() => {
      result.current.fetchNextPage()
    })

    await waitFor(() => {
      expect(result.current.data?.pages).toHaveLength(2)
      expect(result.current.data?.pages[0]).toEqual(mockFollows1)
      expect(result.current.data?.pages[1]).toEqual(mockFollows2)
    })
  })
})
