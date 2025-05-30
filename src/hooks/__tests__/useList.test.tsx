import React from 'react'
import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useList } from '../useList'
import { BlueskyProvider } from '../../context/BlueskyProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('useList', () => {
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

  it('should not fetch when list is not provided', () => {
    const { result } = renderHook(() => useList({ list: undefined }), {
      wrapper,
    })

    expect(result.current.isLoading).toBe(false)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should fetch list data when list is provided', async () => {
    const mockList = {
      cursor: 'next-cursor',
      items: [
        { did: 'item1', handle: 'item1.bsky.social' },
        { did: 'item2', handle: 'item2.bsky.social' },
      ],
    }

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockList),
    })

    const { result } = renderHook(() => useList({ list: 'test-list' }), {
      wrapper,
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data?.pages[0]).toEqual(mockList)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(
        '/xrpc/app.bsky.graph.getList?list=test-list&limit=100',
      ),
      expect.any(Object),
    )
  })

  it('should handle fetch errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'))

    const { result } = renderHook(() => useList({ list: 'test-list' }), {
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
    const mockList1 = {
      cursor: 'next-cursor',
      items: [
        { did: 'item1', handle: 'item1.bsky.social' },
        { did: 'item2', handle: 'item2.bsky.social' },
      ],
    }

    const mockList2 = {
      cursor: 'next-cursor-2',
      items: [
        { did: 'item3', handle: 'item3.bsky.social' },
        { did: 'item4', handle: 'item4.bsky.social' },
      ],
    }

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockList1),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockList2),
      })

    const { result } = renderHook(() => useList({ list: 'test-list' }), {
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
      expect(result.current.data?.pages[0]).toEqual(mockList1)
    })

    act(() => {
      result.current.fetchNextPage()
    })

    await waitFor(() => {
      expect(result.current.data?.pages).toHaveLength(2)
      expect(result.current.data?.pages[0]).toEqual(mockList1)
      expect(result.current.data?.pages[1]).toEqual(mockList2)
    })
  })

  it('should use custom limit when provided', async () => {
    const mockList = {
      items: [{ did: 'item1', handle: 'item1.bsky.social' }],
      cursor: null,
    }

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockList),
    })

    const { result } = renderHook(
      () => useList({ list: 'test-list', limit: 50 }),
      { wrapper },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(
        '/xrpc/app.bsky.graph.getList?list=test-list&limit=50',
      ),
      expect.any(Object),
    )
  })
})
