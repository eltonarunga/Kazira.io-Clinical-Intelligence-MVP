import React from 'react';

interface KaziraLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textColor?: string;
  variant?: 'emblem' | 'full' | 'monogram' | 'wordmark';
}

/**
 * Kazira Clinical Intelligence Official Logo & Emblem
 * Faithfully re-creates the shield, caduceus serpent coils,
 * upward recovery trend arrow, and authoritative healthcare emblem.
 */
export const KaziraEmblem: React.FC<{ 
  size?: number; 
  className?: string;
  color?: string;
  gapColor?: string;
}> = ({ 
  size = 48, 
  className = '' 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 160 160" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Kazira Clinical Intelligence Emblem"
    >
      {/* 1. Left Shield Frame (Forest Green) */}
      <path 
        d="M 68 36 L 42 36 C 30 36 24 42 24 54 L 24 88 C 24 102 36 118 64 126" 
        stroke="#0d5d3a" 
        strokeWidth="9" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* 2. Right Shield Top & Right Wall (Warm Gold) */}
      <path 
        d="M 92 36 L 118 36 C 130 36 136 42 136 54 L 136 86" 
        stroke="#c58c2b" 
        strokeWidth="9" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* 3. Bottom Recovery Arrow (Warm Gold) */}
      <path 
        d="M 44 126 L 68 140 L 126 90" 
        stroke="#c58c2b" 
        strokeWidth="9" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* Arrowhead */}
      <path 
        d="M 112 88 L 132 86 L 130 106" 
        stroke="#c58c2b" 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* 4. Central Staff with Ring Terminal (Forest Green) */}
      <circle 
        cx="80" 
        cy="24" 
        r="7" 
        stroke="#0d5d3a" 
        strokeWidth="7" 
        fill="none" 
      />
      <path 
        d="M 80 34 L 80 128" 
        stroke="#0d5d3a" 
        strokeWidth="8" 
        strokeLinecap="round" 
      />

      {/* 5. Entwined Caduceus Serpents */}
      {/* Upper Left Loop (Green) */}
      <path 
        d="M 80 50 C 64 42 42 46 42 58 C 42 70 66 74 80 78" 
        stroke="#0d5d3a" 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* Upper Right Loop (Warm Gold) */}
      <path 
        d="M 80 50 C 96 42 118 46 118 58 C 118 70 94 74 80 78" 
        stroke="#c58c2b" 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* Middle-Lower Left Loop (Green) */}
      <path 
        d="M 80 78 C 62 82 48 88 48 98 C 48 110 68 114 80 126" 
        stroke="#0d5d3a" 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* Middle-Lower Right Loop (Warm Gold) */}
      <path 
        d="M 80 78 C 98 82 112 88 112 98 C 112 110 92 114 80 126" 
        stroke="#c58c2b" 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
};

/**
 * Kazira Official Monogram
 * "The A has no crossbar. Kazira shows the gap."
 * Solid open 'A' geometry with the dashed red gap line marking unbilled revenue.
 */
export const KaziraMonogram: React.FC<{
  size?: number;
  className?: string;
  color?: string;
  gapColor?: string;
  animated?: boolean;
}> = ({
  size = 40,
  className = '',
  color = 'currentColor',
  gapColor = '#C4372A',
  animated = true
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 60 60" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Kazira Monogram: Open A showing the revenue gap"
    >
      {/* Solid Open 'A' Letterform */}
      <path 
        d="M24 6H36L56 54H43L30 20L17 54H4Z" 
        fill={color} 
      />
      {/* Dashed Gap Bar in Leak Red */}
      <path 
        className={animated ? 'dash' : undefined}
        d="M18 42H42" 
        stroke={gapColor} 
        strokeWidth="3.5" 
        strokeLinecap="round"
        fill="none" 
        strokeDasharray="6 5"
      />
    </svg>
  );
};

export const KaziraWordmark: React.FC<{
  width?: number | string;
  height?: number | string;
  className?: string;
  color?: string;
}> = ({
  width = 160,
  height = 'auto',
  className = '',
  color = 'currentColor'
}) => {
  return (
    <svg 
      width={width}
      height={height}
      viewBox="60 515 670 140" 
      role="img" 
      aria-label="Kazira wordmark" 
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M68 527H90V640H68Z"/>
      <path d="M146 527H170L124 580L173 640H146L105 590Q100 582 106 575Z"/>
      <path d="M226 527H251L299 640H275L237 549L201 640H180Z"/>
      <path d="M317 527H405V547L341 622H404V640H315V622L380 544L317 546Z"/>
      <path d="M437 527H459V640H437Z"/>
      <path d="M494 527H548Q584 527 584 561Q584 585 558 595L590 640H564L532 594H514V578H540Q560 575 560 561Q560 547 545 546H514V640H494Z"/>
      <path d="M645 527H670L718 640H694L656 549L620 640H599Z"/>
    </svg>
  );
};

export const KaziraLogo: React.FC<KaziraLogoProps> = ({
  size = 32,
  className = '',
  showText = false,
  textColor = 'text-on-surface',
  variant = 'emblem'
}) => {
  if (variant === 'wordmark') {
    return <KaziraWordmark width={size * 4} className={className} />;
  }

  if (variant === 'full' || showText) {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        <KaziraEmblem size={size} />
        <div className={`flex flex-col text-left leading-none select-none ${textColor}`}>
          <span className="font-head text-base sm:text-lg font-bold tracking-tight text-on-surface">Kazira</span>
          <span className="text-[9px] font-sans font-semibold tracking-wider text-on-surface-variant uppercase mt-0.5">Clinical Intelligence</span>
        </div>
      </div>
    );
  }

  if (variant === 'monogram') {
    return <KaziraMonogram size={size} className={className} />;
  }

  return <KaziraEmblem size={size} className={className} />;
};

export default KaziraLogo;
