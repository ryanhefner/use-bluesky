import { useInfiniteQuery } from '@tanstack/react-query'

import { FOLLOWS_ROUTE } from '../constants'
import { useBluesky } from './useBluesky'

type UseFollowsProps = {
  actor?: string
  cursor?: string
  initialData?: any
  limit?: number
  refetchOnMount?: boolean
}

export const useFollows = (options: UseFollowsProps) => {
  const { baseUrl, token } = useBluesky()

  const {
    actor,
    cursor = '',
    initialData,
    limit = 100,
    refetchOnMount,
  } = options

  return useInfiniteQuery({
    enabled: !!actor,
    initialData,
    queryKey: ['follows', baseUrl, actor, limit, token],
    queryFn: ({ pageParam = '' }) => {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined

      return fetch(
        `${baseUrl}${FOLLOWS_ROUTE}?actor=${actor}&limit=${limit}${
          pageParam ? `&cursor=${pageParam}` : ''
        }`,
        { headers },
      ).then((res) => res.json())
    },
    getNextPageParam: (lastPage, pages) => lastPage.cursor,
    initialPageParam: cursor,
    refetchOnMount,
  })
}
