import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Create a new ratelimiter, that allows 10 requests per 10 seconds
const ratelimit = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_URL !== 'your-upstash-redis-url'
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "10 s"),
      analytics: true,
    })
  : null

export default withAuth(
  async function middleware(req) {
    // Apply rate limiting to API routes
    if (req.nextUrl.pathname.startsWith("/api/")) {
      const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1"
      
      // Bypass if no Upstash Redis URL is configured
      if (ratelimit) {
        const { success, pending, limit, reset, remaining } = await ratelimit.limit(ip)
        
        if (!success) {
          return new NextResponse("Too Many Requests", {
            status: 429,
            headers: {
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
            },
          })
        }
      }
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/flags/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/api/:path*"
  ]
}
