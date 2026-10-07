import React from 'react';

interface WklyLogoProps {
  id?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showSubtitle?: boolean;
}

export function WklyIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0`}
      aria-hidden="true"
    >
      {/* High-Fashion Architectural Dual-Chevron "W" (Athletics + Academics) */}
      <path
        d="M4.5 7L9 22L13 12.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 12.5L19 22L23.5 7"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Kinetic Apex Spark */}
      <circle
        cx="14"
        cy="4.5"
        r="2"
        className="fill-yellow-400 dark:fill-[#C084FC]"
      />
    </svg>
  );
}

export function WklyLogo({
  id = 'header-wkly-logo',
  size = 'md',
  className = '',
  showSubtitle = false,
}: WklyLogoProps) {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        id={id}
        className={`flex items-center gap-2 bg-[#0E1017] dark:bg-[#1A142A] text-white dark:text-[#F3F4F6] border-2 border-black dark:border-[#C084FC]/80 rounded-lg shadow-[2.5px_2.5px_0px_#000] dark:shadow-[2.5px_2.5px_0px_#000000] transition-all duration-300 select-none group cursor-pointer ${
          isSm
            ? 'px-2 py-0.5 text-[11px]'
            : isLg
            ? 'px-4 py-2 text-base'
            : 'px-2.5 py-1 text-xs'
        }`}
      >
        {/* Architectural Icon */}
        <div className="text-white dark:text-[#F3F4F6] group-hover:scale-110 transition-transform">
          <WklyIcon className={isSm ? 'w-3.5 h-3.5' : isLg ? 'w-6 h-6' : 'w-4 h-4'} />
        </div>

        {/* Fashion Grotesque Wordmark with Kinetic Indicator */}
        <div className="flex items-center gap-1.5 font-display font-black tracking-[0.18em] uppercase">
          <span className="text-white dark:text-[#F3F4F6]">WKLY</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7] dark:bg-[#C084FC] animate-pulse" />
        </div>
      </div>

      {showSubtitle && (
        <span className="text-xs font-semibold text-slate-500 dark:text-[#9CA3AF] hidden xl:inline font-display">
          Weekly Planner & Scheduler
        </span>
      )}
    </div>
  );
}

export default WklyLogo;
