import { useContext } from 'react'

import { BlueskyContext } from '../context'
import { BLUESKY_API_URL } from '../constants'

export const useBluesky = () => {
  const context = useContext(BlueskyContext) ?? { baseUrl: BLUESKY_API_URL }

  return context
}
