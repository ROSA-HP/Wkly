import { useState, useMemo, useRef, useEffect } from 'react';
import { Task, DayOfWeek, ModalState, TaskCategory } from '../../types';
import { DayColumn } from '../dashboard/DayColumn';
import { DayInfo, getWeekDays, extractTaskYmd, getWeekNumber } from '../../utils/dateUtils';
import { FabMenu } from '../dashboard/FabMenu';
import { MobileDashboardView } from './MobileDashboardView';
import { WklyLogo } from '../layout/WklyLogo';

interface DashboardViewProps {
  tasks: Task[];
  onOpenModal: (modal: ModalState) => void;
  onTaskClick: (task: Task) => void;
  onAddTaskDay?: (day: DayOfWeek, dateStr: string) => void;
  onUpdateTask?: (taskId: string, updatedFields: Partial<Task>) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onLogout?: () => void;
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
  onUpdateTask,
  isDarkMode,
  onToggleDarkMode,
  onLogout,
}: DashboardViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | TaskCategory>('ALL');
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isProfileOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isProfileOpen]);

  const weekDays = useMemo(() => getWeekDays(weekOffset), [weekOffset]);
  const startDay = weekDays[0];
  const endDay = weekDays[6];
  const weekRangeLabel = `${startDay.monthShort} ${String(startDay.date).padStart(2, '0')} – ${endDay.monthShort} ${String(endDay.date).padStart(2, '0')}, ${startDay.dateStr.slice(0, 4)}`;

  const currentWeekNumber = useMemo(() => {
    return getWeekNumber(startDay.dateStr);
  }, [startDay]);

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

  const totalWeeklyHours = useMemo(() => {
    const hrs = filteredTasks.reduce((acc, t) => {
      if (!t.duration) return acc + 1.0;
      const matchMin = t.duration.match(/(\d+)\s*m/i);
      if (matchMin) return acc + parseInt(matchMin[1], 10) / 60;
      const matchHr = t.duration.match(/(\d+(?:\.\d+)?)\s*h/i);
      if (matchHr) return acc + parseFloat(matchHr[1]);
      const num = parseInt(t.duration, 10);
      return acc + (isNaN(num) ? 1.0 : num / 60);
    }, 0);
    return Math.round(hrs * 10) / 10;
  }, [filteredTasks]);

  const handleQuickAddTask = () => {
    const today = weekDays.find((d) => d.isToday) || weekDays[0];
    if (onAddTaskDay && today) {
      onAddTaskDay(today.name, today.dateStr);
    } else {
      onOpenModal('task-chooser');
    }
  };

  return (
    <section className="flex-1 flex flex-col relative min-h-screen bg-[#FCF9F8] dark:bg-[#0B0D11] transition-colors duration-200 animate-in fade-in">
      {/* Mobile & Tablet Stitch Layout (Visible on screens <= 1024px via @media CSS) */}
      <div className="wkly-mobile-tablet-only w-full">
        <MobileDashboardView
          tasks={tasks}
          weekDays={weekDays}
          weekOffset={weekOffset}
          onSetWeekOffset={setWeekOffset}
          onResetWeekOffset={() => setWeekOffset(0)}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onTaskClick={onTaskClick}
          onAddTaskDay={onAddTaskDay}
          onUpdateTask={onUpdateTask}
          isDarkMode={isDarkMode}
          onToggleDarkMode={onToggleDarkMode}
        />
      </div>

      {/* Desktop 7-Day Grid Layout (Visible on screens > 1024px via @media CSS) */}
      <div className="wkly-desktop-only w-full flex-col flex-1">
        {/* Top Unified Laptop Navbar (Sticky) */}
        <header className="sticky top-0 z-40 bg-white dark:bg-[#161922] border-b-2 border-black dark:border-[#383F50] px-5 py-2.5 flex items-center justify-between gap-4 font-display transition-colors shadow-xs">
          {/* Left: Brand Identity + Athlete Title */}
          <div className="flex items-center gap-3 shrink-0">
            <WklyLogo id="desktop-wkly-logo" size="sm" />
            <div className="h-6 w-[2px] bg-black/15 dark:bg-white/20 hidden md:block"></div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-[#F3F4F6] leading-none">
                  Rosa's Wkly Plan
                </h1>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live Synced"></span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-[#9CA3AF] leading-none mt-0.5">
                Stanford Track & Field · D1
              </p>
            </div>
          </div>

          {/* Center: Week Navigation Control Bar */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#FCF9F8] dark:bg-[#1E232E] border-2 border-black dark:border-[#383F50] rounded-lg shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#000000] overflow-hidden text-xs font-bold">
              <button
                type="button"
                onClick={() => setWeekOffset((prev) => prev - 1)}
                title="Previous Week"
                className="px-2.5 py-1.5 hover:bg-slate-200 dark:hover:bg-[#2A3346] text-slate-900 dark:text-[#F3F4F6] border-r-2 border-black dark:border-[#383F50] flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] leading-none">chevron_left</span>
              </button>
              
              <div className="px-3 py-1 flex items-center gap-2 select-none">
                <span className="material-symbols-outlined text-[15px] text-slate-400 dark:text-[#9CA3AF] leading-none">
                  calendar_month
                </span>
                <span className="font-extrabold text-slate-900 dark:text-[#F3F4F6] tracking-tight whitespace-nowrap">
                  {weekRangeLabel}
                </span>
                <span className="px-1.5 py-0.5 bg-black dark:bg-[#383F50] text-white text-[9px] font-black rounded uppercase">
                  W{currentWeekNumber}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setWeekOffset((prev) => prev + 1)}
                title="Next Week"
                className="px-2.5 py-1.5 hover:bg-slate-200 dark:hover:bg-[#2A3346] text-slate-900 dark:text-[#F3F4F6] border-l-2 border-black dark:border-[#383F50] flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] leading-none">chevron_right</span>
              </button>
            </div>

            {weekOffset !== 0 && (
              <button
                type="button"
                onClick={() => setWeekOffset(0)}
                title="Reset to current week"
                className="px-2.5 py-1.5 text-[10px] font-black uppercase bg-[#8B5CF6] hover:bg-[#7c3aed] text-white rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1 transition-transform active:translate-x-0.5 active:translate-y-0.5"
              >
                <span className="material-symbols-outlined text-[13px] leading-none">restart_alt</span>
                <span className="hidden lg:inline">Current Week</span>
              </button>
            )}
          </div>

          {/* Right: Status Badges, Add Task, Night Mode Toggle, and User Profile */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* CNS Readiness */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-[#A7F3D0] dark:bg-[#0A291E] text-emerald-950 dark:text-[#10B981] border-2 border-black dark:border-[#10B981] rounded-lg font-black text-[11px] shadow-[2px_2px_0px_#000] cursor-default">
              <span className="material-symbols-outlined text-[15px] leading-none text-emerald-800 dark:text-[#10B981] animate-pulse">
                bolt
              </span>
              <span>CNS 94%</span>
            </div>

            {/* Streak Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 dark:bg-[#2E190B] text-orange-950 dark:text-[#F97316] border-2 border-black dark:border-[#F97316] rounded-lg font-black text-[11px] shadow-[2px_2px_0px_#000] cursor-default">
              <span className="material-symbols-outlined text-[15px] leading-none text-orange-600 dark:text-[#F97316]">
                local_fire_department
              </span>
              <span>12 DAYS</span>
            </div>

            {/* Quick Add Task Button */}
            <button
              type="button"
              onClick={handleQuickAddTask}
              className="px-3 py-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-black uppercase tracking-wider rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5"
            >
              <span className="material-symbols-outlined text-[16px] leading-none text-yellow-300">add</span>
              <span>Add Task</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            {onToggleDarkMode && (
              <button
                type="button"
                onClick={onToggleDarkMode}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Night Mode'}
                className="w-8 h-8 rounded-lg border-2 border-black dark:border-[#383F50] bg-white dark:bg-[#1E232E] text-slate-900 dark:text-[#F3F4F6] hover:bg-slate-100 dark:hover:bg-[#2A3346] flex items-center justify-center shadow-[2px_2px_0px_#000] cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5"
              >
                <span className="material-symbols-outlined text-[17px] leading-none">
                  {isDarkMode ? 'light_mode' : 'dark_mode'}
                </span>
              </button>
            )}

            {/* Profile Dropdown Menu */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="w-8 h-8 rounded-full bg-[#FFE4E6] dark:bg-[#2A161D] text-slate-900 dark:text-[#FB7185] border-2 border-black dark:border-[#FB7185] font-black text-xs flex items-center justify-center shadow-[2px_2px_0px_#000] cursor-pointer hover:rotate-6 transition-all"
                aria-label="User Profile Menu"
              >
                RP
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#161922] border-2 border-black dark:border-[#383F50] rounded-xl shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#000000] p-3 z-50 text-xs font-display animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center gap-2.5 pb-2.5 border-b border-black/10 dark:border-white/10">
                    <div className="w-9 h-9 rounded-full bg-[#FFE4E6] dark:bg-[#2A161D] text-slate-900 dark:text-[#FB7185] border-2 border-black dark:border-[#FB7185] font-black text-xs flex items-center justify-center shadow-[1.5px_1.5px_0px_#000]">
                      RP
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-black text-slate-900 dark:text-[#F3F4F6] truncate">
                        Rosa Athlete
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-[#9CA3AF] truncate">
                        rosa.athlete@stanford.edu
                      </div>
                    </div>
                  </div>

                  <div className="py-2 space-y-1 text-[11px] font-bold text-slate-700 dark:text-[#D1D5DB]">
                    <div className="px-2 py-1 bg-slate-50 dark:bg-[#1E232E] rounded border border-black/10 dark:border-white/10 flex items-center justify-between">
                      <span className="text-slate-500 dark:text-[#9CA3AF]">Team:</span>
                      <span className="font-extrabold text-slate-900 dark:text-[#F3F4F6]">Stanford T&F (D1)</span>
                    </div>
                    <div className="px-2 py-1 bg-slate-50 dark:bg-[#1E232E] rounded border border-black/10 dark:border-white/10 flex items-center justify-between">
                      <span className="text-slate-500 dark:text-[#9CA3AF]">This Week:</span>
                      <span className="font-extrabold text-slate-900 dark:text-[#F3F4F6]">{activeWeekTasks.length} Blocks</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-black/10 dark:border-white/10 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setWeekOffset(0);
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-[#1E232E] text-slate-800 dark:text-[#E5E7EB] font-bold flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">today</span>
                      <span>Jump to Today</span>
                    </button>
                    {onLogout && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded hover:bg-rose-50 dark:hover:bg-[#2A161D] text-rose-600 dark:text-[#FB7185] font-black flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <span className="material-symbols-outlined text-[15px]">logout</span>
                        <span>Sign Out / Switch</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Subheader Filter Controls */}
        <div className="bg-[#F6F3F2] dark:bg-[#1E232E] border-b-2 border-black dark:border-[#383F50] px-5 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-bold font-display transition-colors">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-custom pb-0.5">
            <span className="text-slate-500 dark:text-[#9CA3AF] uppercase tracking-wider text-[10px] font-black mr-1">
              Filter:
            </span>
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1 border-2 rounded shadow-[1.5px_1.5px_0px_#000] whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-[#8B5CF6] dark:bg-[#A855F7] text-white dark:text-[#0B0D11] border-black dark:border-white font-black'
                  : 'bg-white dark:bg-[#161922] text-slate-800 dark:text-[#F3F4F6] border-black dark:border-[#383F50] hover:bg-slate-50 dark:hover:bg-[#2E1850]'
              }`}
            >
              ALL CATEGORIES ({activeWeekTasks.length})
            </button>
            <button
              onClick={() => setSelectedCategory('TRAINING')}
              className={`px-3 py-1 border-2 rounded shadow-[1.5px_1.5px_0px_#000] whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
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
              className={`px-3 py-1 border-2 rounded shadow-[1.5px_1.5px_0px_#000] whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
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
              className={`px-3 py-1 border-2 rounded shadow-[1.5px_1.5px_0px_#000] whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'OTHER'
                  ? 'bg-[#FEF08A] dark:bg-[#292312] text-slate-900 dark:text-[#FBBF24] border-black dark:border-[#FBBF24] font-black'
                  : 'bg-white dark:bg-[#161922] text-slate-800 dark:text-[#F3F4F6] border-black dark:border-[#383F50] hover:bg-slate-50 dark:hover:bg-[#292312]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px] leading-none">settings</span>
              <span>OTHER ({otherCount})</span>
            </button>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-[#9CA3AF] font-bold text-[11px] whitespace-nowrap">
            <span className="material-symbols-outlined text-[15px] leading-none text-slate-400">schedule</span>
            <span>
              <strong className="text-black dark:text-[#F3F4F6]">{filteredTasks.length}</strong> {filteredTasks.length === 1 ? 'block' : 'blocks'} · <strong className="text-black dark:text-[#F3F4F6]">{totalWeeklyHours}</strong> hrs scheduled
            </span>
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
                      onOpenModal('task-chooser');
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <FabMenu onOpenModal={onOpenModal} />
      </div>
    </section>
  );
}
