/**
 * FINGERPRINT PRO — Client-Side Device Identification
 *
 * Uses FingerprintJS Pro to generate a unique visitor ID for each device.
 * This visitor ID is used to prevent duplicate free-trial abuse:
 * one device = one free account.
 *
 * Flow:
 *   1. On the sign-up page, call getVisitorId() to generate a fingerprint.
 *   2. Send the visitorId + requestId to /api/fingerprint for server-side verification.
 *   3. The server checks if this device already has an account.
 *   4. If duplicate found, the signup is blocked.
 *
 * Fallback: If Fingerprint Pro is not configured, returns null.
 * The system gracefully degrades — duplicate prevention won't work without it,
 * but the app still functions.
 */

import FpJSPro from '@fingerprintjs/fingerprintjs-pro'

let fpPromise: Promise<ReturnType<typeof FpJSPro.load>> | null = null

/**
 * Initialize the Fingerprint Pro agent.
 * Call this early (on page load) so the agent is ready when needed.
 * Returns null if the public API key is not configured.
 */
export function initFingerprintPro(): Promise<ReturnType<typeof FpJSPro.load>> | null {
  const publicKey = process.env.NEXT_PUBLIC_FINGERPRINT_PRO_PUBLIC_API_KEY

  if (!publicKey) {
    console.warn('[FingerprintPro] NEXT_PUBLIC_FINGERPRINT_PRO_PUBLIC_API_KEY not set — device fingerprinting disabled')
    return null
  }

  if (!fpPromise) {
    fpPromise = FpJSPro.load({
      apiKey: publicKey,
      // Use the closest region endpoint for lower latency
      region: 'us',
      // Extended result gives us confidence score, bot detection, etc.
      extendedResult: true,
    })
  }

  return fpPromise
}

export interface FingerprintResult {
  /** Unique identifier for this device/browser */
  visitorId: string
  /** Request ID for server-side verification */
  requestId: string
  /** Confidence score (0-1) — how certain the ID is correct */
  confidence: number
  /** Whether the request came from a bot */
  botDetected: boolean
  /** Whether incognito mode was detected */
  incognito: boolean
}

/**
 * Get the device fingerprint.
 * Must be called after initFingerprintPro().
 * Returns null if Fingerprint Pro is not configured or if an error occurs.
 */
export async function getFingerprint(): Promise<FingerprintResult | null> {
  try {
    const fp = initFingerprintPro()
    if (!fp) return null

    const result = await fp.get()

    return {
      visitorId: result.visitorId,
      requestId: result.requestId,
      confidence: result.confidence?.score ?? 0,
      botDetected: (result as any).bot?.detected ?? false,
      incognito: result.incognito ?? false,
    }
  } catch (error) {
    console.error('[FingerprintPro] Error getting fingerprint:', error)
    return null
  }
}

/**
 * Check with our server whether this device already has an account.
 * Returns true if the device is clean (no existing account).
 * Returns false if the device already has an account (blocked).
 */
export async function checkDeviceFingerprint(fingerprint: FingerprintResult): Promise<{
  isClean: boolean
  message: string
}> {
  try {
    const res = await fetch('/api/fingerprint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitor_id: fingerprint.visitorId,
        request_id: fingerprint.requestId,
        confidence: fingerprint.confidence,
        bot_detected: fingerprint.botDetected,
        incognito: fingerprint.incognito,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      return {
        isClean: false,
        message: data.error || 'Device check failed',
      }
    }

    const data = await res.json()
    return {
      isClean: data.is_clean,
      message: data.message,
    }
  } catch (error) {
    console.error('[FingerprintPro] Error checking device:', error)
    // On network error, allow signup to proceed (graceful degradation)
    return {
      isClean: true,
      message: 'Device check skipped — network error',
    }
  }
}
