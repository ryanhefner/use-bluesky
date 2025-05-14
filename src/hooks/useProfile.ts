import { useQuery } from '@tanstack/react-query'

import { PROFILE_ROUTE } from '../constants'
import { useBluesky } from './useBluesky'

type UseProfileProps = {
  actor?: string
  enabled?: boolean
}

export const useProfile = ({ actor, enabled = true }: UseProfileProps) => {
  const { baseUrl, token } = useBluesky()

  return useQuery({
    enabled: enabled && !!actor,
    queryKey: ['profile', baseUrl, actor],
    queryFn: () => {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined

      return fetch(
        `${baseUrl}${PROFILE_ROUTE}?actor=${encodeURIComponent(actor ?? '')}`,
        {
          headers,
        },
      ).then((res) => res.json())
    },
  })
}
