/**
 * Sentry Server Config (Node.js runtime)
 * =======================================
 * Runs in Next.js API routes + Server Components (Node.js runtime).
 * Captures unhandled exceptions during SSR + API route handlers.
 * Only initializes if SENTRY_DSN is set — silently skipped otherwise.
 *
 * This file is imported automatically by instrumentation.ts when
 * running on the server. Do NOT import it directly.
 */
import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN
const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT || 'production'

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,

    // Performance monitoring — 10% of server-side transactions
    tracesSampleRate: 0.1,

    // Don't send PII (we explicitly don't want Clerk user IDs in Sentry)
    sendDefaultPii: false,

    // Ignore 4xx HTTP exceptions — they're client mistakes, not server bugs.
    // (FastAPI on the backend also ignores these; mirror that here.)
    ignoreErrors: [],
  })
}
