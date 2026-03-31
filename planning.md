# Planning

💡 Pro tip: Start with every 🔴 Must have item first — those are the ones that will bite you on launch day. Come back for the rest in week two.

## 📊 Analytics & Tracking
- [x] Product analytics installed (PostHog, Mixpanel, or Amplitude) 🔴 Must have
- [x] Key activation & retention events defined — not just pageviews 🔴 Must have
- [x] Funnel tracking: signup → activation → conversion 🔴 Must have
- [x] Google Search Console verified and sitemap submitted 🔴 Must have
- [x] Bing Webmaster Tools set up 🟠 Should have
- [x] Session replay enabled for debugging UX issues ⚪ Nice to have

## 🔍 SEO & Discoverability
- [x] XML sitemap generated and submitted 🔴 Must have
- [x] robots.txt configured correctly 🔴 Must have
- [x] OpenGraph images set for all key pages 🔴 Must have
- [x] Twitter / X card meta tags added 🟠 Should have
- [x] Structured data / JSON-LD (Organization, Product, FAQ) 🟠 Should have
- [x] Canonical URLs on every page 🟠 Should have
- [x] Meta titles & descriptions written for all pages 🔴 Must have
- [x] Social previews tested (opengraph.xyz or metatags.io) 🟠 Should have

## 🎨 Branding & Assets
- [x] Favicon set (16×16, 32×32, SVG) 🔴 Must have
- [x] Apple Touch Icon (180×180) 🟠 Should have
- [x] Web App Manifest for PWA support ⚪ Nice to have
- [x] Custom 404 page that's actually helpful 🟠 Should have
- [x] Loading skeletons / states across the app 🟠 Should have
- [x] Empty states designed so first-time users see value 🟠 Should have
- [x] Images compressed & optimized (WebP / AVIF) 🟠 Should have

## ⚖️ Legal & Compliance
- [x] Privacy Policy published 🔴 Must have
- [x] Terms of Service published 🔴 Must have
- [x] Cookie consent banner (GDPR if serving EU users) 🔴 Must have
- [x] Data Processing Agreement ready (if B2B) 🟠 Should have
- [x] GDPR data export / deletion flow 🟠 Should have
- [x] Acceptable Use Policy (if user-generated content) ⚪ Nice to have

## 🔒 Security
- [x] HTTPS everywhere — force redirect from HTTP 🔴 Must have
- [x] Security headers (CSP, HSTS, X-Frame-Options) 🔴 Must have
- [x] Input validation & sanitization 🔴 Must have
- [x] Rate limiting on API & auth endpoints 🔴 Must have
- [x] security.txt for responsible disclosure 🟠 Should have
- [x] Secrets out of codebase → env vars or vault 🔴 Must have
- [x] Dependency vulnerability scanning (Snyk, npm audit) 🟠 Should have

## ✉️ Email & Communications
- [x] Support email set up ( support@ or help@ ) with proper routing 🔴 Must have
- [x] Transactional email provider (Resend, Postmark, SES) 🔴 Must have
- [x] SPF, DKIM, DMARC records configured 🔴 Must have
- [x] Welcome email sent on signup 🟠 Should have
- [x] Password reset flow tested end to end 🔴 Must have
- [x] Email templates tested across clients ⚪ Nice to have
- [x] Unsubscribe link in marketing emails (CAN-SPAM) 🔴 Must have

## 🚨 Monitoring & Reliability
- [x] Error tracking live (Sentry, Bugsnag) 🔴 Must have
- [x] Uptime monitoring (BetterStack, UptimeRobot) 🔴 Must have
- [x] Structured logging in production 🟠 Should have
- [x] Public status page 🟠 Should have
- [x] Alerting wired up (Slack, email, PagerDuty) 🟠 Should have
- [x] Database backup strategy — automated + tested restore 🔴 Must have

## 💳 Billing & Payments
- [x] Payment provider integrated (Stripe, LemonSqueezy, Paddle) 🔴 Must have
- [x] Upgrade / downgrade flows tested 🔴 Must have
- [x] Failed payment & dunning handling 🔴 Must have
- [x] Cancellation flow with optional feedback 🟠 Should have
- [x] Invoice generation & receipts 🟠 Should have
- [x] Free trial edge cases tested 🟠 Should have
- [x] Tax handling (Stripe Tax, or Paddle auto-handles) 🟠 Should have

## ⚡ Performance
- [x] Lighthouse score > 90 on core pages 🟠 Should have
- [x] Core Web Vitals passing (LCP, CLS, INP) 🟠 Should have
- [x] CDN for static assets 🟠 Should have
- [x] Lazy loading for images & heavy components ⚪ Nice to have
- [x] Gzip / Brotli compression enabled 🟠 Should have

## 🚀 Launch Day
- [x] Changelog or What's New page 🟠 Should have
- [x] Feedback widget or form (Canny, Featurebase, plain form) 🟠 Should have
- [x] Documentation / Help Center — even a minimal one 🟠 Should have
- [x] Onboarding flow tested with a real person 🔴 Must have
- [x] Production environment smoke-tested end to end 🔴 Must have
- [x] Social sharing copy & visuals prepared 🟠 Should have
- [x] Launch post ready (Product Hunt, HN, Reddit, X) ⚪ Nice to have
- [x] Rollback plan if something goes wrong 🔴 Must have
