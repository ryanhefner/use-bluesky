# 🦋 use-bluesky

React hooks to interact with the Bluesky API.

## Install

Via [npm](https://npmjs.com/package/use-bluesky)

```sh
npm install use-bluesky
```

Via [Yarn](https://yarn.pm/use-bluesky)

```sh
yarn add use-bluesky
```

## Requirements

This library requires the following peer dependencies to be installed in your project:

```sh
npm install @atproto/api@>=0.10 @atproto/oauth-client-node@>=0.2 @tanstack/react-query@>=5.0 react@>=16.8 react-dom@>=16.8
```

Or if you're using Yarn:

```sh
yarn add @atproto/api@>=0.10 @atproto/oauth-client-node@>=0.2 @tanstack/react-query@>=5.0 react@>=16.8 react-dom@>=16.8
```

## How to use

### Setup

#### App Router

First, wrap your app with the `BlueskyProvider` and configure it with your Bluesky credentials:

```tsx
// app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BlueskyProvider } from 'use-bluesky'

// Create a client
const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BlueskyProvider
        baseUrl="https://public.api.bsky.app" // Optional: defaults to this URL
        token="your-bluesky-token" // Optional: for authenticated requests
        queryClient={queryClient} // Optional: pass your own QueryClient instance
      >
        {children}
      </BlueskyProvider>
    </QueryClintProvider>
  )
}
```

Then, add the provider to your root layout:

```tsx
// app/layout.tsx
import { Providers } from './providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

#### Pages Router

For Next.js Pages Router, you can set up the providers in your `_app.tsx`:

```tsx
// pages/_app.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { AppProps } from 'next/app'
import { BlueskyProvider } from 'use-bluesky'

// Create a client
const queryClient = new QueryClient()

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <BlueskyProvider
        baseUrl="https://public.api.bsky.app" // Optional: defaults to this URL
        queryClient={queryClient} // Optional: pass your own QueryClient instance
        token="your-bluesky-token" // Optional: for authenticated requests
      >
        <Component {...pageProps} />
      </BlueskyProvider>
    </QueryClientProvider>
  )
}
```

### Available Hooks

#### useProfile

Fetch a user's profile information:

```tsx
'use client'

import { useProfile } from 'use-bluesky'

export default function ProfilePage({ handle }: { handle: string }) {
  const { data, isLoading, error } = useProfile({
    actor: handle,
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading profile</div>

  return (
    <div>
      <h1>{data.displayName}</h1>
      <p>{data.description}</p>
    </div>
  )
}
```

#### useFollow

> _Note:_ In order to use this hook you need to have an authenticated Bluesky account that triggers the action. In order to support that, you need to proxy the request through your own API (`baseUrl` on `BlueskyProvider`) that applies the appropriate credentials to the request to the Bluesky API.

Follow or unfollow a user:

```tsx
'use client'

import { useFollow } from 'use-bluesky'

export default function FollowButton({
  did,
  followUri,
}: {
  did: string
  followUri: string
}) {
  const { follow, unfollow, isPending } = useFollow({
    did,
    followUri,
    onSuccess: () => {
      // Handle successful follow/unfollow
    },
  })

  return (
    <button onClick={() => follow()} disabled={isPending}>
      Follow
    </button>
  )
}
```

#### useFollowers

Get a user's followers:

```tsx
'use client'

import { useFollowers } from 'use-bluesky'

export default function FollowersList({ handle }: { handle: string }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useFollowers(
    {
      actor: handle,
      limit: 50,
    },
  )

  return (
    <div>
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.followers.map((follower) => (
            <div key={follower.did}>{follower.displayName}</div>
          ))}
        </div>
      ))}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          Load More
        </button>
      )}
    </div>
  )
}
```

#### useSearchActors

Search for users:

```tsx
'use client'

import { useSearchActors } from 'use-bluesky'

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data, isLoading } = useSearchActors({
    search: searchTerm,
    limit: 20,
  })

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search users..."
      />
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {data?.actors.map((actor) => (
            <div key={actor.did}>{actor.displayName}</div>
          ))}
        </div>
      )}
    </div>
  )
}
```

### Additional Hooks

The library also provides these additional hooks:

- `useFollows`: Get users that a profile follows
- `useList`: Get a list of users
- `useStarterPack`: Get a starter pack
- `useActorStarterPacks`: Get starter packs for an actor

Each hook is fully typed and integrates with React Query for efficient data fetching and caching.

## License

[MIT](LICENSE) © [Ryan Hefner](https://www.ryanhefner.com)
