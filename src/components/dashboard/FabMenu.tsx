import { useState } from 'react';
import { ModalState } from '../../types';

interface FabMenuProps {
  onOpenModal: (modal: ModalState) => void;
}

export function FabMenu({ onOpenModal }: FabMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  const handleAction = (modal: ModalState) => {
    setIsOpen(false);
    onOpenModal(modal);
  };

  return (
    <div className="fixed bottom-6 right-8 z-40 flex flex-col items-end">
      {isOpen && (
        <div className="mb-3 bg-white dark:bg-[#161922] p-2.5 rounded-xl border-2 border-black dark:border-[#383F50] shadow-[4px_4px_0px_#000] flex flex-col gap-2 w-64 animate-in slide-in-from-bottom-2 duration-150 font-display">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-[#9CA3AF] px-2 py-1 border-b border-black dark:border-[#383F50]">
            Select Category to Schedule
          </div>

          <button
            onClick={() => handleAction('new-task-modal')}
            className="w-full text-left p-2.5 bg-[#E9D5FF] hover:bg-[#d8b4fe] dark:bg-[#2E1850] dark:hover:bg-[#3b1f66] border-2 border-black dark:border-[#A855F7] rounded-lg shadow-[3px_3px_0px_#000] neo-btn font-bold text-xs flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded bg-white dark:bg-[#0B0D11] border border-black dark:border-[#A855F7] flex items-center justify-center text-xs shadow-[1px_1px_0px_#000]">
                <span className="material-symbols-outlined text-[16px] text-slate-900 dark:text-[#C084FC]">auto_awesome</span>
              </span>
              <div>
                <div className="font-black text-slate-900 dark:text-[#C084FC]">
                  Flexible Task (Wkly)
                </div>
                <div className="text-[9px] text-slate-600 dark:text-[#9CA3AF] font-sans font-medium">
                  2-step minimalist & dynamic fields
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined text-[16px] text-slate-900 dark:text-[#C084FC]">arrow_forward</span>
          </button>

          <button
            onClick={() => handleAction('training-form')}
            className="w-full text-left p-2.5 bg-[#FFE4E6] hover:bg-[#fecdd3] dark:bg-[#2A161D] dark:hover:bg-[#381d26] border-2 border-black dark:border-[#FB7185] rounded-lg shadow-[3px_3px_0px_#000] neo-btn font-bold text-xs flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded bg-white dark:bg-[#0B0D11] border border-black dark:border-[#FB7185] flex items-center justify-center text-xs shadow-[1px_1px_0px_#000]">
                <span className="material-symbols-outlined text-[16px] text-slate-900 dark:text-[#FB7185]">fitness_center</span>
              </span>
              <div>
                <div className="font-black text-slate-900 dark:text-[#FB7185]">Training Session</div>
                <div className="text-[9px] text-slate-600 dark:text-[#9CA3AF] font-sans font-medium">
                  Sets, reps, RPE & drills
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined text-[16px] text-slate-900 dark:text-[#FB7185]">arrow_forward</span>
          </button>

          <button
            onClick={() => handleAction('study-form')}
            className="w-full text-left p-2.5 bg-[#BAE6FD] hover:bg-[#7dd3fc] dark:bg-[#132637] dark:hover:bg-[#183147] border-2 border-black dark:border-[#38BDF8] rounded-lg shadow-[3px_3px_0px_#000] neo-btn font-bold text-xs flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded bg-white dark:bg-[#0B0D11] border border-black dark:border-[#38BDF8] flex items-center justify-center text-xs shadow-[1px_1px_0px_#000]">
                <span className="material-symbols-outlined text-[16px] text-slate-900 dark:text-[#38BDF8]">menu_book</span>
              </span>
              <div>
                <div className="font-black text-slate-900 dark:text-[#38BDF8]">Study Session</div>
                <div className="text-[9px] text-slate-600 dark:text-[#9CA3AF] font-sans font-medium">
                  Lectures, problem sets
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined text-[16px] text-slate-900 dark:text-[#38BDF8]">arrow_forward</span>
          </button>

          <button
            onClick={() => handleAction('other-form')}
            className="w-full text-left p-2.5 bg-[#FEF08A] hover:bg-[#fde047] dark:bg-[#292312] dark:hover:bg-[#383019] border-2 border-black dark:border-[#FBBF24] rounded-lg shadow-[3px_3px_0px_#000] neo-btn font-bold text-xs flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded bg-white dark:bg-[#0B0D11] border border-black dark:border-[#FBBF24] flex items-center justify-center text-xs shadow-[1px_1px_0px_#000]">
                <span className="material-symbols-outlined text-[16px] text-slate-900 dark:text-[#FBBF24]">settings</span>
              </span>
              <div>
                <div className="font-black text-slate-900 dark:text-[#FBBF24]">Other Activity</div>
                <div className="text-[9px] text-slate-600 dark:text-[#9CA3AF] font-sans font-medium">
                  Nutrition, travel, mindset
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined text-[16px] text-slate-900 dark:text-[#FBBF24]">arrow_forward</span>
          </button>
        </div>
      )}

      <button
        onClick={toggle}
        aria-label="Open Quick Schedule Menu"
        className="w-14 h-14 bg-[#8B5CF6] dark:bg-[#9333EA] hover:bg-[#7c3aed] dark:hover:bg-[#C084FC] text-white dark:text-[#FFFFFF] rounded-xl border-2 border-black dark:border-white shadow-[4px_4px_0px_#000] neo-btn flex items-center justify-center font-display font-black focus:outline-none cursor-pointer"
      >
        <span className="material-symbols-outlined text-[28px] transition-transform duration-200">
          {isOpen ? 'close' : 'add'}
        </span>
      </button>
    </div>
  );
}
