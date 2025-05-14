import { useQuery } from '@tanstack/react-query'

import { SEARCH_ACTORS_ROUTE } from '../constants'
import { useBluesky } from './useBluesky'

type UseSearchActorProps = {
  cursor?: string
  limit: number
  search: string
}

export const useSearchActors = ({
  cursor,
  limit,
  search,
}: UseSearchActorProps) => {
  const { baseUrl, token } = useBluesky()

  return useQuery({
    queryKey: ['search', 'actor', baseUrl, cursor, limit, search],
    queryFn: () => {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined

      return fetch(
        `${baseUrl}${SEARCH_ACTORS_ROUTE}?q=${`${search}*`}&limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`,
        { headers },
      ).then((res) => res.json())
    },
  })
}
