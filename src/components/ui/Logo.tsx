import React from 'react';

interface LogoProps {
  variant?: 'full' | 'symbol';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ variant = 'full', className = '', size = 'md' }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Símbolo RIDE.IA */}
      <div
        className={`${iconSizes[size]} bg-[#0A0A0B] border border-[#3D8BFF]/40 rounded-xl flex items-center justify-center relative shadow-[0_0_15px_rgba(23,105,255,0.2)] group transition-all`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-white"
        >
          {/* Geometrical R with extended diagonal arrow line */}
          <path
            d="M8 6H17C20.3137 6 23 8.68629 23 12C23 15.3137 20.3137 18 17 18H8V6Z"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 6V26"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Diagonal ascending arrow */}
          <path
            d="M15 17L25 27M25 27H19M25 27V21"
            stroke="#3D8BFF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {variant === 'full' && (
        <div className={`font-sora font-bold tracking-tight ${textSizes[size]} flex items-baseline`}>
          <span className="text-white">RIDE</span>
          <span className="text-[#3D8BFF] font-extrabold shadow-[0_0_10px_rgba(61,139,255,0.5)]">.IA</span>
        </div>
      )}
    </div>
  );
};
