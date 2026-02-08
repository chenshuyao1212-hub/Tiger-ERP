import React from 'react';

export const TigerLogo: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <svg viewBox="0 0 64 64" className="w-9 h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
       <defs>
         <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
           <feGaussianBlur stdDeviation="2" result="blur" />
           <feComposite in="SourceGraphic" in2="blur" operator="over" />
         </filter>
       </defs>
       {/* Main Head Shape - Orange */}
       <path d="M10 14 L17 5 L32 10 L47 5 L54 14 L58 32 L50 54 L32 60 L14 54 L6 32 L10 14 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
       
       {/* Ears Details */}
       <path d="M17 5 L21 16 L12 16 Z" fill="#92400E" />
       <path d="M47 5 L43 16 L52 16 Z" fill="#92400E" />

       {/* Forehead Patterns (Black) */}
       <path d="M32 10 L27 22 L32 26 L37 22 Z" fill="#1E293B" />
       <path d="M20 18 L24 28 L16 28 Z" fill="#1E293B" />
       <path d="M44 18 L40 28 L48 28 Z" fill="#1E293B" />

       {/* Eye Surround / Eyes */}
       <path d="M16 32 L28 34 L16 40 Z" fill="#1E293B" />
       <path d="M48 32 L36 34 L48 40 Z" fill="#1E293B" />
       
       {/* Eyes (Pop of color) */}
       <circle cx="22" cy="36" r="1.5" fill="#FEF3C7" />
       <circle cx="42" cy="36" r="1.5" fill="#FEF3C7" />

       {/* Cheek Stripes */}
       <path d="M10 44 L18 46 L12 50 Z" fill="#1E293B" />
       <path d="M54 44 L46 46 L52 50 Z" fill="#1E293B" />

       {/* Muzzle (White) */}
       <path d="M26 48 L32 44 L38 48 L32 58 Z" fill="#F8FAFC" />

       {/* Nose */}
       <path d="M29 49 L35 49 L32 54 Z" fill="#0F172A" />
    </svg>
    <span className="font-bold text-xl tracking-tight text-white font-sans">Tiger ERP</span>
  </div>
);