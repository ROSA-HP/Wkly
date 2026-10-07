import { useEffect } from 'react';
import { DayOfWeek } from '../../types';

interface TaskChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
  onSelectType: (type: 'training' | 'study' | 'other' | 'flexible') => void;
}

const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

interface TaskOption {
  id: 'training' | 'study' | 'other' | 'flexible';
  title: string;
  badge: string;
  icon: string;
  subtitle: string;
  description: string;
  chips: string[];
  lightBg: string;
  darkBg: string;
  borderColor: string;
  darkBorderColor: string;
  textColor: string;
  darkTextColor: string;
  pillColor: string;
  darkPillColor: string;
}

const TASK_OPTIONS: TaskOption[] = [
  {
    id: 'training',
    title: 'Training Session',
    badge: 'LIFTS & DRILLS',
    icon: 'fitness_center',
    subtitle: 'Strength & Periodization',
    description: 'Drills, sets, reps, load weights, and live RPE exertion.',
    chips: ['Strength Drills', 'Sets & Reps', 'Live RPE'],
    lightBg: 'bg-[#FFE4E6]',
    darkBg: 'dark:bg-[#2A161D]',
    borderColor: 'border-black',
    darkBorderColor: 'dark:border-[#FB7185]',
    textColor: 'text-slate-900',
    darkTextColor: 'dark:text-[#FB7185]',
    pillColor: 'bg-white text-slate-900',
    darkPillColor: 'dark:bg-[#1E0F14] dark:text-[#FB7185]',
  },
  {
    id: 'study',
    title: 'Study Session',
    badge: 'ACADEMICS',
    icon: 'menu_book',
    subtitle: 'Coursework & Canvas',
    description: 'Academic focus blocks, course code, exams & problem sets.',
    chips: ['Canvas Sync', 'Course Code', 'Study Block'],
    lightBg: 'bg-[#BAE6FD]',
    darkBg: 'dark:bg-[#132637]',
    borderColor: 'border-black',
    darkBorderColor: 'dark:border-[#38BDF8]',
    textColor: 'text-slate-900',
    darkTextColor: 'dark:text-[#38BDF8]',
    pillColor: 'bg-white text-slate-900',
    darkPillColor: 'dark:bg-[#0B1724] dark:text-[#38BDF8]',
  },
  {
    id: 'other',
    title: 'Other Activity',
    badge: 'LIFE & LOGISTICS',
    icon: 'settings',
    subtitle: 'Physio & Logistics',
    description: 'Nutrition, physio rehab, team meetings, rest and sleep.',
    chips: ['Physio & Rehab', 'Nutrition', 'Meetings'],
    lightBg: 'bg-[#FEF08A]',
    darkBg: 'dark:bg-[#292312]',
    borderColor: 'border-black',
    darkBorderColor: 'dark:border-[#FBBF24]',
    textColor: 'text-slate-900',
    darkTextColor: 'dark:text-[#FBBF24]',
    pillColor: 'bg-white text-slate-900',
    darkPillColor: 'dark:bg-[#1C170A] dark:text-[#FBBF24]',
  },
  {
    id: 'flexible',
    title: 'Flexible Task',
    badge: 'DYNAMIC CANVAS',
    icon: 'bolt',
    subtitle: 'Custom Attributes',
    description: 'Dynamic custom blocks, checklist tags, and freeform canvas.',
    chips: ['Custom Fields', 'Dynamic Tags', 'Checklists'],
    lightBg: 'bg-[#E9D5FF]',
    darkBg: 'dark:bg-[#2E1850]',
    borderColor: 'border-black',
    darkBorderColor: 'dark:border-[#C084FC]',
    textColor: 'text-slate-900',
    darkTextColor: 'dark:text-[#C084FC]',
    pillColor: 'bg-white text-slate-900',
    darkPillColor: 'dark:bg-[#1B0D30] dark:text-[#C084FC]',
  },
];

