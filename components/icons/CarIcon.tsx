import React from 'react';

// This new icon is designed to look like a car from the front, with two passengers, sitting on train tracks,
// matching the new "ChuuChuuRide" branding.
export const CarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        {/* Car Body and Roof */}
        <path d="M20 15H4a2 2 0 0 1-2-2V9a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v4a2 2 0 0 1-2 2z" />
        
        {/* Windshield */}
        <line x1="7" y1="5" x2="7" y2="10" />
        <line x1="17" y1="5" x2="17" y2="10" />
        <line x1="7" y1="10" x2="17" y2="10" />

        {/* Passengers */}
        <circle cx="10" cy="7.5" r="1" />
        <circle cx="14" cy="7.5" r="1" />

        {/* Headlights */}
        <circle cx="6" cy="12.5" r="1.5" />
        <circle cx="18" cy="12.5" r="1.5" />
        
        {/* Center dot */}
        <circle cx="12" cy="12.5" r="1" />
        
        {/* Tracks */}
        <path d="M4 18 l-2 3" />
        <path d="M20 18 l2 3" />
        <path d="M2 21h20" />
    </svg>
);
