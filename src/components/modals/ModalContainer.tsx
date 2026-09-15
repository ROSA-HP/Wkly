import { ReactNode } from 'react';

interface ModalContainerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title: string;
  badge?: ReactNode;
  subtitle?: ReactNode;
}

export function ModalContainer({ isOpen, onClose, children, title, badge, subtitle }: ModalContainerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-xl border-3 border-black neo-box-lg overflow-hidden my-6 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#fcf9f8] border-b-2 border-black p-4 flex items-center justify-between font-display">
          <div className="flex items-center gap-2">
            {badge}
            {subtitle && (
              typeof subtitle === 'string' 
                ? <span className="text-xs text-slate-500 font-bold">{subtitle}</span> 
                : subtitle
            )}
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded border-2 border-black bg-white hover:bg-red-100 flex items-center justify-center font-black text-sm neo-box-sm transition-colors"
          >
            ✕
          </button>
        </div>
        
        {/* Content */}
        {children}
        
      </div>
    </div>
  );
}
