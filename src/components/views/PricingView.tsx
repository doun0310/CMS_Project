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
  const { authUser, currentUser, t } = useAether();
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

  const getSavingsTag = (plan: typeof PRICING_PLANS[0]) => {
    if (plan.monthlyPrice === 0) return null;
    const saved = Math.round((1 - plan.yearlyPrice / plan.monthlyPrice) * 100);
    if (saved <= 0) return null;
    return t('savePercent').replace('{percent}', `${saved}`);
  };

  const getButtonLabel = (planId: PlanId) => {
    if (planId === 'free') return t('currentPlan');
    if (planId === currentPlanId && subscription.status === 'active') return t('currentPlanActive');
    if (currentPlanId !== 'free') return t('changePlan');
    return t('getStarted');
  };

  const isCurrentPlan = (planId: PlanId) =>
    planId === currentPlanId && ['active', 'trialing'].includes(subscription.status);

  const getLocalizedPlanDesc = (planId: PlanId) => {
    switch (planId) {
      case 'free': return t('planFreeDesc');
      case 'pro': return t('planProDesc');
      case 'enterprise': return t('planEnterpriseDesc');
    }
  };

  const getLocalizedFeatures = (planId: PlanId) => {
    switch (planId) {
      case 'free':
        return [
          { text: t('featMaxProjects3'), included: true },
          { text: t('featMaxMembers5'), included: true },
          { text: t('featStorage100MB'), included: true },
          { text: t('featKanbanBacklog'), included: true },
          { text: t('featBasicSprint'), included: true },
          { text: t('featAiCopilot'), included: false },
          { text: t('featAnalytics'), included: false },
          { text: t('featUnlimitedAutomation'), included: false },
          { text: t('featPrioritySupport'), included: false },
        ];
      case 'pro':
        return [
          { text: t('featMaxProjects20'), included: true },
          { text: t('featMaxMembers25'), included: true },
          { text: t('featStorage5GB'), included: true },
          { text: t('featAllViewsRoadmap'), included: true },
          { text: t('featAdvancedSprint'), included: true },
          { text: t('featAiCopilot'), included: true },
          { text: t('featAnalytics'), included: true },
          { text: t('featUnlimitedAutomation'), included: true },
          { text: t('featPrioritySupport'), included: false },
        ];
      case 'enterprise':
        return [
          { text: t('featUnlimitedProjects'), included: true },
          { text: t('featUnlimitedMembers'), included: true },
          { text: t('featUnlimitedStorage'), included: true },
          { text: t('featAllProFeatures'), included: true },
          { text: t('featSsoLdap'), included: true },
          { text: t('featDedicatedAi'), included: true },
          { text: t('featAuditLog'), included: true },
          { text: t('featSla'), included: true },
          { text: t('featPrioritySupport'), included: true },
        ];
    }
  };

  return (
    <div className="pricing-view animate-fade-in">
      {/* Header */}
      <div className="pricing-header">
        <div className="pricing-header-badge">{t('pricingBadge')}</div>
        <h1 className="pricing-title">{t('pricingTitle')}</h1>
        <p className="pricing-subtitle">{t('pricingSubtitle')}</p>

        {/* Billing interval toggle */}
        <div className="pricing-interval-toggle">
          <button
            className={`interval-btn ${interval === 'monthly' ? 'active' : ''}`}
            onClick={() => setInterval('monthly')}
          >
            {t('monthlyBilling')}
          </button>
          <button
            className={`interval-btn ${interval === 'yearly' ? 'active' : ''}`}
            onClick={() => setInterval('yearly')}
          >
            {t('yearlyBilling')}
            <span className="interval-saving-badge">{t('saveUpTo')}</span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="pricing-cards-grid">
        {PRICING_PLANS.map((plan) => {
          const price = interval === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
          const isCurrent = isCurrentPlan(plan.id);
          const isPro = plan.id === 'pro';
          const savingTag = getSavingsTag(plan);
          const features = getLocalizedFeatures(plan.id);

          return (
            <div
              key={plan.id}
              className={`pricing-card ${isPro ? 'pricing-card--featured' : ''} ${isCurrent ? 'pricing-card--current' : ''}`}
            >
              {isPro && <div className="pricing-card-badge">{t('mostPopular')}</div>}

              {/* Plan header */}
              <div className="pricing-card-header">
                <div className="pricing-plan-icon">
                  {plan.id === 'free' ? '🌱' : plan.id === 'pro' ? <IconBolt /> : <IconBuilding />}
                </div>
                <div>
                  <h3 className="pricing-plan-name">{plan.name}</h3>
                  <p className="pricing-plan-desc">{getLocalizedPlanDesc(plan.id)}</p>
                </div>
              </div>

              {/* Price */}
              <div className="pricing-price-block">
                {plan.monthlyPrice === 0 ? (
                  <div className="pricing-price">
                    <span className="pricing-price-amount">{t('freePrice')}</span>
                  </div>
                ) : (
                  <div className="pricing-price">
                    <span className="pricing-price-currency">$</span>
                    <span className="pricing-price-amount">{price}</span>
                    <span className="pricing-price-period">{t('perMonth')}</span>
                  </div>
                )}
                {interval === 'yearly' && savingTag && plan.monthlyPrice > 0 && (
                  <div className="pricing-saving-tag">{savingTag}</div>
                )}
                {interval === 'yearly' && plan.monthlyPrice > 0 && (
                  <p className="pricing-yearly-note">
                    {t('billedAnnuallyNote').replace('${amount}', `${price * 12}`)}
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
                    {t('processing')}
                  </span>
                ) : getButtonLabel(plan.id)}
              </button>

              {/* Features list */}
              <ul className="pricing-features-list">
                {features.map((feat, idx) => (
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
        <p>{t('pricingFooterNote1')}</p>
        <p style={{ marginTop: 8 }}>{t('pricingFooterNote2')}</p>
      </div>
    </div>
  );
};
