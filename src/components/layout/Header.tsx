import React from 'react';
import { WklyLogo } from './WklyLogo';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Header({
  isDarkMode,
  onToggleDarkMode,
}: HeaderProps) {
  return (
    <header className="bg-white dark:bg-[#161922] border-b-2 border-black dark:border-[#383F50] sticky top-0 z-50 px-4 py-2.5 flex items-center justify-between gap-3 shadow-sm font-display transition-colors duration-200">
      <div className="flex items-center gap-3">
        <WklyLogo id="header-wkly-logo" showSubtitle />
      </div>

      <div className="flex items-center gap-2">
        {/* Night Mode Toggle Button with Google Material Symbols */}
        <button
          type="button"
          onClick={onToggleDarkMode}
          aria-label="Toggle Night Mode"
          className={`px-3 py-1.5 text-xs font-black border-2 rounded flex items-center gap-1.5 neo-btn font-display cursor-pointer ${
            isDarkMode
              ? 'bg-[#2E1850] hover:bg-[#3b1f66] text-[#F3F4F6] border-[#A855F7] shadow-[3px_3px_0px_#000]'
              : 'bg-[#161922] hover:bg-[#1E232E] text-[#F3F4F6] border-black shadow-[2px_2px_0px_#000]'
          }`}
        >
          <span className="material-symbols-outlined text-[17px] leading-none">
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
          <span>{isDarkMode ? 'Light Mode' : 'Night Mode'}</span>
        </button>
      </div>
    </header>
  );
}
