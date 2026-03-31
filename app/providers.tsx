'use client'

import { SessionProvider } from 'next-auth/react'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (
      typeof window !== 'undefined' && 
      process.env.NEXT_PUBLIC_POSTHOG_KEY && 
      process.env.NEXT_PUBLIC_POSTHOG_KEY !== 'your-posthog-key'
    ) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') posthog.debug()
        }
      })
    } else {
      console.log('PostHog analytics disabled: Missing or placeholder API key')
    }
  }, [])

  return (
    <SessionProvider>
      <PostHogProvider client={posthog}>
        {children}
      </PostHogProvider>
    </SessionProvider>
  )
}
