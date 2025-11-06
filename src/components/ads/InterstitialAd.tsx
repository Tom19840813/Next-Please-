import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAds } from '@/context/AdContext';
import { Button } from '@/components/ui/button';

interface InterstitialAdProps {
  slot: string;
  onClose: () => void;
}

const InterstitialAd: React.FC<InterstitialAdProps> = ({ slot, onClose }) => {
  const { adSettings } = useAds();
  const [countdown, setCountdown] = useState(5);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanClose(true);
    }
  }, [countdown]);

  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
      <div className="relative bg-white rounded-lg shadow-2xl p-6 max-w-2xl w-full mx-4">
        <div className="absolute top-2 right-2">
          <Button
            onClick={onClose}
            disabled={!canClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            {canClose ? (
              <X className="h-4 w-4" />
            ) : (
              <span className="text-xs font-bold">{countdown}</span>
            )}
          </Button>
        </div>

        <div className="mt-8">
          <ins
            className="adsbygoogle"
            style={{ display: 'block', minHeight: '250px' }}
            data-ad-client={adSettings?.adsense_client_id || ''}
            data-ad-slot={slot}
            data-ad-format="rectangle"
          />
        </div>

        {!canClose && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            You can close this in {countdown} seconds...
          </p>
        )}
      </div>
    </div>
  );
};

export default InterstitialAd;
