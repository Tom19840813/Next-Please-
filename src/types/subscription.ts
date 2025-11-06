export type SubscriptionType = 'free' | 'pro';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';

export interface UserSubscription {
  id: string;
  user_id: string;
  subscription_type: SubscriptionType;
  subscription_status: SubscriptionStatus;
  started_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionContextType {
  subscription: UserSubscription | null;
  isPro: boolean;
  isLoading: boolean;
  refreshSubscription: () => Promise<void>;
}
