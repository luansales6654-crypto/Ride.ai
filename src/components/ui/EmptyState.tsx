import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`card-surface p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto my-6 border border-[#26262B] bg-[#111113]/80 backdrop-blur-sm rounded-2xl ${className}`}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-[#0D347A]/30 border border-[#3D8BFF]/30 flex items-center justify-center text-[#3D8BFF] mb-4 shadow-[0_0_20px_rgba(23,105,255,0.15)]">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h3 className="font-sora text-lg sm:text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-[#8B8B95] mb-6 max-w-md leading-relaxed">{description}</p>
      
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionText && onAction && (
          <button onClick={onAction} className="btn-primary text-sm">
            {actionText}
          </button>
        )}
        {secondaryActionText && onSecondaryAction && (
          <button onClick={onSecondaryAction} className="btn-secondary text-sm">
            {secondaryActionText}
          </button>
        )}
      </div>
    </div>
  );
};
