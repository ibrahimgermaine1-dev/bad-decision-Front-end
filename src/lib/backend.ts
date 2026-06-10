/**
 * BAD DECISION AI — Backend API Client
 * All API calls that talk to the Python FastAPI backend at:
 * https://bad-decision-backend-main.onrender.com
 *
 * Backend endpoints (from /docs):
 *   GET  /                           — Health check
 *   GET  /health                     — DB health check
 *   POST /api/tasks/create           — Create a new search task
 *   GET  /api/tasks/{user_id}        — Get all tasks for a user
 *   GET  /api/leads/{collection_id}  — Get leads in a collection
 *   GET  /api/cache/check            — Check global cache
 *   POST /api/coins/deduct           — Deduct coins
 *   POST /api/coins/add              — Add coins after payment
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://bad-decision-backend-main.onrender.com'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface TaskResponse {
  success: boolean
  task: {
    id: string
    user_id: string
    task_type: string
    query: string
    status: string
    coins_reserved: number
    created_at: string
    [key: string]: unknown
  } | null
}

export interface TasksListResponse {
  tasks: {
    id: string
    user_id: string
    task_type: string
    query: string
    status: string
    coins_reserved: number
    created_at: string
    [key: string]: unknown
  }[]
}

export interface LeadsResponse {
  leads: {
    id: string
    task_id: string
    collection_id: string
    lead_hash: string
    global_intelligence_cache: {
      company_name: string
      website_url: string
      dm_name: string
      dm_position: string
      verified_email: string
      is_catchall: boolean
      linkedin: string
      instagram: string
      phone: string
      ad_platform?: string
      address?: string
      aggregator_source?: string
      aggregator_url?: string
      platform?: string
      intent_text?: string
      [key: string]: unknown
    } | null
    [key: string]: unknown
  }[]
}

export interface CoinOperationResponse {
  success: boolean
  data?: unknown
}

// ── API Functions ──────────────────────────────────────────────────────────────

/**
 * Health check — is the backend alive?
 */
export async function healthCheck(): Promise<{ status: string }> {
  const res = await fetch(`${BACKEND_URL}/`)
  if (!res.ok) throw new Error(`Backend health check failed: ${res.status}`)
  return res.json()
}

/**
 * Create a new search task.
 * The backend worker will pick it up and process it.
 *
 * Backend: POST /api/tasks/create
 *   Body params: user_id, task_type, query, coins_reserved
 */
export async function createTask(
  userId: string,
  taskType: string,
  query: string,
  coinsReserved: number = 0
): Promise<TaskResponse> {
  const res = await fetch(
    `${BACKEND_URL}/api/tasks/create?user_id=${encodeURIComponent(userId)}&task_type=${encodeURIComponent(taskType)}&query=${encodeURIComponent(query)}&coins_reserved=${coinsReserved}`,
    { method: 'POST' }
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Create task failed (${res.status}): ${text}`)
  }
  return res.json()
}

/**
 * Get all tasks for a user.
 *
 * Backend: GET /api/tasks/{user_id}
 *   Returns: { tasks: [...] }
 */
export async function getUserTasks(userId: string): Promise<TasksListResponse> {
  const res = await fetch(`${BACKEND_URL}/api/tasks/${encodeURIComponent(userId)}`)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Get tasks failed (${res.status}): ${text}`)
  }
  return res.json()
}

/**
 * Get all leads in a smart collection.
 *
 * Backend: GET /api/leads/{collection_id}
 *   Returns: { leads: [...] } — each lead has global_intelligence_cache joined
 */
export async function getCollectionLeads(collectionId: string): Promise<LeadsResponse> {
  const res = await fetch(`${BACKEND_URL}/api/leads/${encodeURIComponent(collectionId)}`)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Get leads failed (${res.status}): ${text}`)
  }
  return res.json()
}

/**
 * Check the global cache for existing leads.
 *
 * Backend: GET /api/cache/check?company_name=...&website_url=...
 */
export async function checkCache(companyName: string = '', websiteUrl: string = ''): Promise<{ cache_hits: unknown }> {
  const params = new URLSearchParams()
  if (companyName) params.set('company_name', companyName)
  if (websiteUrl) params.set('website_url', websiteUrl)
  const res = await fetch(`${BACKEND_URL}/api/cache/check?${params.toString()}`)
  if (!res.ok) throw new Error(`Cache check failed: ${res.status}`)
  return res.json()
}

/**
 * Deduct coins from a user's ledger.
 *
 * Backend: POST /api/coins/deduct?user_id=...&amount=...
 */
export async function deductCoins(userId: string, amount: number): Promise<CoinOperationResponse> {
  const res = await fetch(
    `${BACKEND_URL}/api/coins/deduct?user_id=${encodeURIComponent(userId)}&amount=${amount}`,
    { method: 'POST' }
  )
  if (!res.ok) throw new Error(`Deduct coins failed: ${res.status}`)
  return res.json()
}

/**
 * Add coins to a user's ledger (after payment).
 *
 * Backend: POST /api/coins/add?user_id=...&amount=...
 */
export async function addCoins(userId: string, amount: number): Promise<CoinOperationResponse> {
  const res = await fetch(
    `${BACKEND_URL}/api/coins/add?user_id=${encodeURIComponent(userId)}&amount=${amount}`,
    { method: 'POST' }
  )
  if (!res.ok) throw new Error(`Add coins failed: ${res.status}`)
  return res.json()
}

// ── Polling helper ─────────────────────────────────────────────────────────────

/**
 * Poll a task until it reaches a terminal state (completed, failed, exhausted).
 * Polls every `intervalMs` milliseconds, up to `maxAttempts` times.
 *
 * The backend worker processes tasks asynchronously:
 *   pending → processing → completed | failed | exhausted
 */
export async function pollTaskUntilDone(
  userId: string,
  taskId: string,
  intervalMs: number = 3000,
  maxAttempts: number = 120
): Promise<TasksListResponse['tasks'][0] | null> {
  for (let i = 0; i < maxAttempts; i++) {
    const data = await getUserTasks(userId)
    const task = data.tasks.find((t) => t.id === taskId)
    if (!task) return null

    if (['completed', 'failed', 'exhausted'].includes(task.status)) {
      return task
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }
  return null
}
