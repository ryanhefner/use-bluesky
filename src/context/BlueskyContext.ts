import { createContext } from 'react'

import { type Agent } from '@atproto/api'
import { NodeOAuthClient } from '@atproto/oauth-client-node'

export type BlueskyContextValue = {
  agent?: Agent
  client?: NodeOAuthClient
  baseUrl: string
  session?: any
  token?: string
}

export const BlueskyContext = createContext<BlueskyContextValue | undefined>(
  undefined,
)
