-- ================================================================
-- AetherPulse Stripe Subscription Schema Migration
-- Run in: Supabase Dashboard → SQL Editor
-- ================================================================

-- Subscription plans reference table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id TEXT PRIMARY KEY,                -- 'free' | 'pro' | 'enterprise'
  name TEXT NOT NULL,
  max_projects INTEGER NOT NULL DEFAULT 3,
  max_members_per_project INTEGER NOT NULL DEFAULT 5,
  max_storage_mb INTEGER NOT NULL DEFAULT 100,
  has_ai_features BOOLEAN NOT NULL DEFAULT false,
  has_analytics BOOLEAN NOT NULL DEFAULT false,
  has_automation BOOLEAN NOT NULL DEFAULT false,
  has_priority_support BOOLEAN NOT NULL DEFAULT false
);

-- Seed plan definitions
INSERT INTO public.subscription_plans VALUES
  ('free',       'Free',       3,    5,    100,   false, false, false, false),
  ('pro',        'Pro',        20,   25,   5000,  true,  true,  true,  false),
  ('enterprise', 'Enterprise', -1,   -1,   -1,    true,  true,  true,  true)
ON CONFLICT (id) DO NOTHING;

-- Active subscriptions per user
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id TEXT PRIMARY KEY,                          -- Stripe subscription ID
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'incomplete',    -- active | canceled | past_due | trialing | incomplete
  plan_key TEXT NOT NULL DEFAULT 'free',        -- e.g. 'pro_monthly'
  price_id TEXT,                                -- Stripe price ID
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique active subscription per user
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_user_active
  ON public.subscriptions (user_id)
  WHERE status = 'active';

-- RLS policies
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscription
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert/update (via webhook Edge Function)
CREATE POLICY "Service role manages subscriptions"
  ON public.subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- Anyone can read plans (public pricing page)
CREATE POLICY "Public can read plans"
  ON public.subscription_plans FOR SELECT
  USING (true);

-- Realtime for subscription status changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;
