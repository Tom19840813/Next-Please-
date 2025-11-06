import React from 'react';
import { useAds } from '@/context/AdContext';
import { useSubscription } from '@/hooks/useSubscription';
import ProBadge from '@/components/ProBadge';

interface AdContainerProps {
  children: React.ReactNode;
  showProBadgeInstead?: boolean;
  className?: string;
}

const AdContainer: React.FC<AdContainerProps> = ({ 
  children, 
  showProBadgeInstead = false,
  className = ''
}) => {
  const { shouldShowAds } = useAds();
  const { isPro } = useSubscription();

  // If user is pro, optionally show pro badge instead
  if (isPro && showProBadgeInstead) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="text-center">
          <ProBadge size="lg" />
          <p className="text-sm text-muted-foreground mt-2">
            Enjoying ad-free experience
          </p>
        </div>
      </div>
    );
  }

  // If shouldn't show ads, don't render anything
  if (!shouldShowAds) {
    return null;
  }

  return <div className={className}>{children}</div>;
};

export default AdContainer;
