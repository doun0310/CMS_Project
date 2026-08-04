import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  fetchUserSubscription,
  subscribeToSubscription,
  type UserSubscription,
  type PlanId,
} from '../services/stripeService';

interface SubscriptionContextValue {
  subscription: UserSubscription;
  isLoading: boolean;
  planId: PlanId;
  isPro: boolean;
  isEnterprise: boolean;
  isFree: boolean;
  /** Refresh subscription from DB */
  refresh: () => Promise<void>;
}

const FREE_SUB: UserSubscription = { planId: 'free', status: 'free', planKey: 'free' };

const SubscriptionContext = createContext<SubscriptionContextValue>({
  subscription: FREE_SUB,
  isLoading: false,
  planId: 'free',
  isPro: false,
  isEnterprise: false,
  isFree: true,
  refresh: async () => {},
});

export const SubscriptionProvider: React.FC<{
  children: ReactNode;
  userId?: string | null;
}> = ({ children, userId }) => {
  const [subscription, setSubscription] = useState<UserSubscription>(FREE_SUB);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = async () => {
    if (!userId) { setSubscription(FREE_SUB); return; }
    setIsLoading(true);
    try {
      const sub = await fetchUserSubscription(userId);
      setSubscription(sub);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) { setSubscription(FREE_SUB); return; }

    // Initial fetch
    refresh();

    // Realtime subscription
    const unsubscribe = subscribeToSubscription(userId, setSubscription);
    return unsubscribe;
  }, [userId]);

  // Also re-fetch on billing success query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('billing') === 'success') {
      setTimeout(() => refresh(), 2000); // Wait for webhook to process
      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete('billing');
      url.searchParams.delete('session_id');
      url.searchParams.delete('plan');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const planId = subscription.planId;

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isLoading,
        planId,
        isPro: planId === 'pro' && subscription.status === 'active',
        isEnterprise: planId === 'enterprise' && subscription.status === 'active',
        isFree: planId === 'free' || !['active', 'trialing'].includes(subscription.status),
        refresh,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);
