import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, Mock } from 'vitest'
import { useFollow } from '../useFollow'
import { BlueskyProvider } from '../../context/BlueskyProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'

// Mock axios
vi.mock('axios')
const mockAxios = axios as unknown as typeof axios & {
  post: Mock
}

describe('useFollow', () => {
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
    vi.clearAllMocks()
  })

  it('should handle follow action', async () => {
    const onSuccess = vi.fn()
    const did = 'test-did'
    const followUri = 'test-follow-uri'

    mockAxios.post.mockResolvedValueOnce({ data: { success: true } })

    const { result } = renderHook(
      () => useFollow({ did, followUri, onSuccess }),
      { wrapper },
    )

    expect(result.current.isPending).toBe(false)

    await act(async () => {
      await result.current.follow()
    })

    expect(mockAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/follow'),
      { actors: [did] },
      expect.any(Object),
    )
    expect(onSuccess).toHaveBeenCalled()
  })

  it('should handle unfollow action', async () => {
    const onSuccess = vi.fn()
    const did = 'test-did'
    const followUri = 'test-follow-uri'

    mockAxios.post.mockResolvedValueOnce({ data: { success: true } })

    const { result } = renderHook(
      () => useFollow({ did, followUri, onSuccess }),
      { wrapper },
    )

    expect(result.current.isPending).toBe(false)

    await act(async () => {
      await result.current.unfollow()
    })

    expect(mockAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/unfollow'),
      { uris: [followUri] },
      expect.any(Object),
    )
    expect(onSuccess).toHaveBeenCalled()
  })

  it('should handle follow error', async () => {
    mockAxios.post.mockRejectedValueOnce(new Error('Failed to follow'))

    const { result } = renderHook(
      () =>
        useFollow({
          did: 'test-did',
          followUri: 'test-follow-uri',
          onSuccess: vi.fn(),
        }),
      {
        wrapper: ({ children }) => (
          <BlueskyProvider>
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </BlueskyProvider>
        ),
      },
    )

    await act(async () => {
      try {
        await result.current.follow()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error.message).toBe('Failed to follow')
      }
    })
  })

  it('should handle unfollow error', async () => {
    mockAxios.post.mockRejectedValueOnce(new Error('Failed to unfollow'))

    const { result } = renderHook(
      () =>
        useFollow({
          did: 'test-did',
          followUri: 'test-follow-uri',
          onSuccess: vi.fn(),
        }),
      {
        wrapper: ({ children }) => (
          <BlueskyProvider>
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </BlueskyProvider>
        ),
      },
    )

    await act(async () => {
      try {
        await result.current.unfollow()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error.message).toBe('Failed to unfollow')
      }
    })
  })
})
