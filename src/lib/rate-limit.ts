/**
 * Bad Decision AI — Rate Limiter
 * In-memory sliding window rate limiter for API routes.
 * Tracks requests per IP + user combination.
 * 
 * Usage in API routes:
 *   import { checkRateLimit } from '@/lib/rate-limit'
 *   const rateLimitResult = checkRateLimit(request, { maxRequests: 10, windowMs: 60000 })
 *   if (!rateLimitResult.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
 */

interface RateLimitEntry {
  timestamps: number[]
}

// In-memory store: key -> { timestamps }
const store = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    // Remove entries older than 10 minutes (safety margin)
    entry.timestamps = entry.timestamps.filter(ts => now - ts < 600000)
    if (entry.timestamps.length === 0) {
      store.delete(key)
    }
  }
}, 300000)

export interface RateLimitOptions {
  /** Maximum number of requests allowed in the window */
  maxRequests: number
  /** Time window in milliseconds */
  windowMs: number
  /** Optional custom key prefix */
  keyPrefix?: string
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

const DEFAULT_OPTIONS: RateLimitOptions = {
  maxRequests: 30,
  windowMs: 60000, // 1 minute
  keyPrefix: 'rl',
}

/**
 * Check rate limit for a request.
 * Uses IP address + optional user ID as the rate limit key.
 */
export function checkRateLimit(
  request: Request,
  options: Partial<RateLimitOptions> = {}
): RateLimitResult {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const now = Date.now()

  // Build the rate limit key from IP + path
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'
  const path = new URL(request.url).pathname
  const key = `${opts.keyPrefix}:${ip}:${path}`

  // Get or create entry
  let entry = store.get(key)
  if (!entry) {
    entry = { timestamps: [] }
    store.set(key, entry)
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter(ts => now - ts < opts.windowMs)

  // Check if limit exceeded
  if (entry.timestamps.length >= opts.maxRequests) {
    const oldestInWindow = entry.timestamps[0]
    return {
      success: false,
      remaining: 0,
      resetAt: oldestInWindow + opts.windowMs,
    }
  }

  // Add current request timestamp
  entry.timestamps.push(now)

  return {
    success: true,
    remaining: opts.maxRequests - entry.timestamps.length,
    resetAt: now + opts.windowMs,
  }
}

/**
 * Stricter rate limit for expensive operations (search, payments)
 */
export function checkStrictRateLimit(
  request: Request,
  maxRequests = 5,
  windowMs = 60000
): RateLimitResult {
  return checkRateLimit(request, {
    maxRequests,
    windowMs,
    keyPrefix: 'strict',
  })
}

/**
 * Webhook rate limit (more permissive since they come from trusted sources)
 */
export function checkWebhookRateLimit(
  request: Request,
  maxRequests = 100,
  windowMs = 60000
): RateLimitResult {
  return checkRateLimit(request, {
    maxRequests,
    windowMs,
    keyPrefix: 'webhook',
  })
}
