import React, { useState, useEffect } from 'react';

interface TeamLogoProps {
  shortName?: string;
  teamName?: string;
  logoUrl?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const MAPPED_LOGOS: Record<string, string> = {
  // Clubs
  MCI: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
  RMA: 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
  ARS: 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg',
  BAR: 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg',
  LIV: 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg',
  CHE: 'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg',
  MUN: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg',
  INT: 'https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021_logo.svg',
  ACM: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg',
  FCB: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg',
  ATM: 'https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg',
  RSO: 'https://upload.wikimedia.org/wikipedia/en/f/f1/Real_Sociedad_logo.svg',
  PSG: 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg',
  GIR: 'https://upload.wikimedia.org/wikipedia/en/9/90/Girona_FC_logo.svg',
  ATH: 'https://upload.wikimedia.org/wikipedia/en/9/98/Club_Athletic_Bilbao_logo.svg',
  AST: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Aston_Villa_FC_crest_2024.svg',
  TOT: 'https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg',
  
  // Countries
  ARG: 'https://flagcdn.com/w160/ar.png',
  BRA: 'https://flagcdn.com/w160/br.png',
  FRA: 'https://flagcdn.com/w160/fr.png',
  GER: 'https://flagcdn.com/w160/de.png',
  ENG: 'https://flagcdn.com/w160/gb-eng.png',
  POR: 'https://flagcdn.com/w160/pt.png',
  ITA: 'https://flagcdn.com/w160/it.png',
  ESP: 'https://flagcdn.com/w160/es.png',
  USA: 'https://flagcdn.com/w160/us.png',
  JPN: 'https://flagcdn.com/w160/jp.png',
  MAR: 'https://flagcdn.com/w160/ma.png',
  SEN: 'https://flagcdn.com/w160/sn.png',
  URU: 'https://flagcdn.com/w160/uy.png',
  CRO: 'https://flagcdn.com/w160/hr.png',
};

export default function TeamLogo({ 
  shortName = '', 
  teamName = '', 
  logoUrl, 
  className = '', 
  size = 'md' 
}: TeamLogoProps) {
  const [hasError, setHasError] = useState(false);
  const code = (shortName || '').toUpperCase().trim();

  // Reset error state if the url or shortName changes
  useEffect(() => {
    setHasError(false);
  }, [logoUrl, shortName]);

  // Determine actual image source
  const imageSrc = logoUrl || MAPPED_LOGOS[code];

  // Map of team colors and custom stylish symbols for fallback
  const teamStyles: Record<string, { bg: string, text: string, emblem: string, border: string }> = {
    MCI: { bg: 'from-sky-400 to-sky-600', text: 'text-white', emblem: '🦅', border: 'border-sky-300/45' },
    RMA: { bg: 'from-slate-150 to-slate-200', text: 'text-indigo-950', emblem: '👑', border: 'border-amber-400/60' },
    ARS: { bg: 'from-red-500 to-red-650', text: 'text-white', emblem: '🔫', border: 'border-red-300/40' },
    BAR: { bg: 'from-blue-800 to-red-600', text: 'text-amber-300', emblem: '🛡️', border: 'border-amber-500/50' },
    LIV: { bg: 'from-red-700 to-red-900', text: 'text-amber-400', emblem: '🦅', border: 'border-red-500/50' },
    CHE: { bg: 'from-blue-600 to-blue-800', text: 'text-white', emblem: '🦁', border: 'border-blue-400/40' },
    MUN: { bg: 'from-red-600 to-red-800', text: 'text-yellow-400', emblem: '😈', border: 'border-yellow-500/40' },
    INT: { bg: 'from-blue-800 to-slate-900', text: 'text-white', emblem: '🐍', border: 'border-slate-700/50' },
    ACM: { bg: 'from-red-600 to-slate-900', text: 'text-white', emblem: '👹', border: 'border-red-500/50' },
    FCB: { bg: 'from-red-600 to-blue-850', text: 'text-white', emblem: '⭐', border: 'border-red-400/50' },
    ATM: { bg: 'from-red-500 to-blue-700', text: 'text-white', emblem: '🐻', border: 'border-slate-400/40' },
    RSO: { bg: 'from-blue-500 to-slate-100', text: 'text-blue-900', emblem: '👑', border: 'border-blue-300/40' },
    AST: { bg: 'from-purple-850 to-sky-500', text: 'text-amber-400', emblem: '🦁', border: 'border-purple-500/40' },
    TOT: { bg: 'from-slate-100 to-slate-300', text: 'text-indigo-950', emblem: ' Rooster', border: 'border-indigo-900/30' },
    GIR: { bg: 'from-red-500 to-slate-100', text: 'text-red-700', emblem: '❤️', border: 'border-red-400/40' },
    ATH: { bg: 'from-red-600 to-slate-100', text: 'text-black', emblem: '🦁', border: 'border-red-500/40' },
    
    // FIFA International Teams
    ARG: { bg: 'from-sky-300 via-slate-100 to-sky-300', text: 'text-indigo-950', emblem: '☀️', border: 'border-amber-400/60' },
    BRA: { bg: 'from-yellow-400 to-green-600', text: 'text-blue-900', emblem: '⭐', border: 'border-yellow-350/60' },
    FRA: { bg: 'from-blue-800 to-blue-950', text: 'text-white', emblem: '🐓', border: 'border-blue-600/40' },
    GER: { bg: 'from-slate-100 to-slate-300', text: 'text-black', emblem: '🦅', border: 'border-slate-800/40' },
    ENG: { bg: 'from-slate-50 to-slate-200', text: 'text-blue-950', emblem: '🦁', border: 'border-blue-900/30' },
    POR: { bg: 'from-red-650 to-green-700', text: 'text-yellow-450', emblem: '🛡️', border: 'border-yellow-500/50' },
    ITA: { bg: 'from-blue-600 to-blue-800', text: 'text-white', emblem: '⭐', border: 'border-blue-400/50' },
    ESP: { bg: 'from-red-600 to-yellow-500', text: 'text-red-900', emblem: '🐂', border: 'border-yellow-600/50' },
    USA: { bg: 'from-blue-900 to-red-600', text: 'text-white', emblem: '🦅', border: 'border-slate-200/50' },
    JPN: { bg: 'from-blue-800 to-blue-950', text: 'text-white', emblem: '🌸', border: 'border-red-500/40' },
    MAR: { bg: 'from-red-600 to-green-800', text: 'text-yellow-400', emblem: '🦁', border: 'border-green-500/40' },
    SEN: { bg: 'from-green-600 to-red-600', text: 'text-yellow-450', emblem: '🦁', border: 'border-yellow-500/40' },
    URU: { bg: 'from-sky-400 to-sky-600', text: 'text-white', emblem: '☀️', border: 'border-sky-300/40' },
    CRO: { bg: 'from-red-600 to-slate-100', text: 'text-blue-900', emblem: '🏁', border: 'border-red-500/50' },
  };

  const style = teamStyles[code] || {
    bg: 'from-slate-800 to-slate-900',
    text: 'text-slate-300',
    emblem: '⚽',
    border: 'border-slate-700/50'
  };

  const sizeClasses = {
    xs: 'w-5 h-5 rounded-md',
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-9 h-9 rounded-xl',
    lg: 'w-11 h-11 rounded-2xl',
    xl: 'w-16 h-16 rounded-3xl',
  };

  const imageSizes = {
    xs: 14,
    sm: 20,
    md: 26,
    lg: 32,
    xl: 48,
  };

  const emblemSizes = {
    xs: 'text-[11px]',
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  const acronym = code.substring(0, 3);

  // If there is a valid URL and we haven't hit an error, try to load the image
  if (imageSrc && !hasError) {
    return (
      <div 
        title={teamName || code}
        className={`relative bg-slate-900 border border-slate-800 flex items-center justify-center select-none shadow-md overflow-hidden shrink-0 ${className} ${sizeClasses[size]}`}
      >
        <img
          src={imageSrc}
          alt={teamName || code}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className="object-contain w-4/5 h-4/5 transition-transform duration-300 hover:scale-110"
        />
      </div>
    );
  }

  // Fallback styling if no URL is available or loading failed
  return (
    <div 
      title={teamName || code}
      className={`relative bg-gradient-to-br ${style.bg} ${style.border} border shadow-lg flex items-center justify-center select-none transition-all duration-300 hover:scale-110 shrink-0 ${className} ${sizeClasses[size]}`}
    >
      {/* Glossy shine effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 rounded-[inherit] pointer-events-none" />
      
      {/* Centralized primary fallback emblem */}
      <span className={`${emblemSizes[size]} drop-shadow-md transform hover:rotate-6 transition-transform duration-300`}>
        {style.emblem}
      </span>

      {/* Tiny subtle watermark text on large badges */}
      {(size === 'lg' || size === 'xl') && acronym && (
        <span className="absolute bottom-1 text-[8px] font-mono font-black text-white/40 uppercase tracking-widest">
          {acronym}
        </span>
      )}
    </div>
  );
}
