import React from 'react'
import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useBluesky } from '../useBluesky'
import { BlueskyProvider } from '../../context/BlueskyProvider'
import { BLUESKY_API_URL } from '../../constants'

describe('useBluesky', () => {
  it('returns default values when used outside of BlueskyProvider', () => {
    const { result } = renderHook(() => useBluesky())

    expect(result.current).toEqual({
      baseUrl: BLUESKY_API_URL,
    })
  })

  it('returns provided values when used within BlueskyProvider', () => {
    const customBaseUrl = 'https://custom.bsky.social'
    const customToken = 'test-token'

    const { result } = renderHook(() => useBluesky(), {
      wrapper: ({ children }) => (
        <BlueskyProvider baseUrl={customBaseUrl} token={customToken}>
          {children}
        </BlueskyProvider>
      ),
    })

    expect(result.current).toEqual({
      baseUrl: customBaseUrl,
      token: customToken,
    })
  })
})
