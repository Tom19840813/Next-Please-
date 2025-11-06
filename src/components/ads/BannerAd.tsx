import React, { useEffect, useRef } from 'react';
import { useAds } from '@/context/AdContext';

interface BannerAdProps {
  slot: string;
  className?: string;
}

const BannerAd: React.FC<BannerAdProps> = ({ slot, className = '' }) => {
  const { shouldShowAds, adSettings } = useAds();
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldShowAds && adSettings?.banner_ad_enabled && adRef.current) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }
  }, [shouldShowAds, adSettings]);

  if (!shouldShowAds || !adSettings?.banner_ad_enabled) {
    return null;
  }

  return (
    <div ref={adRef} className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adSettings.adsense_client_id || ''}
        data-ad-slot={slot}
        data-ad-format="horizontal"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default BannerAd;
