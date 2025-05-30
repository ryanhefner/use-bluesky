import React from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { QueryClient } from '@tanstack/react-query'

import { BlueskyProvider } from '../BlueskyProvider'
import { BlueskyContext } from '../BlueskyContext'

describe('BlueskyProvider', () => {
  it('renders children correctly', () => {
    const { container } = render(
      <BlueskyProvider>
        <div>Test Child</div>
      </BlueskyProvider>,
    )

    expect(container.textContent).toBe('Test Child')
  })

  it('provides default values when no props are passed', () => {
    const TestComponent = () => {
      const context = React.useContext(BlueskyContext)
      return <div data-testid="context">{JSON.stringify(context)}</div>
    }

    const { getByTestId } = render(
      <BlueskyProvider>
        <TestComponent />
      </BlueskyProvider>,
    )

    const contextElement = getByTestId('context')
    const contextValue = JSON.parse(contextElement.textContent || '{}')

    expect(contextValue).toEqual({
      baseUrl: 'https://public.api.bsky.app',
      session: undefined,
      token: undefined,
    })
  })

  it('uses provided props when passed', () => {
    const customBaseUrl = 'https://custom.bsky.social'
    const customSession = { id: 'test-session' }
    const customToken = 'test-token'
    const customQueryClient = new QueryClient()

    const TestComponent = () => {
      const context = React.useContext(BlueskyContext)
      return <div data-testid="context">{JSON.stringify(context)}</div>
    }

    const { getByTestId } = render(
      <BlueskyProvider
        baseUrl={customBaseUrl}
        session={customSession}
        token={customToken}
        queryClient={customQueryClient}
      >
        <TestComponent />
      </BlueskyProvider>,
    )

    const contextElement = getByTestId('context')
    const contextValue = JSON.parse(contextElement.textContent || '{}')

    expect(contextValue).toEqual({
      baseUrl: customBaseUrl,
      session: customSession,
      token: customToken,
    })
  })
})
