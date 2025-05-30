import { describe, expect, it } from 'vitest'
import * as hooks from '../index'

describe('hooks/index', () => {
  it('should export all hooks', () => {
    expect(hooks).toHaveProperty('useActorStarterPacks')
    expect(hooks).toHaveProperty('useBluesky')
    expect(hooks).toHaveProperty('useFollow')
    expect(hooks).toHaveProperty('useFollowers')
    expect(hooks).toHaveProperty('useFollows')
    expect(hooks).toHaveProperty('useList')
    expect(hooks).toHaveProperty('useProfile')
    expect(hooks).toHaveProperty('useSearchActors')
    expect(hooks).toHaveProperty('useStarterPack')
  })
})
