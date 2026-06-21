/**
 * Sentry Edge Config (Edge runtime)
 * ==================================
 * Runs in Next.js middleware + Edge API routes. We don't currently use
 * the Edge runtime for anything (middleware runs on Node by default in
 * this app), but having this file means Sentry will pick up errors
 * automatically if we add Edge routes later.
 *
 * Only initializes if SENTRY_DSN is set.
 */
import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN
const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT || 'production'

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
  })
}
