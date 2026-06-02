-- ============================================================
-- BAD DECISION AI — DEFINITIVE Supabase Database Schema
-- ============================================================
-- This is the ONE schema that BOTH the frontend (Next.js)
-- and the backend (Python/FastAPI on Render) expect.
--
-- Table names match what the Python backend uses:
--   profiles, tasks, global_intelligence_cache,
--   workspace_leads, smart_collections, coin_balances,
--   coin_transactions, payments, support_tickets
--
-- Run this ENTIRE script in Supabase SQL Editor.
-- If you already have old tables, run the cleanup script first.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES TABLE (the Python backend calls this "profiles")
-- Created by Clerk webhook on user.signup
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT DEFAULT '',
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'starter', 'growth', 'pro')),
  country TEXT DEFAULT 'US',
  device_fingerprint TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fingerprint duplicate lookups
CREATE INDEX IF NOT EXISTS idx_profiles_device_fingerprint ON public.profiles(device_fingerprint) WHERE device_fingerprint != '';
-- Index for clerk_id lookups
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_id ON public.profiles(clerk_id);

-- ============================================================
-- 2. COIN BALANCES TABLE
-- The Python backend uses deduct_coins/add_coins RPCs to modify this
-- ============================================================
CREATE TABLE IF NOT EXISTS public.coin_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  coins_reserved INTEGER NOT NULL DEFAULT 0,
  total_purchased INTEGER NOT NULL DEFAULT 0,
  last_recharge_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================
-- 3. COIN TRANSACTIONS TABLE
-- Every coin movement is logged here (audit trail)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.coin_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'signup_bonus',
    'purchase',
    'search_debit',
    'refund',
    'admin_credit'
  )),
  description TEXT DEFAULT '',
  reference_id TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. TASKS TABLE
-- The Python backend worker polls this table every 3 seconds
-- for pending tasks to process.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL CHECK (task_type IN ('ads_intent', 'smb_maps', 'web_absent', 'social_intent')),
  query TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'exhausted', 'failed')),
  coins_reserved INTEGER NOT NULL DEFAULT 0,
  results_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Index for the worker to find pending tasks quickly
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status) WHERE status IN ('pending', 'processing');
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);

-- ============================================================
-- 5. GLOBAL INTELLIGENCE CACHE
-- The deduplicated global lead database.
-- If the same business is found by multiple users, it's stored
-- once here and the second user gets it for free.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.global_intelligence_cache (
  domain_hash TEXT PRIMARY KEY,
  company_name TEXT DEFAULT 'ABSENT',
  website_url TEXT DEFAULT 'ABSENT',
  dm_name TEXT DEFAULT 'ABSENT',
  dm_position TEXT DEFAULT 'ABSENT',
  verified_email TEXT DEFAULT 'ABSENT',
  is_catchall BOOLEAN DEFAULT FALSE,
  email_status TEXT DEFAULT 'unverified' CHECK (email_status IN ('unverified', 'valid', 'invalid', 'catchall', 'risky')),
  linkedin TEXT DEFAULT 'ABSENT',
  instagram TEXT DEFAULT 'ABSENT',
  phone TEXT DEFAULT 'ABSENT',
  address TEXT DEFAULT 'ABSENT',
  ad_platform TEXT DEFAULT 'ABSENT',
  aggregator_source TEXT DEFAULT 'ABSENT',
  aggregator_url TEXT DEFAULT 'ABSENT',
  platform TEXT DEFAULT 'ABSENT',
  intent_text TEXT DEFAULT 'ABSENT',
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. SMART COLLECTIONS TABLE
-- Created automatically by the backend worker for each task.
-- Also used by the frontend for saving/managing leads.
-- MUST be created BEFORE workspace_leads (foreign key dependency).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.smart_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  task_type TEXT NOT NULL,
  lead_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. WORKSPACE LEADS (junction table)
-- Links tasks AND smart_collections to their discovered leads.
-- Has BOTH task_id and collection_id so both the frontend
-- and backend can query it their own way.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.workspace_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES public.smart_collections(id) ON DELETE CASCADE,
  lead_hash TEXT NOT NULL REFERENCES public.global_intelligence_cache(domain_hash),
  coins_charged INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 8. PAYMENTS TABLE
-- Records of all Paystack transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  paystack_reference TEXT UNIQUE NOT NULL,
  amount_kobo INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  coins_credited INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'abandoned')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

-- ============================================================
-- 9. SUPPORT TICKETS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_intelligence_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (clerk_id = auth.jwt()->>'sub');

-- Coin balances: users can read their own
CREATE POLICY "Users can read own coins" ON public.coin_balances
  FOR SELECT USING (user_id IN (SELECT id FROM public.profiles WHERE clerk_id = auth.jwt()->>'sub'));

-- Coin transactions: users can read their own
CREATE POLICY "Users can read own transactions" ON public.coin_transactions
  FOR SELECT USING (user_id IN (SELECT id FROM public.profiles WHERE clerk_id = auth.jwt()->>'sub'));

-- Tasks: users can read their own
CREATE POLICY "Users can read own tasks" ON public.tasks
  FOR SELECT USING (user_id IN (SELECT id FROM public.profiles WHERE clerk_id = auth.jwt()->>'sub'));

