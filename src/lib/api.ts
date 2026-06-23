/**
 * Bad Decision — Frontend API Client
 * All calls go through Next.js API proxy routes (same origin, no CORS issues).
 * BACKEND_URL and BACKEND_API_SECRET stay server-side only.
 */
import type { CreditBalance, Lead, SmartCollection, EngineType } from '@/stores/app-store'

// ============================================================
// TYPES
// ============================================================
export interface SearchResponse {
  task_id: string
  status: string
  message?: string
  detail?: string
}

export interface TaskStatusResponse {
  task_id: string
  status: 'pending' | 'processing' | 'completed' | 'exhausted' | 'failed'
  engine?: string
  query?: string
  progress?: number
  current_step?: string
  leads?: Lead[]
  lead_count?: number
  credits_reserved?: number
  credits_spent?: number
  error_message?: string
  error?: string
  detail?: string
}

export interface CreditBalanceResponse {
  credits_balance: number
  credits_reserved: number
  total_purchased: number
}

// ============================================================
// API CALLS
// ============================================================

/**
 * Start a search task on the backend.
 * The proxy route adds user_id and auth headers automatically.
 */
export async function startSearch(engine: EngineType, query: string, country?: string, stateRegion?: string, creditsReserved?: number): Promise<SearchResponse> {
  const res = await fetch('/api/backend/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ engine, query, country, state_region: stateRegion, credits_reserved: creditsReserved }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.detail || data.error || `Search failed (${res.status})`)
  }

  return data
}

/**
 * Poll task status from the backend.
 * Returns current status + progress + leads if completed.
 */
export async function pollTaskStatus(taskId: string): Promise<TaskStatusResponse> {
  const res = await fetch(`/api/backend/tasks/status?taskId=${encodeURIComponent(taskId)}`, {
    method: 'GET',
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.detail || data.error || `Task check failed (${res.status})`)
  }

  return data
}

/**
 * Get user's credit balance from the backend.
 */
export async function fetchCreditBalance(): Promise<CreditBalanceResponse> {
  const res = await fetch('/api/backend/credits', {
    method: 'GET',
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Failed to fetch credits' }))
    throw new Error(data.detail || data.error || `Credit balance fetch failed (${res.status})`)
  }

  const data = await res.json()
  // Backend returns { balance: { credits_balance, ... } }
  return data.balance || data
}

/**
 * Verify a Paystack payment server-side.
 * After Paystack popup callback, verify with our server
 * before trusting the payment and updating the UI balance.
 * Returns the verified balance if successful.
 */
export async function verifyPayment(reference: string): Promise<{ verified: boolean; balance?: CreditBalanceResponse; status?: string }> {
  try {
    const res = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference }),
    })

    const data = await res.json()

    if (!res.ok || !data.verified) {
      return { verified: false, status: data.status || 'failed' }
    }

    return {
      verified: true,
      status: data.status,
      balance: data.balance,
    }
  } catch (err) {
    console.error('[API] Payment verification failed:', err)
    return { verified: false, status: 'error' }
  }
}

/**
 * Fetch user's search collections.
 * Each collection includes a real lead_count from the backend.
 */
export async function fetchCollections(userId: string): Promise<SmartCollection[]> {
  try {
    const res = await fetch('/api/backend/collections', {
      method: 'GET',
    })

    if (!res.ok) {
      console.error('[API] Collections fetch error:', await res.text())
      return []
    }

    const data = await res.json()

    return (data || []).map((task: any) => ({
      id: task.id,
      task_id: task.task_id || task.id,
      name: task.name || task.query || 'Untitled Search',
      task_type: (task.task_type || task.engine || 'ads_intent') as EngineType,
      lead_count: typeof task.lead_count === 'number' ? task.lead_count : Number(task.lead_count) || 0,
      created_at: task.created_at?.split('T')[0] || '',
    }))
  } catch (err) {
    console.error('[API] Collections fetch failed:', err)
    return []
  }
}

/**
 * Poll a search task until it completes or fails.
 * Polls every 2.5 seconds (for interactive UI feel), up to maxAttempts.
 * Calls onProgress callback with each status update for the progress bar.
 */
export async function pollUntilComplete(
  taskId: string,
  onProgress?: (status: TaskStatusResponse) => void,
  maxAttempts = 100,
  intervalMs = 2500,
): Promise<TaskStatusResponse> {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await pollTaskStatus(taskId)
    onProgress?.(status)

    if (status.status === 'completed' || status.status === 'failed' || status.status === 'exhausted') {
      return status
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs))
  }

  // After ~4 minutes of polling, throw with a helpful message.
  // The backend's stale task recovery will also fail the task and refund credits.
  throw new Error('Search is taking longer than expected. The server may have restarted. Your credits will be refunded automatically — please try again in a moment.')
}
