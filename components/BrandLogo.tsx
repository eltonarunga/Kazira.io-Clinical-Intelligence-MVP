import React from 'react';
import { KaziraEmblem, KaziraMonogram } from './KaziraLogo';

export const BrandIcon: React.FC<{ 
  className?: string; 
  size?: number;
  variant?: 'monogram' | 'emblem';
}> = ({ 
  className = 'h-6 w-6',
  size = 24,
  variant = 'emblem'
}) => (
  <div className={`flex items-center justify-center ${className}`}>
    {variant === 'monogram' ? (
      <KaziraMonogram size={size} />
    ) : (
      <KaziraEmblem size={size} />
    )}
  </div>
);

export const BrandEmblem: React.FC<{ 
  className?: string;
  variant?: 'monogram' | 'emblem';
}> = ({ 
  className = 'h-8 w-auto',
  variant = 'emblem'
}) => (
  <div className={`inline-flex items-center gap-2.5 ${className}`}>
    <div className="w-8 h-8 rounded-lg bg-surface border border-line flex items-center justify-center p-0.5 shrink-0 shadow-2xs">
      {variant === 'monogram' ? (
        <KaziraMonogram size={22} className="w-full h-full" />
      ) : (
        <KaziraEmblem size={24} className="w-full h-full" />
      )}
    </div>
    <div className="flex flex-col text-left leading-tight">
      <span className="font-head text-base font-bold text-ink tracking-tight">Kazira</span>
      <span className="text-[9px] font-sans text-ink2 uppercase tracking-wider font-semibold">Clinical Intelligence</span>
    </div>
  </div>
);

export const ExecutiveLogo: React.FC<{ 
  className?: string;
  variant?: 'monogram' | 'emblem';
}> = ({ 
  className = 'h-9 w-auto',
  variant = 'emblem'
}) => (
  <div className={`inline-flex items-center gap-3 ${className}`}>
    <div className="w-9 h-9 rounded-lg bg-surface border border-line flex items-center justify-center p-1 shrink-0 shadow-xs">
      {variant === 'monogram' ? (
        <KaziraMonogram size={24} className="w-full h-full" />
      ) : (
        <KaziraEmblem size={26} className="w-full h-full" />
      )}
    </div>
    <div className="flex flex-col">
      <span className="font-head text-lg font-bold text-ink tracking-tight">Kazira</span>
      <span className="text-[9px] font-sans text-ink2 uppercase tracking-wider font-semibold">
        Clinical Intelligence
      </span>
    </div>
  </div>
);

export default BrandEmblem;
