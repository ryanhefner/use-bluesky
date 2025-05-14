import { useInfiniteQuery } from '@tanstack/react-query'
import { FOLLOWERS_ROUTE } from '../constants'
import { useBluesky } from './useBluesky'

type UseFollowersProps = {
  actor?: string
  cursor?: string
  initialData?: any
  limit?: number
  refetchOnMount?: boolean
}

export const useFollowers = (options: UseFollowersProps) => {
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
    queryKey: ['followers', baseUrl, actor, limit, token],
    queryFn: ({ pageParam = '' }) => {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined

      return fetch(
        `${baseUrl}${FOLLOWERS_ROUTE}?actor=${actor}&limit=${limit}${
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
