import { useInfiniteQuery } from '@tanstack/react-query'

import { ACTOR_STARTER_PACKS_ROUTE, BLUESKY_API_URL } from '../constants'

type UseStarterPacksOptions = {
  actor?: string
  cursor?: string
  enabled?: boolean
  initialData?: any
  limit?: number
  refetchOnMount?: boolean
}

export const useActorStarterPacks = (options: UseStarterPacksOptions) => {
  const {
    actor,
    cursor,
    enabled = true,
    initialData,
    limit,
    refetchOnMount = false,
  } = options

  return useInfiniteQuery({
    enabled: !!actor && enabled,
    queryKey: ['starter-packs', actor, limit, cursor],
    queryFn: ({ pageParam = '' }) =>
      fetch(
        `${BLUESKY_API_URL}${ACTOR_STARTER_PACKS_ROUTE}?actor=${encodeURIComponent(
          actor ?? '',
        )}${limit ? `&limit=${limit}` : ''}${pageParam ? `&cursor=${pageParam}` : ''}`,
      ).then((res) => res.json()),
    getNextPageParam: (lastPage, pages) => lastPage.cursor,
    initialData: initialData
      ? { pageParams: [cursor ?? ''], pages: [initialData] }
      : undefined,
    initialPageParam: cursor,
    refetchOnMount: refetchOnMount || !initialData,
  })
}