-- Global cache: all authenticated users can read
CREATE POLICY "Authenticated users can read cache" ON public.global_intelligence_cache
  FOR SELECT USING (true);

-- Workspace leads: users can read leads from their tasks
CREATE POLICY "Users can read own workspace leads" ON public.workspace_leads
  FOR SELECT USING (
    task_id IN (SELECT id FROM public.tasks WHERE user_id IN (SELECT id FROM public.profiles WHERE clerk_id = auth.jwt()->>'sub'))
    OR
    collection_id IN (SELECT id FROM public.smart_collections WHERE user_id IN (SELECT id FROM public.profiles WHERE clerk_id = auth.jwt()->>'sub'))
  );

-- Smart collections: users can read their own
CREATE POLICY "Users can read own collections" ON public.smart_collections
  FOR SELECT USING (user_id IN (SELECT id FROM public.profiles WHERE clerk_id = auth.jwt()->>'sub'));

-- Payments: users can read their own
CREATE POLICY "Users can read own payments" ON public.payments
  FOR SELECT USING (user_id IN (SELECT id FROM public.profiles WHERE clerk_id = auth.jwt()->>'sub'));

-- Support tickets: users can read their own
CREATE POLICY "Users can read own tickets" ON public.support_tickets
  FOR SELECT USING (user_id IN (SELECT id FROM public.profiles WHERE clerk_id = auth.jwt()->>'sub'));


-- ============================================================
-- RPC 1: handle_new_user
-- Called by the Clerk webhook handler on user.created
-- Creates a profile + coin balance + logs the signup bonus
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user(
  p_clerk_id TEXT,
  p_email TEXT,
  p_full_name TEXT DEFAULT '',
  p_country TEXT DEFAULT 'US'
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (clerk_id, email, full_name, country)
  VALUES (p_clerk_id, p_email, p_full_name, p_country)
  RETURNING id INTO v_user_id;

  -- Insert coin balance with 50 free coins
  INSERT INTO public.coin_balances (user_id, balance, coins_reserved, total_purchased)
  VALUES (v_user_id, 50, 0, 50);

  -- Log signup bonus transaction
  INSERT INTO public.coin_transactions (user_id, amount, transaction_type, description)
  VALUES (v_user_id, 50, 'signup_bonus', 'Free 50 coins on account creation');

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- RPC 2: deduct_coins
-- Used by the Python backend worker after a search completes
-- Atomically deducts coins and logs the transaction
-- ============================================================
CREATE OR REPLACE FUNCTION public.deduct_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT DEFAULT ''
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT balance INTO v_current_balance
  FROM public.coin_balances
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION 'User coin balance not found';
  END IF;

  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient coins: has %, needs %', v_current_balance, p_amount;
  END IF;

  -- Deduct
  UPDATE public.coin_balances
  SET balance = balance - p_amount,
      coins_reserved = GREATEST(0, coins_reserved - p_amount),
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Log transaction
  INSERT INTO public.coin_transactions (user_id, amount, transaction_type, description)
  VALUES (p_user_id, -p_amount, 'search_debit', COALESCE(p_description, 'Coins deducted for search'));

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- RPC 3: add_coins
-- Used by the Paystack webhook and admin actions
-- Atomically adds coins and logs the transaction
-- ============================================================
CREATE OR REPLACE FUNCTION public.add_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT DEFAULT 'purchase',
  p_description TEXT DEFAULT '',
  p_reference_id TEXT DEFAULT ''
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Add coins
  UPDATE public.coin_balances
  SET balance = balance + p_amount,
      total_purchased = total_purchased + p_amount,
      last_recharge_at = NOW(),
      updated_at = NOW()
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User coin balance not found';
  END IF;

  -- Log transaction
  INSERT INTO public.coin_transactions (user_id, amount, transaction_type, description, reference_id)
  VALUES (p_user_id, p_amount, p_transaction_type, COALESCE(p_description, 'Coins added'), p_reference_id);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- RPC 4: update_user_tier
-- Used by the Paystack webhook when a monthly plan is purchased
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_user_tier(
  p_user_id UUID,
  p_tier TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.profiles
  SET tier = p_tier, updated_at = NOW()
  WHERE id = p_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- RPC 5: check_global_cache
-- Checks if a company/website already exists in the global cache
-- Used by the Python backend for dedup
-- ============================================================
CREATE OR REPLACE FUNCTION public.check_global_cache(
  p_company_name TEXT DEFAULT '',
  p_website_url TEXT DEFAULT ''
)
RETURNS TABLE(
  domain_hash TEXT,
  company_name TEXT,
  website_url TEXT,
  dm_name TEXT,
  dm_position TEXT,
  verified_email TEXT,
  phone TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    gic.domain_hash,
    gic.company_name,
    gic.website_url,
    gic.dm_name,
    gic.dm_position,
    gic.verified_email,
    gic.phone
  FROM public.global_intelligence_cache gic
  WHERE
    (p_company_name != '' AND gic.company_name ILIKE '%' || p_company_name || '%')
    OR
    (p_website_url != '' AND gic.website_url ILIKE '%' || p_website_url || '%')
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
