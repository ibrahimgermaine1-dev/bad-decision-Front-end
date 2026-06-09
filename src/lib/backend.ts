/**
 * Bad Decision — Backend API Client
 * Connects to the Python backend on Render.
 * All search tasks and lead fetching go through here.
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://bad-decision-backend-main.onrender.com'

export async function createTask(params: {
  user_id: string
  task_type: string
  query: string
  coins_reserved: number
}) {
  const res = await fetch(`${BACKEND_URL}/api/tasks/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Create task failed: ${res.status} ${text}`)
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

export async function pollTaskUntilDone(
  userId: string,
  taskId: string,
  maxAttempts = 60,
  onStatusChange?: (status: string) => void
): Promise<any> {
  for (let i = 0; i < maxAttempts; i++) {
    const data = await getUserTasks(userId)
    const task = data.tasks?.find((t: any) => t.id === taskId)
    if (!task) {
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
    await new Promise((r) => setTimeout(r, 3000))
  }
  throw new Error('Task polling timeout')
}
