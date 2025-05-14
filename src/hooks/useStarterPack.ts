import { useQuery } from '@tanstack/react-query'

import { STARTER_PACK_ROUTE } from '../constants'
import { useBluesky } from './useBluesky'

export const useStarterPack = ({
  enabled = true,
  uri,
}: {
  enabled?: boolean
  uri: string
}) => {
  const { baseUrl, token } = useBluesky()

  return useQuery({
    enabled: enabled && !!uri,
    queryKey: ['starter-pack', baseUrl, uri],
    queryFn: () =>
      fetch(
        `${baseUrl}${STARTER_PACK_ROUTE}?starterPack=${encodeURIComponent(uri)}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
      ).then((res) => res.json()),
  })
}
