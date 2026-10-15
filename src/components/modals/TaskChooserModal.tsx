import { useEffect } from 'react';
import { DayOfWeek } from '../../types';
import {
  WEEK_DAYS_ORDER,
  formatDayShortLabel,
  getYmdForDayInSameWeek,
  getDayNameFromDateStr,
} from '../../utils/dateUtils';

interface TaskChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDay: DayOfWeek;
  selectedDate?: string;
  onSelectDay: (day: DayOfWeek, dateStr?: string) => void;
  onSelectType: (type: 'study' | 'training' | 'other' | 'flexible') => void;
}

interface TaskOption {
  id: 'study' | 'training' | 'other' | 'flexible';
  numBadge: string;
  name: string;
  tagline: string;
  badge: string;
  icon: string;
  description: string;
  chips: string[];
  lightBg: string;
  darkBg: string;
  borderClass: string;
  accentColor: string;
  pillColor: string;
}

const TASK_OPTIONS: TaskOption[] = [
  {
    id: 'study',
    numBadge: '01',
    name: 'Study',
    tagline: 'Study Session · Academic Focus',
    badge: 'ACADEMICS',
    icon: 'menu_book',
    description: 'Academic coursework, lectures, Canvas assignments, problem sets, and exams.',
    chips: ['Canvas Sync', 'Coursework', 'Study Blocks'],
    lightBg: 'bg-[#BAE6FD]',
    darkBg: 'dark:bg-[#132637]',
    borderClass: 'border-black dark:border-[#38BDF8]',
    accentColor: 'text-[#0284c7] dark:text-[#38BDF8]',
    pillColor: 'bg-white text-slate-900 border-black dark:bg-[#0B1724] dark:text-[#38BDF8] dark:border-[#38BDF8]',
  },
  {
    id: 'training',
    numBadge: '02',
    name: 'Train',
    tagline: 'Training Session · Lifts & Drills',
    badge: 'LIFTS & DRILLS',
    icon: 'fitness_center',
    description: 'Drills, sets, reps, load weight, live RPE exertion, and periodization timers.',
    chips: ['Exercise Drills', 'Sets × Reps', 'Live RPE'],
    lightBg: 'bg-[#FFE4E6]',
    darkBg: 'dark:bg-[#2A161D]',
    borderClass: 'border-black dark:border-[#FB7185]',
    accentColor: 'text-[#e11d48] dark:text-[#FB7185]',
    pillColor: 'bg-white text-slate-900 border-black dark:bg-[#1E0F14] dark:text-[#FB7185] dark:border-[#FB7185]',
  },
  {
    id: 'other',
    numBadge: '03',
    name: 'Other',
    tagline: 'Other Activity · Life & Logistics',
    badge: 'LIFE & ADMIN',
    icon: 'settings',
    description: 'Physio rehab, meal prep nutrition, team meetings, travel, rest, and errands.',
    chips: ['Physio & Rehab', 'Nutrition', 'Team Logistics'],
    lightBg: 'bg-[#FEF08A]',
    darkBg: 'dark:bg-[#292312]',
    borderClass: 'border-black dark:border-[#FBBF24]',
    accentColor: 'text-[#ca8a04] dark:text-[#FBBF24]',
    pillColor: 'bg-white text-slate-900 border-black dark:bg-[#1C170A] dark:text-[#FBBF24] dark:border-[#FBBF24]',
  },
  {
    id: 'flexible',
    numBadge: '04',
    name: 'Flexible',
    tagline: 'Flexible Task · Custom Canvas',
    badge: 'DYNAMIC CANVAS',
    icon: 'bolt',
    description: 'Freeform layout, dynamic structured blocks, checklist tags, and customizable canvas.',
    chips: ['Custom Fields', 'Dynamic Tags', 'Checklists'],
    lightBg: 'bg-[#E9D5FF]',
    darkBg: 'dark:bg-[#2E1850]',
    borderClass: 'border-black dark:border-[#C084FC]',
    accentColor: 'text-[#9333ea] dark:text-[#C084FC]',
    pillColor: 'bg-white text-slate-900 border-black dark:bg-[#1B0D30] dark:text-[#C084FC] dark:border-[#C084FC]',
  },
];

