import { useState, useMemo, useEffect } from 'react';
import { Task, DayOfWeek, TaskCategory } from '../../types';
import {
  DayInfo,
  extractTaskYmd,
  getWeekNumber,
  extractExercises,
} from '../../utils/dateUtils';

interface MobileDashboardViewProps {
  tasks: Task[];
  weekDays: DayInfo[];
  weekOffset: number;
  onSetWeekOffset: (fn: (prev: number) => number) => void;
  onResetWeekOffset: () => void;
  selectedCategory: 'ALL' | TaskCategory;
  onSelectCategory: (cat: 'ALL' | TaskCategory) => void;
  onTaskClick: (task: Task) => void;
  onAddTaskDay?: (day: DayOfWeek, dateStr: string) => void;
  onUpdateTask?: (taskId: string, updatedFields: Partial<Task>) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
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

function parseDurationHours(durationStr?: string): number {
  if (!durationStr) return 1.0;
  const matchMin = durationStr.match(/(\d+)\s*m/i);
  if (matchMin) return parseInt(matchMin[1], 10) / 60;
  const matchHr = durationStr.match(/(\d+(?:\.\d+)?)\s*h/i);
  if (matchHr) return parseFloat(matchHr[1]);
  const num = parseInt(durationStr, 10);
  return isNaN(num) ? 1.0 : num / 60;
}

function getTaskAuraColor(task: Task): string {
  if (task.color) {
    const map: Record<string, string> = {
      Mint: '#86efac',
      Lavender: '#d8b4fe',
      Sky: '#7dd3fc',
      Lemon: '#fef08a',
      Pink: '#fca5a5',
      Peach: '#fed7aa',
      Teal: '#99f6e4',
      Slate: '#e2e8f0',
    };
    if (map[task.color]) return map[task.color];
  }

  switch (task.category) {
    case 'TRAINING':
      return '#86efac'; // Soft Mint
    case 'STUDYING':
      return '#7dd3fc'; // Soft Sky Blue
    case 'RECOVERY':
      return '#99f6e4'; // Teal
    case 'OTHER':
    default:
      return '#d8b4fe'; // Soft Lavender
  }
}

export function MobileDashboardView({
  tasks,
  weekDays,
  weekOffset,
  onSetWeekOffset,
  onResetWeekOffset,
  selectedCategory,
  onSelectCategory,
  onTaskClick,
  onAddTaskDay,
  onUpdateTask,
  isDarkMode,
  onToggleDarkMode,
}: MobileDashboardViewProps) {
  // Find today's index in weekDays or default to Monday (0)
  const initialIndex = useMemo(() => {
    const idx = weekDays.findIndex((d) => d.isToday);
    return idx !== -1 ? idx : 0;
  }, [weekDays]);

  const [activeDayIndex, setActiveDayIndex] = useState<number>(initialIndex);

  // Sync index if week changes
  useEffect(() => {
    const idx = weekDays.findIndex((d) => d.isToday);
    if (weekOffset === 0 && idx !== -1) {
      setActiveDayIndex(idx);
    } else if (activeDayIndex >= weekDays.length) {
      setActiveDayIndex(0);
    }
  }, [weekDays, weekOffset]);

  const activeDay = weekDays[activeDayIndex] || weekDays[0];

  // Filter tasks for active week
  const currentWeekDateStrs = useMemo(
    () => new Set(weekDays.map((d) => d.dateStr)),
    [weekDays]
  );

  const activeWeekTasks = useMemo(() => {
    return tasks.filter((task) => {
      const taskYmd = extractTaskYmd(task);
      if (taskYmd) {
        return currentWeekDateStrs.has(taskYmd);
      }
      return weekOffset === 0;
    });
  }, [tasks, currentWeekDateStrs, weekOffset]);

  // Tasks for the active selected day
  const dayTasks = useMemo(() => {
    return activeWeekTasks
      .filter((task) => {
        const matchesCategory =
          selectedCategory === 'ALL' || task.category === selectedCategory;
        if (!matchesCategory) return false;

        const taskYmd = extractTaskYmd(task);
        if (taskYmd) {
          return taskYmd === activeDay?.dateStr;
        }
        return weekOffset === 0 && task.day === activeDay?.name;
      })
      .slice()
      .sort((a, b) => parseTimeToMinutes(a.time, a.date) - parseTimeToMinutes(b.time, b.date));
  }, [activeWeekTasks, activeDay, selectedCategory, weekOffset]);

  // Calculate total hours scheduled for this day
  const totalHours = useMemo(() => {
    const hrs = dayTasks.reduce((acc, t) => acc + parseDurationHours(t.duration), 0);
    return Math.round(hrs * 10) / 10;
  }, [dayTasks]);

  // Dynamic CNS Readiness percentage derived from completed vs scheduled workload
  const readiness = useMemo(() => {
    if (dayTasks.length === 0) return 'Rest Day';
    const completedCount = dayTasks.filter((t) => t.completed).length;
    const ratio = completedCount / dayTasks.length;
    if (ratio === 1) return '100% Peak';
    const base = 85 + Math.round(ratio * 12);
    return `${base}% Ready`;
  }, [dayTasks]);

  const currentWeekNumber = useMemo(() => {
    return getWeekNumber(activeDay?.dateStr);
  }, [activeDay]);

  const handleToggleTask = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    if (onUpdateTask) {
      onUpdateTask(task.id, { completed: !task.completed });
    }
  };

