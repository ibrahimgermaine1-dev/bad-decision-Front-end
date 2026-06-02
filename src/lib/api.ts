// ============================================================
// API CLIENT — Type-safe wrapper for all backend API calls
// Routes to Next.js API routes (same origin) which proxy
// to the Render backend when needed.
// Uses UNIFIED SCHEMA: profiles, usage_ledger, tasks, etc.
// ============================================================

const API_BASE = "/api";

// ---- User/Profile ----
export async function fetchUser(clerkId: string) {
  const res = await fetch(`${API_BASE}/user?clerk_id=${encodeURIComponent(clerkId)}`);
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

// ---- Coins/Usage Ledger ----
export async function fetchCoins(clerkId: string) {
  const res = await fetch(`${API_BASE}/coins?clerk_id=${encodeURIComponent(clerkId)}`);
  if (!res.ok) throw new Error("Failed to fetch coins");
  return res.json();
}

export async function adjustCoins(clerkId: string, amount: number, transactionType: string, description: string) {
  const res = await fetch(`${API_BASE}/coins`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clerk_id: clerkId, amount, transaction_type: transactionType, description }),
  });
  if (!res.ok) throw new Error("Failed to adjust coins");
  return res.json();
}

// ---- Search/Tasks ----
export async function startSearch(clerkId: string, taskType: string, query: string) {
  const res = await fetch(`${API_BASE}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clerk_id: clerkId, task_type: taskType, query }),
  });
  if (!res.ok) throw new Error("Failed to start search");
  return res.json();
}

export async function fetchSearchResults(taskId: string) {
  const res = await fetch(`${API_BASE}/search?task_id=${encodeURIComponent(taskId)}`);
  if (!res.ok) throw new Error("Failed to fetch search results");
  return res.json();
}

// ---- Email Verification ----
export async function verifyEmail(email: string) {
  const res = await fetch(`${API_BASE}/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Failed to verify email");
  return res.json();
}

// ---- Paystack ----
export async function initializePaystackPayment(clerkId: string, packageName: string, email: string, currency: string = "NGN") {
  const res = await fetch(`${API_BASE}/paystack`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clerk_id: clerkId, package: packageName, email, currency }),
  });
  if (!res.ok) throw new Error("Failed to initialize payment");
  return res.json();
}

// ---- Support Tickets ----
export async function createTicket(clerkId: string, subject: string, message: string) {
  const res = await fetch(`${API_BASE}/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clerk_id: clerkId, subject, message }),
  });
  if (!res.ok) throw new Error("Failed to create ticket");
  return res.json();
}

export async function fetchTickets(clerkId: string) {
  const res = await fetch(`${API_BASE}/tickets?clerk_id=${encodeURIComponent(clerkId)}`);
  if (!res.ok) throw new Error("Failed to fetch tickets");
  return res.json();
}
