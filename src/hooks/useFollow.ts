import { useCallback, useMemo } from 'react'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { FOLLOW_ROUTE, UNFOLLOW_ROUTE } from '../constants'
import { useBluesky } from './useBluesky'

type UseFollowProps = {
  did: string
  onSuccess: () => void
  followUri: string
}

export const useFollow = ({ did, onSuccess, followUri }: UseFollowProps) => {
  const { baseUrl, token } = useBluesky()

  const headers = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token],
  )

  const { mutate: followMutation, isPending: isFollowing } = useMutation({
    mutationFn: (did: string) => {
      return axios.post(
        `${baseUrl}${FOLLOW_ROUTE}`,
        { actors: [did] },
        {
          headers,
        },
      )
    },
    onSuccess,
  })

  const { mutate: unfollowMutation, isPending: isUnfollowing } = useMutation({
    mutationFn: (followUri: string) => {
      return axios.post(
        `${baseUrl}${UNFOLLOW_ROUTE}`,
        { uris: [followUri] },
        {
          headers,
        },
      )
    },
    onSuccess,
  })

  const follow = useCallback(() => {
    return followMutation(did)
  }, [did, followMutation])

  const unfollow = useCallback(() => {
    return unfollowMutation(followUri)
  }, [followUri, unfollowMutation])

  return { follow, isPending: !!(isFollowing ?? isUnfollowing), unfollow }
}
