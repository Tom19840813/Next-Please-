import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { UserSubscription } from '@/types/subscription';

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      // Use any to bypass TypeScript checking for tables not in generated types
      const { data, error } = await supabase
        .from('user_subscriptions' as any)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        setSubscription(null);
      } else {
        setSubscription(data as unknown as UserSubscription | null);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const isPro = subscription?.subscription_type === 'pro' && 
                subscription?.subscription_status === 'active';

  return {
    subscription,
    isPro,
    isLoading,
    refreshSubscription: fetchSubscription,
  };
};
