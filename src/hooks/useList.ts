import { useInfiniteQuery } from '@tanstack/react-query'

import { LIST_ROUTE } from '../constants'
import { useBluesky } from './useBluesky'

type UseListOptions = {
  initialData?: any
  initialPageParam?: string
  list?: string
  limit?: number
  refetchOnMount?: boolean
}

export const useList = (options: UseListOptions) => {
  const { baseUrl, token } = useBluesky()

  const {
    initialData,
    initialPageParam = '',
    list,
    limit = 100,
    refetchOnMount,
  } = options

  return useInfiniteQuery({
    enabled: !!list,
    initialData,
    initialPageParam,
    queryKey: ['list', baseUrl, list, limit],
    queryFn: ({ pageParam = '' }) => {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined

      return fetch(
        `${baseUrl}${LIST_ROUTE}?list=${encodeURIComponent(
          list ?? '',
        )}&limit=${limit}${pageParam ? `&cursor=${pageParam}` : ''}`,
        { headers },
      ).then((res) => res.json())
    },
    getNextPageParam: (lastPage, pages) => lastPage.cursor,
    refetchOnMount,
  })
}
