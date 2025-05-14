import { PropsWithChildren, useState } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { BLUESKY_API_URL } from '../constants'
import { BlueskyContext } from './BlueskyContext'

type BlueskyProviderProps = PropsWithChildren & {
  baseUrl?: string
  session?: any
  token?: string
}

const queryClient = new QueryClient()

export const BlueskyProvider = ({
  children,
  baseUrl = BLUESKY_API_URL,
  session,
  token,
}: BlueskyProviderProps) => {
  const [localBaseUrl] = useState(baseUrl)
  const [localToken] = useState(token)
  const [localSession] = useState(session)

  return (
    <BlueskyContext.Provider
      value={{
        baseUrl: localBaseUrl,
        session: localSession,
        token: localToken,
      }}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </BlueskyContext.Provider>
  )
}
