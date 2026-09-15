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
        <div className="mb-3 bg-white p-2.5 rounded-xl border-2 border-black neo-box flex flex-col gap-2 w-60 animate-in slide-in-from-bottom-2 duration-150 font-display">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-2 py-1 border-b border-black">
            Select Category to Schedule
          </div>
          
          <button onClick={() => handleAction('training-form')} className="w-full text-left p-2.5 bg-[#fce7f3] hover:bg-[#fbcfe8] border-2 border-black rounded-lg neo-btn font-bold text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded bg-white border border-black flex items-center justify-center text-xs shadow-[1px_1px_0px_#000]">🏋️</span>
              <div>
                <div className="font-black text-slate-900">Training Session</div>
                <div className="text-[9px] text-slate-600 font-sans font-medium">Sets, reps, RPE & drills</div>
              </div>
            </div>
            <span className="text-xs font-black">→</span>
          </button>
          
          <button onClick={() => handleAction('study-form')} className="w-full text-left p-2.5 bg-[#e0f2fe] hover:bg-[#bae6fd] border-2 border-black rounded-lg neo-btn font-bold text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded bg-white border border-black flex items-center justify-center text-xs shadow-[1px_1px_0px_#000]">📖</span>
              <div>
                <div className="font-black text-slate-900">Study Session</div>
                <div className="text-[9px] text-slate-600 font-sans font-medium">Lectures, problem sets</div>
              </div>
            </div>
            <span className="text-xs font-black">→</span>
          </button>
          
          <button onClick={() => handleAction('other-form')} className="w-full text-left p-2.5 bg-[#fed7aa] hover:bg-[#fdba74] border-2 border-black rounded-lg neo-btn font-bold text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded bg-white border border-black flex items-center justify-center text-xs shadow-[1px_1px_0px_#000]">⚙️</span>
              <div>
                <div className="font-black text-slate-900">Other Activity</div>
                <div className="text-[9px] text-slate-600 font-sans font-medium">Nutrition, travel, mindset</div>
              </div>
            </div>
            <span className="text-xs font-black">→</span>
          </button>
        </div>
      )}

      <button 
        onClick={toggle}
        className="w-14 h-14 bg-[#8b5cf6] text-white rounded-xl border-2 border-black shadow-[4px_4px_0px_#000] neo-btn flex items-center justify-center text-3xl font-display font-black focus:outline-none"
      >
        <span className="transform transition-transform duration-200" style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>+</span>
      </button>
    </div>
  );
}
