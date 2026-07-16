import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);
  const backendAvailableRef = useRef(true);

  const fetchAdSettings = useCallback(async () => {
    if (!backendAvailableRef.current) {
      setAdSettings(DEFAULT_AD_SETTINGS);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Use any to bypass TypeScript checking for tables not in generated types
      const { data, error } = await supabase
        .from('ad_settings' as any)
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        setAdSettings(DEFAULT_AD_SETTINGS);
      } else {
        setAdSettings((data as unknown as AdSettings) || DEFAULT_AD_SETTINGS);
      }
    } catch (error) {
      backendAvailableRef.current = false;
      setAdSettings(DEFAULT_AD_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
          backendAvailableRef.current = true;
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
