

import React from 'react';

export const LeafIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M11 20A7 7 0 0 1 4 13H2a10 10 0 0 0 10 10z" />
    <path d="M12 4a10 10 0 0 0-10 10h2A7 7 0 0 1 11 7z" />
    <line x1="12" y1="10" x2="12" y2="22" />
    <line x1="12" y1="10" x2="18" y2="4" />
  </svg>
);