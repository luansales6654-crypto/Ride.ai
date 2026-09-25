import React from 'react';
import { AlertTriangle, RefreshCw, Settings, ArrowLeft } from 'lucide-react';

interface ErrorStateProps {
  title: string;
  reason?: string;
  onRetry?: () => void;
  onConfigure?: () => void;
  onBack?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  reason,
  onRetry,
  onConfigure,
  onBack,
  className = '',
}) => {
  return (
    <div
      className={`p-6 rounded-2xl bg-[#111113] border border-[#FF6B57]/30 text-left my-4 shadow-lg ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#FF6B57]/10 border border-[#FF6B57]/30 flex items-center justify-center text-[#FF6B57] shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-sora text-base font-bold text-white mb-1">{title}</h4>
          {reason && <p className="text-sm text-[#8B8B95] mb-4 leading-relaxed">{reason}</p>}

          <div className="flex flex-wrap items-center gap-3 mt-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="btn-secondary h-9 px-4 text-xs flex items-center gap-2 border-[#3D8BFF]/40 text-[#8DBBFF]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Tentar novamente
              </button>
            )}
            {onConfigure && (
              <button
                onClick={onConfigure}
                className="btn-primary h-9 px-4 text-xs flex items-center gap-2"
              >
                <Settings className="w-3.5 h-3.5" />
                Configurar integração
              </button>
            )}
            {onBack && (
              <button
                onClick={onBack}
                className="btn-ghost h-9 px-3 text-xs text-[#8B8B95] flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Voltar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
