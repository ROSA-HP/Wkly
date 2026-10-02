import { ReactNode } from 'react';

interface ModalContainerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title: string;
  badge?: ReactNode;
  subtitle?: ReactNode;
}

export function ModalContainer({
  isOpen,
  onClose,
  children,
  badge,
  subtitle,
}: ModalContainerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#161922] text-slate-900 dark:text-[#F3F4F6] w-full max-w-lg rounded-xl border-3 border-black dark:border-[#383F50] neo-box-lg overflow-hidden my-6 animate-in zoom-in-95 duration-150 transition-colors">
        {/* Header */}
        <div className="bg-[#FCF9F8] dark:bg-[#1E232E] border-b-2 border-black dark:border-[#383F50] p-4 flex items-center justify-between font-display">
          <div className="flex items-center gap-2 flex-wrap">
            {badge}
            {subtitle &&
              (typeof subtitle === 'string' ? (
                <span className="text-xs text-slate-500 dark:text-[#9CA3AF] font-bold">
                  {subtitle}
                </span>
              ) : (
                subtitle
              ))}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded border-2 border-black dark:border-[#383F50] bg-white dark:bg-[#10141C] text-slate-900 dark:text-[#F3F4F6] hover:bg-red-100 dark:hover:bg-[#2A161D] dark:hover:text-[#FB7185] flex items-center justify-center font-black text-sm neo-box-sm transition-colors cursor-pointer"
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
