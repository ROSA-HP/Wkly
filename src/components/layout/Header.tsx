import React from 'react';
import { ViewState } from '../../types';

interface HeaderProps {
  currentView: ViewState;
  onReset: () => void;
  onNavigate: (view: ViewState) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export function Header({
  currentView,
  onReset,
  onNavigate,
  isDarkMode,
  onToggleDarkMode,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}: HeaderProps) {
  const steps = [
    { id: 'login' as ViewState, label: 'Login', num: 1 },
    { id: 'dashboard' as ViewState, label: 'Dashboard', num: 2 },
  ];

  return (
    <header className="bg-white dark:bg-[#161922] border-b-2 border-black dark:border-[#383F50] sticky top-0 z-50 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-sm font-display transition-colors duration-200">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-black dark:bg-[#2E1850] text-white dark:text-[#F3F4F6] border-2 border-black dark:border-[#A855F7] px-2.5 py-1 rounded font-bold text-xs tracking-wider shadow-[2px_2px_0px_#000]">
          <svg className="w-3.5 h-3.5 text-yellow-300 dark:text-[#A855F7] fill-current" viewBox="0 0 24 24">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
          </svg>
          <span>WKLY</span>
        </div>
        <span className="text-xs font-semibold text-slate-500 dark:text-[#9CA3AF] hidden xl:inline">
          Weekly Planner & Scheduler
        </span>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-bold py-1 max-w-full scrollbar-custom">
        {steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            <button
              onClick={() => onNavigate(step.id)}
              className={`px-2.5 py-1 border-2 rounded transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                currentView === step.id
                  ? 'bg-[#8b5cf6] dark:bg-[#A855F7] text-white dark:text-[#0B0D11] border-black dark:border-white shadow-[2px_2px_0px_#000] font-black'
                  : 'bg-white dark:bg-[#1E232E] text-slate-900 dark:text-[#F3F4F6] border-black dark:border-[#383F50]'
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-black ${
                  currentView === step.id
                    ? 'bg-white dark:bg-[#0B0D11] text-black dark:text-[#A855F7]'
                    : 'bg-slate-200 dark:bg-[#10141C] text-black dark:text-[#9CA3AF]'
                }`}
              >
                {step.num}
              </span>
              <span>{step.label}</span>
            </button>
            {idx < steps.length - 1 && (
              <span className="text-slate-400 dark:text-[#64748B] font-bold mx-1">→</span>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Undo / Redo Controls (Ctrl+Z / Ctrl+Y) */}
        {currentView === 'dashboard' && (
          <div className="flex items-center gap-1 mr-1">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo last action (Ctrl + Z)"
              className={`px-2.5 py-1 text-xs font-bold border-2 rounded flex items-center gap-1 font-display transition-all ${
                canUndo
                  ? 'bg-white dark:bg-[#1E232E] text-slate-900 dark:text-[#F3F4F6] border-black dark:border-[#383F50] hover:bg-slate-100 dark:hover:bg-[#2E1850] shadow-[2px_2px_0px_#000] neo-btn cursor-pointer'
                  : 'bg-slate-100 dark:bg-[#10141C] text-slate-400 dark:text-[#64748B] border-slate-300 dark:border-[#1E232E] opacity-60 cursor-not-allowed'
              }`}
            >
              <span>↶</span>
              <span className="hidden sm:inline">Undo</span>
              <kbd className="text-[9px] font-mono px-1 py-0.2 bg-slate-200 dark:bg-[#10141C] text-slate-700 dark:text-[#9CA3AF] rounded border border-slate-400 dark:border-[#383F50]">
                Ctrl+Z
              </kbd>
            </button>

            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo action (Ctrl + Y / Ctrl + Shift + Z)"
              className={`px-2.5 py-1 text-xs font-bold border-2 rounded flex items-center gap-1 font-display transition-all ${
                canRedo
                  ? 'bg-white dark:bg-[#1E232E] text-slate-900 dark:text-[#F3F4F6] border-black dark:border-[#383F50] hover:bg-slate-100 dark:hover:bg-[#2E1850] shadow-[2px_2px_0px_#000] neo-btn cursor-pointer'
                  : 'bg-slate-100 dark:bg-[#10141C] text-slate-400 dark:text-[#64748B] border-slate-300 dark:border-[#1E232E] opacity-60 cursor-not-allowed'
              }`}
            >
              <span>↷</span>
              <span className="hidden sm:inline">Redo</span>
              <kbd className="text-[9px] font-mono px-1 py-0.2 bg-slate-200 dark:bg-[#10141C] text-slate-700 dark:text-[#9CA3AF] rounded border border-slate-400 dark:border-[#383F50]">
                Ctrl+Y
              </kbd>
            </button>
          </div>
        )}

        {/* Night Mode Toggle Button */}
        <button
          type="button"
          onClick={onToggleDarkMode}
          aria-label="Toggle Night Mode"
          className={`px-3 py-1 text-xs font-black border-2 rounded flex items-center gap-1.5 neo-btn font-display cursor-pointer ${
            isDarkMode
              ? 'bg-[#2E1850] hover:bg-[#3b1f66] text-[#F3F4F6] border-[#A855F7] shadow-[3px_3px_0px_#000]'
              : 'bg-[#161922] hover:bg-[#1E232E] text-[#F3F4F6] border-black shadow-[2px_2px_0px_#000]'
          }`}
        >
          <span>{isDarkMode ? '☀️' : '🌙'}</span>
          <span>{isDarkMode ? 'Light Mode' : 'Night Mode'}</span>
        </button>

        <button
          onClick={onReset}
          className="px-2.5 py-1 text-xs font-bold border-2 border-black dark:border-[#FBBF24] rounded bg-yellow-300 dark:bg-[#292312] text-slate-900 dark:text-[#FBBF24] hover:bg-yellow-400 dark:hover:bg-[#382f18] shadow-[2px_2px_0px_#000] neo-btn font-display cursor-pointer"
        >
          ↺ Reset Demo
        </button>
      </div>
    </header>
  );
}
