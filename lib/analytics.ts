import { PostHog } from 'posthog-node'

let posthogClient: PostHog | null = null

export default function PostHogClient() {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY === 'your-posthog-key') {
    return null
  }

  if (!posthogClient) {
    posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    })
  }
  return posthogClient
}
