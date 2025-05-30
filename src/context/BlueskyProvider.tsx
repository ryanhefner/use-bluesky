import { PropsWithChildren, useMemo } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { BLUESKY_API_URL } from '../constants'
import { BlueskyContext } from './BlueskyContext'

type BlueskyProviderProps = PropsWithChildren & {
  baseUrl?: string
  queryClient?: QueryClient
  session?: any
  token?: string
}

const queryClient = new QueryClient()

export const BlueskyProvider = ({
  children,
  baseUrl = BLUESKY_API_URL,
  queryClient: queryClientProp,
  session,
  token,
}: BlueskyProviderProps) => {
  const localQueryClient = useMemo(
    () => queryClientProp ?? queryClient,
    [queryClientProp],
  )

  return (
    <BlueskyContext.Provider
      value={{
        baseUrl,
        session,
        token,
      }}
    >
      <QueryClientProvider client={localQueryClient}>
        {children}
      </QueryClientProvider>
    </BlueskyContext.Provider>
  )
}
