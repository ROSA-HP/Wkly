import React from 'react';
import { ViewState } from '../../types';

interface HeaderProps {
  currentView: ViewState;
  onReset: () => void;
  onNavigate: (view: ViewState) => void;
}

export function Header({ currentView, onReset, onNavigate }: HeaderProps) {
  const steps = [
    { id: 'login' as ViewState, label: 'Login', num: 1 },
    { id: 'dashboard' as ViewState, label: 'Dashboard', num: 2 },
  ];

  return (
    <header className="bg-white border-b-2 border-black sticky top-0 z-50 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-sm font-display">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-black text-white px-2.5 py-1 rounded font-bold text-xs tracking-wider">
          <svg className="w-3.5 h-3.5 text-yellow-300 fill-current" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
          <span>ACROPULSE</span>
        </div>
        <span className="text-xs font-semibold text-slate-500 hidden xl:inline">Scholar-Athlete End-to-End Suite</span>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-bold py-1 max-w-full scrollbar-custom">
        {steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            <button
              onClick={() => onNavigate(step.id)}
              className={`px-2.5 py-1 border-2 border-black rounded transition-all flex items-center gap-1.5 whitespace-nowrap ${
                currentView === step.id ? 'bg-[#8b5cf6] text-white shadow-[2px_2px_0px_#000]' : 'bg-white text-slate-900'
              }`}
            >
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-black ${
                currentView === step.id ? 'bg-white text-black' : 'bg-slate-200 text-black'
              }`}>
                {step.num}
              </span>
              <span>{step.label}</span>
            </button>
            {idx < steps.length - 1 && <span className="text-slate-400 font-bold mx-1">→</span>}
          </React.Fragment>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          className="px-2.5 py-1 text-xs font-bold border-2 border-black rounded bg-yellow-300 hover:bg-yellow-400 neo-box-sm neo-btn font-display"
        >
          ↺ Reset Demo
        </button>
      </div>
    </header>
  );
}
