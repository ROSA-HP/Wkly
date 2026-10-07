import { useState, useMemo } from 'react';
import { Task, DayOfWeek, ModalState, TaskCategory } from '../../types';
import { DayColumn } from '../dashboard/DayColumn';
import { DayInfo, getWeekDays, extractTaskYmd } from '../../utils/dateUtils';
import { FabMenu } from '../dashboard/FabMenu';

interface DashboardViewProps {
  tasks: Task[];
  onOpenModal: (modal: ModalState) => void;
  onTaskClick: (task: Task) => void;
  onAddTaskDay?: (day: DayOfWeek, dateStr: string) => void;
}

function parseTimeToMinutes(timeStr?: string, isoDate?: string): number {
  if (timeStr) {
    const match = timeStr.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10) || 0;
      const period = match[3] ? match[3].toUpperCase() : null;

      if (period === 'PM' && hours < 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
      return hours * 60 + minutes;
    }
  }

  if (isoDate) {
    const parsed = new Date(isoDate);
    if (!isNaN(parsed.getTime())) {
      return parsed.getUTCHours() * 60 + parsed.getUTCMinutes();
    }
  }

  return 9999;
}

export function DashboardView({
  tasks,
  onOpenModal,
  onTaskClick,
  onAddTaskDay,
}: DashboardViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | TaskCategory>('ALL');
  const [weekOffset, setWeekOffset] = useState<number>(0);

  const weekDays = useMemo(() => getWeekDays(weekOffset), [weekOffset]);
  const startDay = weekDays[0];
  const endDay = weekDays[6];
  const weekRangeLabel = `${startDay.monthShort} ${String(startDay.date).padStart(2, '0')} – ${endDay.monthShort} ${String(endDay.date).padStart(2, '0')}, ${startDay.dateStr.slice(0, 4)}`;

  const currentWeekDateStrs = useMemo(
    () => new Set(weekDays.map((d) => d.dateStr)),
    [weekDays]
  );

  // Active tasks for the week in view (matched strictly by task date)
  const activeWeekTasks = useMemo(() => {
    return tasks.filter((task) => {
      const taskYmd = extractTaskYmd(task);
      if (taskYmd) {
        return currentWeekDateStrs.has(taskYmd);
      }
      // Fallback only if task has no date at all
      return weekOffset === 0;
    });
  }, [tasks, currentWeekDateStrs, weekOffset]);

  const filteredTasks = useMemo(() => {
    return selectedCategory === 'ALL'
      ? activeWeekTasks
      : activeWeekTasks.filter((t) => t.category === selectedCategory);
  }, [activeWeekTasks, selectedCategory]);

  const getTasksForDay = (dayObj: DayInfo) =>
    filteredTasks
      .filter((task) => {
        const taskYmd = extractTaskYmd(task);
        if (taskYmd) {
          // Strictly match task date to column date
          return taskYmd === dayObj.dateStr;
        }
        // Fallback for legacy tasks without any date value
        return weekOffset === 0 && task.day === dayObj.name;
      })
      .slice()
      .sort((a, b) => parseTimeToMinutes(a.time, a.date) - parseTimeToMinutes(b.time, b.date));

  const trainingCount = activeWeekTasks.filter((task) => task.category === 'TRAINING').length;
  const studyCount = activeWeekTasks.filter((task) => task.category === 'STUDYING').length;
  const otherCount = activeWeekTasks.filter((task) => task.category === 'OTHER').length;

  return (
    <section className="flex-1 flex flex-col relative min-h-screen bg-[#FCF9F8] dark:bg-[#0B0D11] transition-colors duration-200 animate-in fade-in">
      {/* Top App Navigation / Status Bar */}
      <div className="bg-white dark:bg-[#161922] border-b-2 border-black dark:border-[#383F50] px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 font-display transition-colors">
        <div className="flex items-center gap-4">
          <h2 className="text-lg md:text-xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-[#F3F4F6]">
            Rosa's Wkly Plan
          </h2>
          <div className="flex items-center border-2 border-black dark:border-[#383F50] rounded overflow-hidden shadow-[2px_2px_0px_#000] text-xs font-bold">
            <button
              type="button"
              onClick={() => setWeekOffset((prev) => prev - 1)}
              title="Previous Week"
              className="px-2 py-1 bg-white dark:bg-[#1E232E] hover:bg-slate-100 dark:hover:bg-[#2E1850] text-slate-900 dark:text-[#F3F4F6] border-r border-black dark:border-[#383F50] flex items-center justify-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] leading-none">chevron_left</span>
            </button>
            <span className="px-3 py-1 bg-white dark:bg-[#161922] text-slate-900 dark:text-[#F3F4F6]">
              {weekRangeLabel}
            </span>
            <button
              type="button"
              onClick={() => setWeekOffset((prev) => prev + 1)}
              title="Next Week"
              className="px-2 py-1 bg-white dark:bg-[#1E232E] hover:bg-slate-100 dark:hover:bg-[#2E1850] text-slate-900 dark:text-[#F3F4F6] border-l border-black dark:border-[#383F50] flex items-center justify-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] leading-none">chevron_right</span>
            </button>
          </div>
          {weekOffset !== 0 && (
            <button
              type="button"
              onClick={() => setWeekOffset(0)}
              className="px-2 py-1 text-[11px] font-black uppercase bg-[#8B5CF6] hover:bg-[#7c3aed] text-white rounded border-2 border-black shadow-[1.5px_1.5px_0_#000] cursor-pointer"
            >
              Current Week
            </button>
          )}
        </div>

        {/* Streak & CNS Readiness Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* CNS Ready Badge: #10B981 (Emerald) on #0A291E */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#A7F3D0] dark:bg-[#0A291E] text-emerald-950 dark:text-[#10B981] border-2 border-black dark:border-[#10B981] rounded-lg font-bold text-xs shadow-[2px_2px_0px_#000] hover:scale-105 transition-transform cursor-default">
            <span className="material-symbols-outlined text-[16px] leading-none text-emerald-800 dark:text-[#10B981] animate-pulse">
              bolt
            </span>
            <span>CNS READY 94%</span>
          </div>

          {/* Streak (Fire) Badge: #F97316 (Neon Orange) on #2E190B */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-100 dark:bg-[#2E190B] text-orange-950 dark:text-[#F97316] border-2 border-black dark:border-[#F97316] rounded-lg font-bold text-xs shadow-[2px_2px_0px_#000] hover:scale-105 transition-transform cursor-default">
            <span className="material-symbols-outlined text-[16px] leading-none text-orange-600 dark:text-[#F97316]">
              local_fire_department
            </span>
            <span>12 DAY STREAK</span>
          </div>

          <button className="w-8 h-8 rounded-full bg-[#FFE4E6] dark:bg-[#2A161D] text-slate-900 dark:text-[#FB7185] border-2 border-black dark:border-[#FB7185] font-black text-xs flex items-center justify-center shadow-[2px_2px_0px_#000] hover:rotate-12 transition-transform cursor-pointer">
            RP
          </button>
        </div>
      </div>

      {/* Subheader Filter Controls */}
      <div className="bg-[#F6F3F2] dark:bg-[#1E232E] border-b-2 border-black dark:border-[#383F50] px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-bold font-display transition-colors">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-custom pb-1">
          <span className="text-slate-500 dark:text-[#9CA3AF] uppercase tracking-wider text-[10px] font-black mr-1">
            Views:
          </span>
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 border-2 rounded shadow-[2px_2px_0px_#000] whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-[#8B5CF6] dark:bg-[#A855F7] text-white dark:text-[#0B0D11] border-black dark:border-white font-black'
                : 'bg-white dark:bg-[#161922] text-slate-800 dark:text-[#F3F4F6] border-black dark:border-[#383F50] hover:bg-slate-50 dark:hover:bg-[#2E1850]'
            }`}
          >
            ALL CATEGORIES ({activeWeekTasks.length})
          </button>
          <button
            onClick={() => setSelectedCategory('TRAINING')}
            className={`px-3 py-1 border-2 rounded shadow-[2px_2px_0px_#000] whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'TRAINING'
                ? 'bg-[#FFE4E6] dark:bg-[#2A161D] text-slate-900 dark:text-[#FB7185] border-black dark:border-[#FB7185] font-black'
                : 'bg-white dark:bg-[#161922] text-slate-800 dark:text-[#F3F4F6] border-black dark:border-[#383F50] hover:bg-slate-50 dark:hover:bg-[#2A161D]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] leading-none">fitness_center</span>
            <span>TRAINING ({trainingCount})</span>
          </button>
          <button
            onClick={() => setSelectedCategory('STUDYING')}
            className={`px-3 py-1 border-2 rounded shadow-[2px_2px_0px_#000] whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'STUDYING'
                ? 'bg-[#BAE6FD] dark:bg-[#132637] text-slate-900 dark:text-[#38BDF8] border-black dark:border-[#38BDF8] font-black'
                : 'bg-white dark:bg-[#161922] text-slate-800 dark:text-[#F3F4F6] border-black dark:border-[#383F50] hover:bg-slate-50 dark:hover:bg-[#132637]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] leading-none">menu_book</span>
            <span>STUDYING ({studyCount})</span>
          </button>
          <button
            onClick={() => setSelectedCategory('OTHER')}
            className={`px-3 py-1 border-2 rounded shadow-[2px_2px_0px_#000] whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'OTHER'
                ? 'bg-[#FEF08A] dark:bg-[#292312] text-slate-900 dark:text-[#FBBF24] border-black dark:border-[#FBBF24] font-black'
                : 'bg-white dark:bg-[#161922] text-slate-800 dark:text-[#F3F4F6] border-black dark:border-[#383F50] hover:bg-slate-50 dark:hover:bg-[#292312]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] leading-none">settings</span>
            <span>OTHER ({otherCount})</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-slate-600 dark:text-[#9CA3AF] font-semibold whitespace-nowrap">
            <span className="font-bold text-black dark:text-[#F3F4F6]">{filteredTasks.length}</span>{' '}
            scheduled sessions
          </div>
        </div>
      </div>

      {/* 7-Day Grid */}
      <div className="flex-1 p-6 overflow-x-auto scrollbar-custom">
        <div className="grid grid-cols-7 gap-4 min-w-[1220px] items-stretch pb-24">
          {weekDays.map((day, idx) => (
            <div
              key={`${day.name}-${day.dateStr}`}
              style={{ animationDelay: `${idx * 60}ms` }}
              className="animate-in fade-in slide-in-from-bottom-3 duration-300 fill-mode-both"
            >
              <DayColumn
                day={day}
                tasks={getTasksForDay(day)}
                onTaskClick={onTaskClick}
                onAddTask={(dayName, dateStr) => {
                  if (onAddTaskDay) {
                    onAddTaskDay(dayName, dateStr);
                  } else {
                    onOpenModal('new-task-modal');
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <FabMenu onOpenModal={onOpenModal} />
    </section>
  );
}
