import React from 'react';

interface KaziraLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textColor?: string;
  variant?: 'emblem' | 'full';
}

/**
 * Kazira Clinical Intelligence Official Logo & Emblem
 * Faithfully re-creates the shield, caduceus serpent coils,
 * upward recovery trend arrow, and authoritative typography.
 */
export const KaziraEmblem: React.FC<{ size?: number; className?: string }> = ({ 
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
      {/* Starting from lower shield point, forming apex, then angling 45° upward with arrow head */}
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
      {/* Terminal Ring */}
      <circle 
        cx="80" 
        cy="24" 
        r="7" 
        stroke="#0d5d3a" 
        strokeWidth="7" 
        fill="none" 
      />
      {/* Vertical Staff */}
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

export const KaziraLogo: React.FC<KaziraLogoProps> = ({
  size = 48,
  className = '',
  showText = false,
  textColor = 'text-[#0d5d3a]',
  variant = 'emblem'
}) => {
  if (variant === 'full' || showText) {
    return (
      <div className={`inline-flex items-center gap-3.5 ${className}`}>
        <KaziraEmblem size={size} />
        <div className={`flex flex-col text-left font-serif leading-none select-none ${textColor}`}>
          <span className="text-[1.2em] font-bold tracking-tight">Kazira</span>
          <span className="text-[1.1em] font-semibold tracking-tight my-0.5">Clinical</span>
          <span className="text-[1.1em] font-semibold tracking-tight">Intelligence</span>
        </div>
      </div>
    );
  }

  return <KaziraEmblem size={size} className={className} />;
};

export default KaziraLogo;
