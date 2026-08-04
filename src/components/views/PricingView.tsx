import React, { useState } from 'react';
import {
  PRICING_PLANS,
  createCheckoutSession,
  type PlanId,
  type BillingInterval,
} from '../../services/stripeService';
import { useSubscription } from '../../context/SubscriptionContext';
import { useAether } from '../../context/AetherContextValue';
import { useToast } from '../../context/ToastContext';

// ─── Icons ───────────────────────────────────────────────────────────────

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const IconBolt = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" fillOpacity="0.15" />
  </svg>
);

const IconBuilding = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" fillOpacity="0.1" />
    <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
  </svg>
);

// ─── PricingView ──────────────────────────────────────────────────────────

export const PricingView: React.FC = () => {
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const { subscription, planId: currentPlanId } = useSubscription();
  const { authUser, currentUser } = useAether();
  const { error } = useToast();

  const handleUpgrade = async (planId: PlanId) => {
    if (planId === 'free') return;
    if (!authUser && !currentUser) {
      error('로그인 필요', '업그레이드하려면 먼저 로그인하세요.');
      return;
    }

    setLoadingPlan(planId);
    try {
      const url = await createCheckoutSession({
        planId,
        interval,
        userId: authUser?.id ?? currentUser.id,
        email: authUser?.email ?? currentUser.email,
      });
      window.location.href = url;
    } catch (e) {
      error('결제 오류', (e as Error).message || '결제 페이지를 열 수 없습니다.');
      setLoadingPlan(null);
    }
  };

  const savings = (plan: typeof PRICING_PLANS[0]) => {
    if (plan.monthlyPrice === 0) return null;
    const saved = Math.round((1 - plan.yearlyPrice / plan.monthlyPrice) * 100);
    return saved > 0 ? `${saved}% 절약` : null;
  };

  const getButtonLabel = (planId: PlanId) => {
    if (planId === 'free') return '현재 플랜';
    if (planId === currentPlanId && subscription.status === 'active') return '현재 플랜 ✓';
    if (currentPlanId !== 'free') return '플랜 변경';
    return '시작하기';
  };

  const isCurrentPlan = (planId: PlanId) =>
    planId === currentPlanId && ['active', 'trialing'].includes(subscription.status);

  return (
    <div className="pricing-view animate-fade-in">
      {/* Header */}
      <div className="pricing-header">
        <div className="pricing-header-badge">💳 요금제</div>
        <h1 className="pricing-title">팀에 맞는 플랜을 선택하세요</h1>
        <p className="pricing-subtitle">
          언제든지 업그레이드하거나 다운그레이드할 수 있습니다.
        </p>

        {/* Billing interval toggle */}
        <div className="pricing-interval-toggle">
          <button
            className={`interval-btn ${interval === 'monthly' ? 'active' : ''}`}
            onClick={() => setInterval('monthly')}
          >
            월간 결제
          </button>
          <button
            className={`interval-btn ${interval === 'yearly' ? 'active' : ''}`}
            onClick={() => setInterval('yearly')}
          >
            연간 결제
            <span className="interval-saving-badge">최대 25% 절약</span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="pricing-cards-grid">
        {PRICING_PLANS.map((plan) => {
          const price = interval === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
          const isCurrent = isCurrentPlan(plan.id);
          const isPro = plan.id === 'pro';
          const saving = savings(plan);

          return (
            <div
              key={plan.id}
              className={`pricing-card ${isPro ? 'pricing-card--featured' : ''} ${isCurrent ? 'pricing-card--current' : ''}`}
            >
              {isPro && <div className="pricing-card-badge">{plan.badge}</div>}

              {/* Plan header */}
              <div className="pricing-card-header">
                <div className="pricing-plan-icon">
                  {plan.id === 'free' ? '🌱' : plan.id === 'pro' ? <IconBolt /> : <IconBuilding />}
                </div>
                <div>
                  <h3 className="pricing-plan-name">{plan.name}</h3>
                  <p className="pricing-plan-desc">{plan.description}</p>
                </div>
              </div>

              {/* Price */}
              <div className="pricing-price-block">
                {plan.monthlyPrice === 0 ? (
                  <div className="pricing-price">
                    <span className="pricing-price-amount">무료</span>
                  </div>
                ) : (
                  <div className="pricing-price">
                    <span className="pricing-price-currency">$</span>
                    <span className="pricing-price-amount">{price}</span>
                    <span className="pricing-price-period">/월</span>
                  </div>
                )}
                {interval === 'yearly' && saving && plan.monthlyPrice > 0 && (
                  <div className="pricing-saving-tag">{saving}</div>
                )}
                {interval === 'yearly' && plan.monthlyPrice > 0 && (
                  <p className="pricing-yearly-note">
                    연간 ${price * 12} 청구
                  </p>
                )}
              </div>

              {/* CTA button */}
              <button
                className={`pricing-cta-btn ${
                  plan.id === 'free' || isCurrent
                    ? 'pricing-cta-btn--disabled'
                    : isPro
                    ? 'pricing-cta-btn--featured'
                    : 'pricing-cta-btn--outline'
                }`}
                disabled={plan.id === 'free' || isCurrent || loadingPlan !== null}
                onClick={() => handleUpgrade(plan.id)}
              >
                {loadingPlan === plan.id ? (
                  <span className="pricing-btn-loading">
                    <span className="auth-spinner" style={{ width: 14, height: 14, borderWidth: 2, marginRight: 6 }} />
                    처리 중...
                  </span>
                ) : getButtonLabel(plan.id)}
              </button>

              {/* Features list */}
              <ul className="pricing-features-list">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className={`pricing-feature-item ${!feat.included ? 'pricing-feature-item--disabled' : ''}`}>
                    <span className={`pricing-feature-icon ${feat.included ? 'included' : 'excluded'}`}>
                      {feat.included ? <IconCheck /> : <IconX />}
                    </span>
                    {feat.text}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* FAQ / Notes */}
      <div className="pricing-footer-note">
        <p>💡 모든 플랜은 무료 체험 기간 없이 즉시 활성화됩니다. 결제는 Stripe에 의해 안전하게 처리되며, 언제든지 취소할 수 있습니다.</p>
        <p style={{ marginTop: 8 }}>🔒 결제 정보는 AetherPulse 서버에 저장되지 않습니다. Stripe PCI DSS 준수 환경에서 처리됩니다.</p>
      </div>
    </div>
  );
};
