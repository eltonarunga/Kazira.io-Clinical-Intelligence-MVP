import React from 'react';

export const BrandIcon: React.FC<{ className?: string }> = ({ className = 'h-6 w-6' }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 32 32" 
    fill="none" 
    role="img"
    className={className}
    aria-label="Kazira Sovereign Clinical Emblem"
  >
    <rect width="32" height="32" rx="6" fill="#005235" />
    <path d="M16 7V25M7 16H25" stroke="#f7f4ef" strokeWidth="2.5" strokeLinecap="square"/>
    <path d="M9 20L13 15L17 19L23 11" stroke="#d96414" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"/>
  </svg>
);

export const BrandEmblem: React.FC<{ className?: string }> = ({ className = 'h-8 w-auto' }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 160 40" 
    fill="none" 
    role="img"
    className={className}
    aria-label="Kazira Clinical Intelligence Emblem"
  >
    <rect x="2" y="6" width="28" height="28" rx="4" fill="#005235" />
    {/* Clean medical cross & deterministic audit pulse */}
    <path d="M16 11V29M7 20H25" stroke="#f7f4ef" strokeWidth="2.5" strokeLinecap="square"/>
    <path d="M10 23L14 18L18 22L22 14" stroke="#d96414" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"/>
    {/* Typography for Kazira Clinical Intelligence */}
    <text x="38" y="23" fontFamily="'Newsreader', Georgia, serif" fontSize="18" fontWeight="bold" fill="#111110" letterSpacing="-0.3">Kazira</text>
    <text x="38" y="32" fontFamily="'Outfit', sans-serif" fontSize="8" fontWeight="700" fill="#005235" letterSpacing="1.2">CLINICAL INTELLIGENCE</text>
  </svg>
);

export const ExecutiveLogo: React.FC<{ className?: string }> = ({ className = 'h-9 w-auto' }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 380 90" 
    fill="none" 
    role="img"
    className={className}
    aria-label="Kazira Executive Logo"
  >
    {/* Flat Architectural Container */}
    <g>
      <rect x="8" y="8" width="74" height="74" rx="6" fill="#005235" />
      <rect x="8.5" y="8.5" width="73" height="73" rx="5.5" stroke="#c5cec7" strokeOpacity="0.25" strokeWidth="1" />
      
      {/* Crisp Medical Cross & Audit Telemetry */}
      <rect x="40" y="20" width="10" height="50" rx="1" fill="#f7f4ef" />
      <rect x="20" y="40" width="50" height="10" rx="1" fill="#f7f4ef" />
      
      {/* Ascending telemetry line */}
      <path 
        d="M19 45L31 45L38 29L47 57L54 38L61 45L66 45" 
        stroke="#fe924d" 
        strokeWidth="3" 
        strokeLinecap="square" 
        strokeLinejoin="miter" 
      />
            
      {/* Precision telemetry nodes */}
      <rect x="36.5" y="27.5" width="3" height="3" fill="#f7f4ef" stroke="#fe924d" strokeWidth="1" />
      <rect x="45.5" y="55.5" width="3" height="3" fill="#f7f4ef" stroke="#fe924d" strokeWidth="1" />
      <rect x="52.5" y="36.5" width="3" height="3" fill="#f7f4ef" stroke="#fe924d" strokeWidth="1" />
    </g>

    {/* Wordmark Kazira */}
    <text x="100" y="48" fontFamily="'Newsreader', Georgia, serif" fontSize="34" fontWeight="700" fill="#111110" letterSpacing="-0.5">Kazira</text>
    
    {/* Architectural Dot Accent in Pine */}
    <rect x="196" y="28" width="5" height="5" fill="#005235" />

    {/* Subtitle Tagline */}
    <text x="101" y="66" fontFamily="'Outfit', sans-serif" fontSize="10" fontWeight="700" fill="#005235" letterSpacing="2.8">CLINICAL INTELLIGENCE</text>
    
    {/* Sovereignty Code */}
    <rect x="272" y="55" width="34" height="14" rx="2" fill="#eeeae4" stroke="#c5cec7" strokeWidth="1" />
    <text x="277" y="65.5" fontFamily="'DM Mono', monospace" fontSize="8" fontWeight="700" fill="#005235" letterSpacing="0.8">KEN</text>
  </svg>
);

export default BrandEmblem;