  const handleAddNew = () => {
    if (onAddTaskDay && activeDay) {
      onAddTaskDay(activeDay.name, activeDay.dateStr);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#fcf9f8] dark:bg-[#121620] flex flex-col relative transition-colors font-display">
      {/* Top App Bar Navigation */}
      <header className="px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between border-b-2 border-black dark:border-[#383F50] bg-white dark:bg-[#161922] transition-colors gap-2">
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            <div className="w-7 h-7 bg-[#d8b4fe] dark:bg-[#7c3aed] text-black dark:text-white brutal-border brutal-shadow-sm flex items-center justify-center font-black text-sm">
              W
            </div>
            <span className="font-extrabold tracking-tight text-base sm:text-lg text-slate-900 dark:text-[#F3F4F6]">
              Wkly
            </span>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Week navigation chevron buttons */}
            <div className="flex items-center brutal-border brutal-shadow-sm rounded overflow-hidden bg-[#f6f3f2] dark:bg-[#1E232E]">
              <button
                type="button"
                onClick={() => onSetWeekOffset((prev) => prev - 1)}
                title="Previous Week"
                className="px-1.5 py-0.5 text-xs font-black text-slate-700 dark:text-[#E5E7EB] hover:bg-slate-200 dark:hover:bg-[#2A3346] border-r border-black dark:border-[#383F50] brutal-pressed cursor-pointer"
              >
                ◀
              </button>
              <div className="text-[10px] sm:text-[11px] font-black px-1.5 sm:px-2 py-0.5 text-slate-900 dark:text-[#F3F4F6] whitespace-nowrap">
                Week {currentWeekNumber}
              </div>
              <button
                type="button"
                onClick={() => onSetWeekOffset((prev) => prev + 1)}
                title="Next Week"
                className="px-1.5 py-0.5 text-xs font-black text-slate-700 dark:text-[#E5E7EB] hover:bg-slate-200 dark:hover:bg-[#2A3346] border-l border-black dark:border-[#383F50] brutal-pressed cursor-pointer"
              >
                ▶
              </button>
            </div>

            {/* Reset / Current Day Button */}
            <button
              type="button"
              onClick={onResetWeekOffset}
              title="Reset to Current Week & Today"
              className="w-7 h-7 bg-white dark:bg-[#1E232E] text-slate-900 dark:text-[#F3F4F6] brutal-border brutal-shadow-sm flex items-center justify-center font-bold text-xs brutal-pressed cursor-pointer"
            >
              ↻
            </button>

            {/* Dark Mode Toggle for Mobile */}
            {onToggleDarkMode && (
              <button
                type="button"
                onClick={onToggleDarkMode}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Night Mode'}
                className="w-7 h-7 bg-white dark:bg-[#1E232E] text-slate-900 dark:text-[#F3F4F6] brutal-border brutal-shadow-sm flex items-center justify-center font-bold text-xs brutal-pressed cursor-pointer"
              >
                {isDarkMode ? '☀' : '☾'}
              </button>
            )}
          </div>
        </header>

        {/* The 'Small' Core: Day Button Strip Navigation */}
        <nav className="px-2 sm:px-3 py-2 sm:py-3 border-b-2 border-black dark:border-[#383F50] bg-[#fcf9f8] dark:bg-[#1E232E] w-full transition-colors">
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 w-full max-w-full" id="day-strip">
            {weekDays.map((d, idx) => {
              const isActive = idx === activeDayIndex;
              const shortName = d.name.slice(0, 3).toUpperCase();
              return (
                <button
                  key={`${d.name}-${d.dateStr}`}
                  type="button"
                  onClick={() => setActiveDayIndex(idx)}
                  className={`flex flex-col items-center justify-center w-full py-1 sm:py-1.5 px-0.5 brutal-border brutal-pressed transition-all cursor-pointer min-w-0 overflow-hidden ${
                    isActive
                      ? 'bg-[#7dd3fc] dark:bg-[#0284c7] text-slate-950 dark:text-white brutal-shadow font-extrabold translate-y-[-1px]'
                      : 'bg-white dark:bg-[#161922] text-slate-800 dark:text-[#D1D5DB] brutal-shadow-sm font-semibold opacity-90 hover:opacity-100'
                  }`}
                >
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-neutral-600 dark:text-[#9CA3AF] truncate">
                    {shortName}
                  </span>
                  <span className="text-xs sm:text-sm font-black flex items-center gap-0.5">
                    {d.date}
                    {d.isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] dark:bg-[#C084FC]"></span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Category Filter Pills for Mobile */}
        <div className="px-3 sm:px-4 py-2 border-b border-black/10 dark:border-white/10 bg-[#F6F3F2] dark:bg-[#161922] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(['ALL', 'TRAINING', 'STUDYING', 'OTHER'] as const).map((cat) => {
            const isCatActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`px-2.5 py-1 text-[10px] font-black uppercase rounded brutal-border transition-all whitespace-nowrap cursor-pointer ${
                  isCatActive
                    ? 'bg-[#8B5CF6] dark:bg-[#A855F7] text-white dark:text-[#0B0D11] brutal-shadow-sm'
                    : 'bg-white dark:bg-[#1E232E] text-slate-800 dark:text-[#E5E7EB] hover:bg-slate-100'
                }`}
              >
                {cat === 'ALL' ? 'ALL CATEGORIES' : cat}
              </button>
            );
          })}
        </div>

        {/* Main Daily Task Canvas Zone */}
        <main className="flex-1 px-3 sm:px-4 py-3 sm:py-3.5 space-y-3.5 overflow-y-auto pb-24 scrollbar-custom">
          {/* Day Header & Workload Stat */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="min-w-0">
              <h2 id="active-day-heading" className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-[#F3F4F6] truncate">
                {activeDay?.name}, {activeDay?.monthShort} {activeDay?.date}
              </h2>
              <p id="active-day-sub" className="text-[11px] font-bold text-neutral-500 dark:text-[#9CA3AF]">
                {dayTasks.length} {dayTasks.length === 1 ? 'Session' : 'Sessions'} • {totalHours} hrs total
              </p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={handleAddNew}
                className="text-[11px] font-black uppercase px-2 sm:px-2.5 py-1 bg-[#d8b4fe] dark:bg-[#7c3aed] text-black dark:text-white brutal-border brutal-shadow-sm brutal-pressed flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <span>+</span>
                <span>Add Task</span>
              </button>
              <span
                id="active-cns-badge"
                className="px-2 sm:px-2.5 py-1 text-[10px] font-extrabold tracking-wide uppercase bg-[#86efac] dark:bg-[#0A291E] text-emerald-950 dark:text-[#10B981] brutal-border brutal-shadow-sm whitespace-nowrap"
              >
                ⚡ {readiness}
              </span>
            </div>
          </div>

          {/* Task List Container */}
          <div id="tasks-container" className="space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
            {dayTasks.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#161922] brutal-border brutal-shadow-sm md:col-span-2 space-y-2">
                <p className="text-sm font-bold text-neutral-500 dark:text-[#9CA3AF]">
                  No scheduled sessions for {activeDay?.name}.
                </p>
                <button
                  type="button"
                  onClick={handleAddNew}
                  className="mt-2 text-xs font-extrabold px-3.5 py-1.5 bg-[#d8b4fe] dark:bg-[#7c3aed] text-black dark:text-white brutal-border brutal-shadow-sm brutal-pressed cursor-pointer"
                >
                  + Add First Block
                </button>
              </div>
            ) : (
              dayTasks.map((t) => {
                const auraColor = getTaskAuraColor(t);
                const drills = extractExercises(t);
                const rawDynamic = t.fields || t.details?.fields || [];
                const canvasFields = t.canvasFields || t.details?.canvasFields || [];

                // Generate chips matching the Stitch aesthetic
                const chips: string[] = [];
                if (drills.length > 0) {
                  chips.push(`${drills.length} Drills`);
                  if (drills[0]?.sets && drills[0]?.reps) {
                    chips.push(`${drills[0].sets} × ${drills[0].reps}`);
                  }
                  if (drills[0]?.weight) {
                    chips.push(String(drills[0].weight));
                  }
                }
                if (t.category === 'STUDYING' && t.details?.studyType) {
                  chips.push(t.details.studyType);
                }
                if (canvasFields.length > 0) {
                  canvasFields.slice(0, 2).forEach((cf) => {
                    if (cf && cf.label) chips.push(cf.label);
                  });
                } else if (rawDynamic.length > 0) {
                  rawDynamic.slice(0, 2).forEach((f) => {
                    if (f && f.key) chips.push(`${f.key}: ${f.value}`);
                  });
                }
                if (t.details?.tag) {
                  chips.push(t.details.tag);
                }

                return (
                  <div
                    key={t.id}
                    onClick={() => onTaskClick(t)}
                    style={{ borderLeft: `8px solid ${auraColor}` }}
                    className="p-3.5 bg-white dark:bg-[#161922] brutal-border brutal-shadow flex flex-col space-y-2 cursor-pointer transition-all hover:translate-x-0.5 hover:translate-y-0.5 relative group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full brutal-border shrink-0"
                          style={{ backgroundColor: auraColor }}
                        ></span>
                        <h3
                          className={`font-bold text-xs tracking-tight truncate ${
                            t.completed
                              ? 'line-through text-neutral-400 dark:text-neutral-500'
                              : 'text-slate-900 dark:text-[#F3F4F6]'
                          }`}
                        >
                          {t.title || t.taskName}
                        </h3>
                      </div>

                      {/* Interactive Brutalist Checkbox Button */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleTask(e, t)}
                        title={t.completed ? 'Mark incomplete' : 'Mark complete'}
                        className={`w-5 h-5 bg-white dark:bg-[#10141C] brutal-border flex items-center justify-center text-xs font-black brutal-pressed shrink-0 cursor-pointer ${
                          t.completed ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' : ''
                        }`}
                      >
                        {t.completed ? '✓' : ''}
                      </button>
                    </div>

                    {/* Time & Duration row */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-extrabold text-neutral-500 dark:text-[#9CA3AF]">
                      <span className="px-1.5 py-0.5 bg-[#fcf9f8] dark:bg-[#10141C] brutal-border text-slate-800 dark:text-[#E5E7EB]">
                        ⏱ {t.time}
                      </span>
                      <span className="px-1.5 py-0.5 bg-[#fcf9f8] dark:bg-[#10141C] brutal-border text-slate-800 dark:text-[#E5E7EB]">
                        {t.duration || '60m'}
                      </span>
                      <span className="px-1.5 py-0.5 uppercase tracking-wider text-[9px] bg-slate-100 dark:bg-[#1E232E] text-slate-700 dark:text-[#9CA3AF] border border-black/20 dark:border-white/20">
                        {t.category}
                      </span>
                    </div>

                    {/* Tags row */}
                    {chips.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {chips.map((chip, cIdx) => (
                          <span
                            key={cIdx}
                            className="text-[10px] font-bold px-1.5 py-0.5 bg-[#f6f3f2] dark:bg-[#1E232E] text-slate-800 dark:text-[#E5E7EB] brutal-border"
                          >
                            {chip}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Cognitive Quarantine Motivation Micro-Card */}
          <div className="p-3 bg-[#f6f3f2] dark:bg-[#1E232E] brutal-border border-dashed text-[11px] font-semibold text-neutral-600 dark:text-[#9CA3AF] flex items-center justify-between">
            <span>✨ Focus on today. 0 forward drag.</span>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 bg-white dark:bg-[#10141C] text-slate-900 dark:text-[#F3F4F6] brutal-border">
              Wkly OS
            </span>
          </div>
        </main>

        {/* Floating Action Button (+ New) */}
        <div className="fixed bottom-6 right-6 z-30">
          <button
            type="button"
            onClick={handleAddNew}
            aria-label="Add new task"
            className="px-5 py-3.5 bg-[#d8b4fe] hover:bg-[#c084fc] dark:bg-[#8b5cf6] dark:hover:bg-[#7c3aed] text-black dark:text-white brutal-border-3 brutal-shadow-lg font-black text-base md:text-lg flex items-center justify-center gap-1.5 brutal-pressed cursor-pointer rounded-xl"
          >
            <span className="text-xl leading-none">+</span>
            <span>New</span>
          </button>
        </div>
      </div>
  );
}
