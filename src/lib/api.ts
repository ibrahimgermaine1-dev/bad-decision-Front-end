/**
 * BAD DECISION AI — API Service Layer
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://bad-decision-api.onrender.com';

interface RequestOptions {
  method?: string;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;
  
  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `API Error: ${response.status}`);
  }

  return response.json();
}

// Profile
export async function getProfile(userId: string) {
  return apiRequest<{ tier: string; email: string; created_at: string }>(`/api/profile/${userId}`);
}

// Pricing
export async function getPricing() {
  return apiRequest<{ plans: PricingPlan[]; coin_packages: CoinPackage[] }>('/api/pricing');
}

export async function getUserPricing(userId: string) {
  return apiRequest<{ plan: PricingPlan; coin_packages: CoinPackage[] }>(`/api/pricing/${userId}`);
}

// Tasks
export async function createTask(data: {
  userId: string;
  taskType: string;
  query: string;
  continent: string;
  country: string;
  stateRegion: string;
  coinsReserved: number;
}) {
  return apiRequest<{ task_id: string; status: string; coins_reserved: number }>('/api/tasks/create', {
    method: 'POST',
    body: data,
  });
}

export async function getUserTasks(userId: string) {
  return apiRequest<{ tasks: Task[] }>(`/api/tasks/${userId}`);
}

export async function getTaskById(taskId: string) {
  return apiRequest<Task>(`/api/tasks/detail/${taskId}`);
}

// Collections
export async function getCollections(userId: string) {
  return apiRequest<{ collections: Collection[] }>(`/api/collections/${userId}`);
}

// Leads
export async function getLeads(collectionId: string) {
  return apiRequest<{ leads: Lead[] }>(`/api/leads/${collectionId}`);
}

// Coins
export async function getCoinBalance(userId: string) {
  return apiRequest<{ coins_balance: number; coins_reserved: number; coins_lifetime: number }>(`/api/coins/${userId}`);
}

// Payment
export async function initializePayment(data: {
  userId: string;
  planType: string;
  packageId?: string;
  email: string;
}) {
  return apiRequest<{ authorization_url: string; reference: string; access_code: string }>('/api/paystack/initialize', {
    method: 'POST',
    body: data,
  });
}

export async function verifyPayment(reference: string) {
  return apiRequest<{ status: string; amount: number; plan: string }>(`/api/paystack/verify/${reference}`);
}

// Types
export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  coins: number;
  engines: number;
  searches_per_day: number;
  features: string[];
  popular?: boolean;
}

export interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  price: number;
  currency: string;
}

export interface Task {
  id: string;
  user_id: string;
  task_type: string;
  query: string;
  continent: string;
  country: string;
  state_region: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  coins_reserved: number;
  lead_count: number;
  created_at: string;
  completed_at?: string;
}

export interface Collection {
  id: string;
  name: string;
  task_type: string;
  lead_count: number;
  created_at: string;
}

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  category?: string;
  engine: string;
  verified?: boolean;
  social_profiles?: Record<string, string>;
}
