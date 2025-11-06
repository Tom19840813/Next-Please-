import React from 'react';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const ProBadge: React.FC<ProBadgeProps> = ({ 
  className, 
  size = 'md',
  showText = true 
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold rounded-full shadow-lg animate-shimmer',
        sizeClasses[size],
        className
      )}
    >
      <Crown className={iconSizes[size]} />
      {showText && <span>PRO</span>}
    </div>
  );
};

export default ProBadge;
