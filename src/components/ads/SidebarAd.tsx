import React, { useEffect, useRef } from 'react';
import { useAds } from '@/context/AdContext';

interface SidebarAdProps {
  slot: string;
  className?: string;
  sticky?: boolean;
}

const SidebarAd: React.FC<SidebarAdProps> = ({ slot, className = '', sticky = false }) => {
  const { shouldShowAds, adSettings } = useAds();
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldShowAds && adSettings?.sidebar_ad_enabled && adRef.current) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }
  }, [shouldShowAds, adSettings]);

  if (!shouldShowAds || !adSettings?.sidebar_ad_enabled) {
    return null;
  }

  return (
    <div 
      ref={adRef} 
      className={`ad-container hidden lg:block ${sticky ? 'sticky top-20' : ''} ${className}`}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adSettings.adsense_client_id || ''}
        data-ad-slot={slot}
        data-ad-format="vertical"
      />
    </div>
  );
};

export default SidebarAd;