export function TaskChooserModal({
  isOpen,
  onClose,
  selectedDay,
  onSelectDay,
  onSelectType,
}: TaskChooserModalProps) {
  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-chooser-title"
    >
      <div className="bg-white dark:bg-[#161922] text-slate-900 dark:text-[#F3F4F6] w-full max-w-md sm:max-w-lg max-h-[88vh] flex flex-col rounded-xl border-2 border-black dark:border-[#383F50] shadow-[5px_5px_0_#000] dark:shadow-[5px_5px_0_#000000] overflow-hidden my-auto animate-in zoom-in-95 duration-150 transition-all font-display">
        
        {/* Top Header Bar */}
        <div className="shrink-0 bg-[#FCF9F8] dark:bg-[#1E232E] border-b-2 border-black dark:border-[#383F50] px-3.5 py-2.5 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 bg-[#8B5CF6] dark:bg-[#A855F7] text-white dark:text-[#0B0D11] border-2 border-black dark:border-white rounded text-[11px] font-black shadow-[1.5px_1.5px_0px_#000] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[13px] leading-none text-yellow-300 dark:text-white">add</span>
              <span>NEW ACTIVITY</span>
            </span>

            {/* Target Day Picker Dropdown Pill */}
            <div className="flex items-center gap-1 bg-white dark:bg-[#10141C] border-2 border-black dark:border-[#383F50] rounded px-2 py-0.5 text-[11px] font-bold shadow-[1.5px_1.5px_0px_#000]">
              <span className="text-slate-500 dark:text-[#9CA3AF] text-[9px] font-black uppercase tracking-wider">
                DAY:
              </span>
              <select
                value={selectedDay}
                onChange={(e) => onSelectDay(e.target.value as DayOfWeek)}
                className="bg-transparent font-black text-slate-900 dark:text-[#F3F4F6] cursor-pointer outline-none text-xs"
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day} value={day} className="bg-white dark:bg-[#161922] text-slate-900 dark:text-[#F3F4F6]">
                    {day}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded border-2 border-black dark:border-[#383F50] bg-white dark:bg-[#10141C] text-slate-900 dark:text-[#F3F4F6] hover:bg-rose-100 dark:hover:bg-[#2A161D] dark:hover:text-[#FB7185] flex items-center justify-center shadow-[1.5px_1.5px_0px_#000] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[16px] leading-none">close</span>
          </button>
        </div>

        {/* Modal Intro Body */}
        <div className="p-3.5 sm:p-4 space-y-3 overflow-y-auto">
          <div>
            <h3 id="modal-chooser-title" className="text-base sm:text-lg font-black text-slate-900 dark:text-[#F3F4F6] tracking-tight">
              What are we planning for {selectedDay}?
            </h3>
            <p className="text-[11px] font-medium text-slate-600 dark:text-[#9CA3AF] mt-0.5">
              Choose an activity type to load periodization, Canvas sync, or custom fields.
            </p>
          </div>

          {/* 4 Category Selection Cards (Grid 2x2) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
            {TASK_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelectType(opt.id)}
                className={`text-left p-3 rounded-lg border-2 ${opt.borderColor} ${opt.darkBorderColor} ${opt.lightBg} ${opt.darkBg} shadow-[3px_3px_0_#000] dark:shadow-[3px_3px_0_#000000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] dark:hover:shadow-[4px_4px_0_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 flex flex-col justify-between group cursor-pointer`}
              >
                <div>
                  {/* Card Header with Icon & Badge */}
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <span className="material-symbols-outlined text-2xl transform group-hover:scale-110 transition-transform text-slate-900 dark:text-[#F3F4F6]">
                      {opt.icon}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider border border-black dark:border-white/20 shadow-[1px_1px_0_#000] ${opt.pillColor} ${opt.darkPillColor}`}>
                      {opt.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h4 className="text-sm font-black text-slate-900 dark:text-[#F3F4F6] leading-tight">
                    {opt.title}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-700 dark:text-[#9CA3AF] mb-1">
                    {opt.subtitle}
                  </p>

                  <p className="text-[11px] text-slate-600 dark:text-[#D1D5DB] leading-snug line-clamp-2">
                    {opt.description}
                  </p>
                </div>

                {/* Feature Chips */}
                <div className="mt-2.5 pt-2 border-t border-black/15 dark:border-white/10 flex flex-wrap gap-1">
                  {opt.chips.map((chip) => (
                    <span
                      key={chip}
                      className="px-1.5 py-0.5 bg-white/70 dark:bg-black/40 border border-black/25 dark:border-white/20 rounded text-[8.5px] font-bold text-slate-800 dark:text-[#E5E7EB]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {/* Bottom Footnote & Cancel */}
          <div className="pt-1 flex items-center justify-between text-[10px] font-medium text-slate-500 dark:text-[#9CA3AF]">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-amber-500">lightbulb</span>
              <span>Need custom layout? Choose <strong>Flexible Task</strong>.</span>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="font-bold hover:text-slate-900 dark:hover:text-[#F3F4F6] underline cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default TaskChooserModal;
