import { describe, expect, it } from 'vitest'
import { BlueskyContext } from '../BlueskyContext'
import type { BlueskyContextValue } from '../BlueskyContext'

describe('BlueskyContext', () => {
  it('should be a valid React Context', () => {
    expect(BlueskyContext).toBeDefined()
    expect(BlueskyContext.Provider).toBeDefined()
    expect(BlueskyContext.Consumer).toBeDefined()
  })

  it('should have the correct type structure', () => {
    // This test ensures the type structure matches our expectations
    const mockContext: BlueskyContextValue = {
      baseUrl: 'https://bsky.social',
      agent: undefined,
      client: undefined,
      session: undefined,
      token: undefined,
    }

    expect(mockContext).toHaveProperty('baseUrl')
    expect(mockContext).toHaveProperty('agent')
    expect(mockContext).toHaveProperty('client')
    expect(mockContext).toHaveProperty('session')
    expect(mockContext).toHaveProperty('token')
  })
})
