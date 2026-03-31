import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN && SENTRY_DSN !== 'your-sentry-dsn') {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 1,
    debug: false,
  });
}
