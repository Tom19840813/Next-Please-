import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdSettings } from '@/types/ads';

export const useAdSettings = () => {
  const [adSettings, setAdSettings] = useState<AdSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('ad_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setAdSettings(data);
    } catch (error) {
      console.error('Error fetching ad settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdSettings();

    // Subscribe to changes
    const channel = supabase
      .channel('ad-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ad_settings'
        },
        () => {
          fetchAdSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { adSettings, isLoading, refreshSettings: fetchAdSettings };
};
