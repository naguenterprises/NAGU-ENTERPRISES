import React from 'react';
import logoImage from '../../assets/images/nagu_enterprises_logo_1791472953152.jpg';

interface NaguLogoProps {
  variant?: 'light' | 'dark';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  subtitleText?: string;
  symbolOnly?: boolean;
  className?: string;
}

export const NaguLogo: React.FC<NaguLogoProps> = ({
  variant = 'light',
  size = 'md',
  showSubtitle = true,
  subtitleText = 'Business Registration & Compliance Services',
  symbolOnly = false,
  className = '',
}) => {
  // Dimension mappings
  const emblemSizes = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-11 h-11 sm:w-12 sm:h-12',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
    xl: 'w-20 h-20 sm:w-24 sm:h-24',
  };

  const titleSizes = {
    xs: 'text-sm font-bold',
    sm: 'text-base font-bold tracking-tight',
    md: 'text-lg sm:text-xl font-extrabold tracking-tight',
    lg: 'text-xl sm:text-2xl font-black tracking-tight',
    xl: 'text-2xl sm:text-3xl font-black tracking-tight',
  };

  const subtitleSizes = {
    xs: 'text-[9px]',
    sm: 'text-[10px]',
    md: 'text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  const isDark = variant === 'dark';

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Brand Emblem */}
      <div
        className={`relative shrink-0 ${emblemSizes[size]} rounded-xl overflow-hidden shadow-sm ring-1 ${
          isDark
            ? 'ring-white/20 bg-white/10'
            : 'ring-blue-900/10 bg-white'
        }`}
      >
        <img
          src={logoImage}
          alt="Nagu Enterprises Official Crest"
          className="w-full h-full object-cover object-center transform scale-110 hover:scale-115 transition-transform duration-300"
          loading="eager"
        />
      </div>

      {/* Typography Lockup */}
      {!symbolOnly && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-display block ${titleSizes[size]} ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              NAGU ENTERPRISES
            </span>
          </div>
          {showSubtitle && (
            <span
              className={`font-medium tracking-wider uppercase block mt-1 ${subtitleSizes[size]} ${
                isDark ? 'text-blue-300/90' : 'text-slate-500'
              }`}
            >
              {subtitleText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default NaguLogo;