export function TaskChooserModal({
  isOpen,
  onClose,
  selectedDay,
  selectedDate,
  onSelectDay,
  onSelectType,
}: TaskChooserModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formattedDate = selectedDate ? formatDayShortLabel(selectedDate) : selectedDay;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-chooser-title"
    >
      <div className="bg-white dark:bg-[#161922] text-slate-900 dark:text-[#F3F4F6] w-full max-w-lg max-h-[90vh] flex flex-col rounded-xl border-[2.5px] border-black dark:border-[#383F50] shadow-[6px_6px_0px_#000] dark:shadow-[6px_6px_0px_#000000] overflow-hidden my-auto animate-in zoom-in-95 duration-150 transition-all font-display">
        
        {/* Top Header Bar */}
        <div className="shrink-0 bg-[#FCF9F8] dark:bg-[#1E232E] border-b-[2.5px] border-black dark:border-[#383F50] px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 bg-[#8B5CF6] dark:bg-[#A855F7] text-white dark:text-[#0B0D11] border-2 border-black dark:border-white rounded text-[11px] font-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5 uppercase tracking-wide">
              <span className="material-symbols-outlined text-[14px] leading-none text-yellow-300 dark:text-white">add</span>
              <span>ADD TASK</span>
            </span>

            {/* Target Day & Date Picker */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-[#10141C] border-2 border-black dark:border-[#383F50] rounded-lg px-2.5 py-1 text-xs font-bold shadow-[2px_2px_0px_#000]">
              <span className="material-symbols-outlined text-[14px] text-slate-500 dark:text-[#9CA3AF] leading-none">
                calendar_today
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-[#9CA3AF]">
                DAY:
              </span>
              <select
                value={selectedDay}
                onChange={(e) => {
                  const newDay = e.target.value as DayOfWeek;
                  const newDate = getYmdForDayInSameWeek(newDay, selectedDate);
                  onSelectDay(newDay, newDate);
                }}
                className="bg-transparent font-black text-slate-900 dark:text-[#F3F4F6] cursor-pointer outline-none text-xs"
              >
                {WEEK_DAYS_ORDER.map((day) => (
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
            className="w-8 h-8 rounded-lg border-2 border-black dark:border-[#383F50] bg-white dark:bg-[#10141C] text-slate-900 dark:text-[#F3F4F6] hover:bg-rose-100 dark:hover:bg-[#2A161D] dark:hover:text-[#FB7185] flex items-center justify-center shadow-[2px_2px_0px_#000] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[18px] leading-none">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto scrollbar-custom">
          {/* Banner */}
          <div className="p-3 bg-[#FCF9F8] dark:bg-[#10141C] border-2 border-black dark:border-[#383F50] rounded-lg shadow-[2px_2px_0px_#000]">
            <div className="text-[10px] font-black uppercase tracking-widest text-[#8B5CF6] dark:text-[#C084FC]">
              CHOOSE: STUDY · TRAIN · OTHER · FLEXIBLE
            </div>
            <h3 id="task-chooser-title" className="text-base sm:text-lg font-black text-slate-900 dark:text-[#F3F4F6] tracking-tight mt-0.5">
              Adding Task for {selectedDay} ({formattedDate})
            </h3>
            <p className="text-[11px] font-semibold text-slate-600 dark:text-[#9CA3AF] mt-0.5">
              Select an activity type below to open the dedicated form with this day and date locked in.
            </p>
          </div>

          {/* 4 Neo-Brutalist Cards: Study · Train · Other · Flexible */}
          <div className="space-y-2.5">
            {TASK_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelectType(opt.id)}
                className={`w-full text-left p-3.5 rounded-xl border-[2.5px] ${opt.borderClass} ${opt.lightBg} ${opt.darkBg} shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#000000] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 flex items-start justify-between gap-3 group cursor-pointer`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Big Number & Icon Badge */}
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-[#0B0D11] border-2 border-black dark:border-white/30 shadow-[2px_2px_0px_#000] flex flex-col items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px] text-slate-900 dark:text-[#F3F4F6] leading-none">
                      {opt.icon}
                    </span>
                    <span className="text-[8px] font-black tracking-tighter text-slate-500 dark:text-[#9CA3AF]">
                      {opt.numBadge}
                    </span>
                  </div>

                  {/* Info Column */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-base font-black uppercase text-slate-900 dark:text-[#F3F4F6] tracking-tight">
                        {opt.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border shadow-[1px_1px_0px_#000] ${opt.pillColor}`}>
                        {opt.badge}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-700 dark:text-[#D1D5DB] leading-tight">
                      {opt.tagline}
                    </p>

                    <p className="text-[11px] text-slate-600 dark:text-[#9CA3AF] leading-snug mt-1 line-clamp-2">
                      {opt.description}
                    </p>

                    {/* Feature Chips */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {opt.chips.map((chip) => (
                        <span
                          key={chip}
                          className="px-1.5 py-0.5 bg-white/80 dark:bg-black/50 border border-black/30 dark:border-white/20 rounded text-[9px] font-black text-slate-800 dark:text-[#E5E7EB]"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Arrow Action Button */}
                <div className="shrink-0 w-8 h-8 rounded-lg bg-white dark:bg-[#0B0D11] border-2 border-black dark:border-white/30 shadow-[2px_2px_0px_#000] flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <span className="material-symbols-outlined text-[18px] text-slate-900 dark:text-[#F3F4F6] leading-none">
                    arrow_forward
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Footer note */}
          <div className="pt-1 flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-[#9CA3AF]">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-amber-500">lightbulb</span>
              <span>All forms preserve the selected day and week context.</span>
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
