import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useStarterPack } from '../useStarterPack'
import { BlueskyProvider } from '../../context/BlueskyProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

const mockStarterPack = {
  uri: 'test-uri',
  name: 'Test Starter Pack',
  description: 'A test starter pack',
  items: [
    { did: 'item1', handle: 'item1.bsky.social' },
    { did: 'item2', handle: 'item2.bsky.social' },
  ],
}

describe('useStarterPack', () => {
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

  it('should not fetch when uri is not provided', () => {
    const { result } = renderHook(() => useStarterPack({ uri: '' }), {
      wrapper,
    })

    expect(result.current.isLoading).toBe(false)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should fetch starter pack data when uri is provided', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockStarterPack),
    })

    const { result } = renderHook(() => useStarterPack({ uri: 'test-uri' }), {
      wrapper,
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockStarterPack)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(
        '/xrpc/app.bsky.graph.getStarterPack?starterPack=test-uri',
      ),
      expect.any(Object),
    )
  })

  it('should handle fetch errors', async () => {
    const error = new Error('Failed to fetch')
    mockFetch.mockRejectedValueOnce(error)

    const { result } = renderHook(() => useStarterPack({ uri: 'test-uri' }), {
      wrapper,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeDefined()
    expect(result.current.data).toEqual(mockStarterPack)
  })

  it('should not fetch when enabled is false', () => {
    const { result } = renderHook(
      () => useStarterPack({ uri: 'test-uri', enabled: false }),
      { wrapper },
    )

    expect(result.current.isLoading).toBe(false)
    expect(mockFetch).not.toHaveBeenCalled()
  })
})
