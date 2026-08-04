import { supabase, isSupabaseConfigured } from './supabase';

// ─── Plan Definitions (kept in sync with DB) ─────────────────────────────

export type PlanId = 'free' | 'pro' | 'enterprise';
export type BillingInterval = 'monthly' | 'yearly';

export interface PricingPlan {
  id: PlanId;
  name: string;
  description: string;
  monthlyPrice: number;  // USD
  yearlyPrice: number;   // USD per month (billed annually)
  currency: string;
  badge?: string;
  features: { text: string; included: boolean }[];
  limits: {
    maxProjects: number;       // -1 = unlimited
    maxMembersPerProject: number;
    maxStorageMb: number;
    hasAI: boolean;
    hasAnalytics: boolean;
    hasAutomation: boolean;
    hasPrioritySupport: boolean;
  };
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: '소규모 팀을 위한 무료 플랜',
    monthlyPrice: 0,
    yearlyPrice: 0,
    currency: 'USD',
    features: [
      { text: '프로젝트 최대 3개', included: true },
      { text: '프로젝트당 멤버 최대 5명', included: true },
      { text: '저장소 100MB', included: true },
      { text: '칸반 & 백로그 뷰', included: true },
      { text: '기본 스프린트 관리', included: true },
      { text: 'AI Copilot', included: false },
      { text: '고급 분석 & 리포트', included: false },
      { text: '자동화 규칙', included: false },
      { text: '우선 지원', included: false },
    ],
    limits: {
      maxProjects: 3,
      maxMembersPerProject: 5,
      maxStorageMb: 100,
      hasAI: false,
      hasAnalytics: false,
      hasAutomation: false,
      hasPrioritySupport: false,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    description: '성장하는 팀을 위한 완전한 기능',
    monthlyPrice: 12,
    yearlyPrice: 9,
    currency: 'USD',
    badge: '가장 인기',
    features: [
      { text: '프로젝트 최대 20개', included: true },
      { text: '프로젝트당 멤버 최대 25명', included: true },
      { text: '저장소 5GB', included: true },
      { text: '모든 뷰 & 로드맵', included: true },
      { text: '고급 스프린트 관리', included: true },
      { text: 'AI Copilot (Gemini 기반)', included: true },
      { text: '고급 분석 & 리포트', included: true },
      { text: '자동화 규칙 무제한', included: true },
      { text: '우선 지원', included: false },
    ],
    limits: {
      maxProjects: 20,
      maxMembersPerProject: 25,
      maxStorageMb: 5120,
      hasAI: true,
      hasAnalytics: true,
      hasAutomation: true,
      hasPrioritySupport: false,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: '대규모 조직을 위한 맞춤형 솔루션',
    monthlyPrice: 39,
    yearlyPrice: 29,
    currency: 'USD',
    features: [
      { text: '프로젝트 무제한', included: true },
      { text: '멤버 무제한', included: true },
      { text: '저장소 무제한', included: true },
      { text: '모든 Pro 기능 포함', included: true },
      { text: 'SAML SSO / LDAP 연동', included: true },
      { text: '전용 AI 인스턴스', included: true },
      { text: '감사 로그', included: true },
      { text: 'SLA 99.9% 보장', included: true },
      { text: '전담 기술 지원', included: true },
    ],
    limits: {
      maxProjects: -1,
      maxMembersPerProject: -1,
      maxStorageMb: -1,
      hasAI: true,
      hasAnalytics: true,
      hasAutomation: true,
      hasPrioritySupport: true,
    },
  },
];

// ─── Stripe plan key mapping ──────────────────────────────────────────────

const PLAN_KEYS: Record<PlanId, Record<BillingInterval, string>> = {
  free: { monthly: 'free', yearly: 'free' },
  pro: { monthly: 'pro_monthly', yearly: 'pro_yearly' },
  enterprise: { monthly: 'enterprise_monthly', yearly: 'enterprise_yearly' },
};

// ─── Subscription State ──────────────────────────────────────────────────

export interface UserSubscription {
  planId: PlanId;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'free';
  planKey: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

/** Fetch the current user's subscription from Supabase */
export async function fetchUserSubscription(userId: string): Promise<UserSubscription> {
  const fallback: UserSubscription = { planId: 'free', status: 'free', planKey: 'free' };
  if (!isSupabaseConfigured) return fallback;

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('status, plan_key, current_period_end, cancel_at_period_end')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .maybeSingle();

    if (error || !data) return fallback;

    // Derive plan from plan_key (e.g. 'pro_monthly' → 'pro')
    const planId = (data.plan_key?.split('_')[0] ?? 'free') as PlanId;
    return {
      planId: PRICING_PLANS.find(p => p.id === planId) ? planId : 'free',
      status: data.status,
      planKey: data.plan_key,
      currentPeriodEnd: data.current_period_end,
      cancelAtPeriodEnd: data.cancel_at_period_end,
    };
  } catch {
    return fallback;
  }
}

/** Subscribe to realtime subscription status changes */
export function subscribeToSubscription(
  userId: string,
  onChange: (sub: UserSubscription) => void
) {
  if (!isSupabaseConfigured) return () => {};

  const channel = supabase
    .channel(`subscription:${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'subscriptions', filter: `user_id=eq.${userId}` },
      async () => {
        const sub = await fetchUserSubscription(userId);
        onChange(sub);
      }
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

// ─── Checkout ────────────────────────────────────────────────────────────

export interface CreateCheckoutOptions {
  planId: PlanId;
  interval: BillingInterval;
  userId: string;
  email: string;
}

export async function createCheckoutSession(opts: CreateCheckoutOptions): Promise<string> {
  const { planId, interval, userId, email } = opts;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

  const res = await fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({
      planKey: PLAN_KEYS[planId][interval],
      userId,
      email,
      successUrl: `${window.location.origin}/settings?billing=success`,
      cancelUrl: `${window.location.origin}/settings?billing=canceled`,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.url) throw new Error(data.error ?? 'Failed to create checkout session');
  return data.url;
}

/** Open Stripe Customer Portal for managing subscription */
export async function openCustomerPortal(userId: string): Promise<string> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

  const res = await fetch(`${supabaseUrl}/functions/v1/customer-portal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({
      userId,
      returnUrl: `${window.location.origin}/settings`,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.url) throw new Error(data.error ?? 'Failed to open customer portal');
  return data.url;
}

/** Get plan info by ID */
export function getPlan(planId: PlanId): PricingPlan {
  return PRICING_PLANS.find(p => p.id === planId) ?? PRICING_PLANS[0];
}
