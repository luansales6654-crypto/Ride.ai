import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  text?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  text = 'Sincronizando...',
  className = '',
  size = 'md',
}) => {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center text-[#8DBBFF] ${className}`}>
      <Loader2 className={`${iconSizes[size]} animate-spin text-[#3D8BFF] mb-3`} />
      <p className="text-sm font-medium text-[#C9C9CF] font-sora animate-pulse">{text}</p>
    </div>
  );
};
