/**
 * Bad Decision — Backend API Client
 * Connects to the Python backend on Render.
 * All search tasks and lead fetching go through here.
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'https://bad-decision-backend-main.onrender.com'

// ============================================================
// CUSTOM ERROR CLASS
// ============================================================
export class TaskCreateError extends Error {
  status: number
  code: 'INSUFFICIENT_COINS' | 'ENGINE_NOT_AVAILABLE' | 'RATE_LIMITED' | 'UNKNOWN'
  detail: string
  userMessage: string

  constructor(status: number, code: TaskCreateError['code'], detail: string, userMessage: string) {
    super(userMessage)
    this.name = 'TaskCreateError'
    this.status = status
    this.code = code
    this.detail = detail
    this.userMessage = userMessage
  }
}

function parseTaskErrorCode(status: number, detail: string): TaskCreateError['code'] {
  if (status === 402) return 'INSUFFICIENT_COINS'
  if (status === 403) return 'ENGINE_NOT_AVAILABLE'
  if (status === 429) return 'RATE_LIMITED'
  return 'UNKNOWN'
}

function buildUserMessage(status: number, detail: string): string {
  if (status === 402) return 'You don\'t have enough coins to start this search. Please top up and try again.'
  if (status === 403) return `The selected search engine is currently unavailable. ${detail || 'Please try a different engine or try again later.'}`
  if (status === 429) return 'You\'re making requests too quickly. Please wait a moment and try again.'
  return `Something went wrong creating your task. ${detail || 'Please try again.'}`
}

// ============================================================
// TASKS
// ============================================================
export async function createTask(params: {
  user_id: string
  task_type: string
  query: string
  coins_reserved: number
  continent?: string
  country?: string
  state_region?: string
}) {
  const res = await fetch(`${BACKEND_URL}/api/tasks/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) {
    let detail = ''
    try {
      const body = await res.json()
      detail = body.detail || body.message || body.error || JSON.stringify(body)
    } catch {
      try {
        detail = await res.text()
      } catch {
        detail = 'Unknown error'
      }
    }
    const code = parseTaskErrorCode(res.status, detail)
    const userMessage = buildUserMessage(res.status, detail)
    throw new TaskCreateError(res.status, code, detail, userMessage)
  }
  return res.json()
}

export async function getUserTasks(userId: string) {
  const res = await fetch(`${BACKEND_URL}/api/tasks/${userId}`)
  if (!res.ok) {
    throw new Error(`Get tasks failed: ${res.status}`)
  }
  return res.json()
}

export async function getCollectionLeads(collectionId: string) {
  const res = await fetch(`${BACKEND_URL}/api/leads/${collectionId}`)
  if (!res.ok) {
    throw new Error(`Get leads failed: ${res.status}`)
  }
  return res.json()
}

export async function getLeadsByTaskId(taskId: string) {
  const res = await fetch(`${BACKEND_URL}/api/leads/task/${taskId}`)
  if (!res.ok) {
    throw new Error(`Get leads by task failed: ${res.status}`)
  }
  return res.json()
}

// ============================================================
// TYPES — Engine-specific data structures
// ============================================================
export type EngineType = 'ads_intent' | 'smb_maps' | 'web_absent' | 'social_intent'

export interface LeadData {
  domain_hash: string
  company_name: string
  website_url: string
  dm_name: string
  dm_position: string
  verified_email: string
  is_catchall: boolean
  linkedin: string
  instagram: string
  phone: string
  address: string
  engine_type: EngineType
  engine_data: Record<string, any>
  discovery_source: string
  email_source: string
  // Legacy fields (still present in some engines)
  ad_platform?: string
  aggregator_source?: string
  aggregator_url?: string
  platform?: string
  intent_text?: string
}

// ============================================================
// COLLECTIONS
// ============================================================
export async function getUserCollections(userId: string) {
  const res = await fetch(`${BACKEND_URL}/api/collections/${userId}`)
  if (!res.ok) {
    throw new Error(`Get collections failed: ${res.status}`)
  }
  return res.json()
}

export async function fetchPaystackPublicKey(): Promise<string> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/pricing`)
    if (res.ok) {
      const data = await res.json()
      return data.paystack_public_key || ''
    }
  } catch {}
  return ''
}

export async function pollTaskUntilDone(
  userId: string,
  taskId: string,
  maxAttempts = 90,
  onStatusChange?: (status: string) => void
): Promise<any> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const data = await getUserTasks(userId)
      const task = data.tasks?.find((t: any) => t.id === taskId)
      if (!task) {
        if (onStatusChange) onStatusChange('pending')
        await new Promise((r) => setTimeout(r, 3000))
        continue
      }
      if (onStatusChange) onStatusChange(task.status)
      if (
        task.status === 'completed' ||
        task.status === 'exhausted' ||
        task.status === 'failed'
      )
        return task
    } catch (err) {
      console.error('[POLL] Error fetching tasks:', err)
    }
    await new Promise((r) => setTimeout(r, 3000))
  }
  throw new Error('Task polling timeout')
}

// ============================================================
// PAYMENTS
// ============================================================
export interface PaystackInitializeResponse {
  authorization_url: string
  reference: string
  access_code: string
}

export async function initializePaystackPayment(params: {
  user_id: string
  email: string
  plan_type?: string
  package_id?: string
}): Promise<PaystackInitializeResponse> {
  const res = await fetch(`${BACKEND_URL}/api/paystack/initialize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Initialize payment failed: ${res.status} ${text}`)
  }
  return res.json()
}

export async function verifyPaystackPayment(reference: string) {
  const res = await fetch(`${BACKEND_URL}/api/paystack/verify/${reference}`)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Verify payment failed: ${res.status} ${text}`)
  }
  return res.json()
}

// ============================================================
// USER PROFILE
// ============================================================
export async function getUserProfile(userId: string) {
  const res = await fetch(`${BACKEND_URL}/api/profile/${userId}`)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Get profile failed: ${res.status} ${text}`)
  }
  return res.json()
}
