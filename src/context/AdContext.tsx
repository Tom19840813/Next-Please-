import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAdSettings } from '@/hooks/useAdSettings';
import { useSubscription } from '@/hooks/useSubscription';
import { AdContextType } from '@/types/ads';

const AdContext = createContext<AdContextType | undefined>(undefined);

export const AdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { adSettings, isLoading: adSettingsLoading } = useAdSettings();
  const { isPro, isLoading: subscriptionLoading } = useSubscription();
  const [gamesPlayed, setGamesPlayed] = useState(0);

  const isLoading = adSettingsLoading || subscriptionLoading;

  // Determine if ads should be shown
  const shouldShowAds = 
    !isPro && 
    adSettings?.ads_enabled === true && 
    !!adSettings?.adsense_client_id;

  // Check if interstitial ad should be shown
  const shouldShowInterstitial = 
    shouldShowAds &&
    adSettings?.interstitial_ad_enabled === true &&
    gamesPlayed > 0 &&
    gamesPlayed % (adSettings?.ad_frequency_games || 3) === 0;

  const incrementGamesPlayed = () => {
    setGamesPlayed(prev => prev + 1);
  };

  // Load AdSense script if needed
  useEffect(() => {
    if (shouldShowAds && adSettings?.adsense_client_id) {
      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSettings.adsense_client_id}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [shouldShowAds, adSettings?.adsense_client_id]);

  return (
    <AdContext.Provider
      value={{
        adSettings,
        shouldShowAds,
        gamesPlayed,
        incrementGamesPlayed,
        shouldShowInterstitial,
        isLoading,
      }}
    >
      {children}
    </AdContext.Provider>
  );
};

export const useAds = () => {
  const context = useContext(AdContext);
  if (context === undefined) {
    throw new Error('useAds must be used within an AdProvider');
  }
  return context;
};
