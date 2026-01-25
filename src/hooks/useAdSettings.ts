import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdSettings } from '@/types/ads';

// Default settings when database is not available
const DEFAULT_AD_SETTINGS: AdSettings = {
  id: 'default',
  ads_enabled: true,
  adsense_client_id: 'ca-pub-2911267693656956',
  banner_ad_enabled: true,
  sidebar_ad_enabled: true,
  interstitial_ad_enabled: true,
  ad_frequency_games: 3,
};

export const useAdSettings = () => {
  const [adSettings, setAdSettings] = useState<AdSettings | null>(DEFAULT_AD_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdSettings = async () => {
    try {
      // Use any to bypass TypeScript checking for tables not in generated types
      const { data, error } = await supabase
        .from('ad_settings' as any)
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching ad settings:', error);
        setAdSettings(DEFAULT_AD_SETTINGS);
      } else {
        setAdSettings((data as unknown as AdSettings) || DEFAULT_AD_SETTINGS);
      }
    } catch (error) {
      console.error('Error fetching ad settings:', error);
      setAdSettings(DEFAULT_AD_SETTINGS);
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
