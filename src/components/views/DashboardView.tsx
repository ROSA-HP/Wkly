import { useState } from 'react';
import { Task, DayOfWeek, ModalState, TaskCategory } from '../../types';
import { DayColumn } from '../dashboard/DayColumn';
import { FabMenu } from '../dashboard/FabMenu';

interface DashboardViewProps {
  tasks: Task[];
  onOpenModal: (modal: ModalState) => void;
  onTaskClick: (task: Task) => void;
  onAddTaskDay?: (day: DayOfWeek) => void;
}

const WEEK_DAYS: { name: DayOfWeek; date: number; isToday?: boolean }[] = [
  { name: 'Monday', date: 14 },
  { name: 'Tuesday', date: 15, isToday: true },
  { name: 'Wednesday', date: 16 },
  { name: 'Thursday', date: 17 },
  { name: 'Friday', date: 18 },
  { name: 'Saturday', date: 19 },
  { name: 'Sunday', date: 20 },
];

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

  const filteredTasks =
    selectedCategory === 'ALL'
      ? tasks
      : tasks.filter((t) => t.category === selectedCategory);

  const getTasksForDay = (dayName: DayOfWeek) =>
    filteredTasks
      .filter((task) => task.day === dayName)
      .slice()
      .sort((a, b) => parseTimeToMinutes(a.time, a.date) - parseTimeToMinutes(b.time, b.date));

  const trainingCount = tasks.filter((task) => task.category === 'TRAINING').length;
  const studyCount = tasks.filter((task) => task.category === 'STUDYING').length;
  const otherCount = tasks.filter((task) => task.category === 'OTHER').length;

  return (
    <section className="flex-1 flex flex-col relative min-h-screen bg-[#FCF9F8] dark:bg-[#0B0D11] transition-colors duration-200 animate-in fade-in">
      {/* Top App Navigation / Status Bar */}
      <div className="bg-white dark:bg-[#161922] border-b-2 border-black dark:border-[#383F50] px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 font-display transition-colors">
        <div className="flex items-center gap-4">
          <h2 className="text-lg md:text-xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-[#F3F4F6]">
            Rosa's Weekly Plan
          </h2>
          <div className="flex items-center border-2 border-black dark:border-[#383F50] rounded overflow-hidden shadow-[2px_2px_0px_#000] text-xs font-bold">
            <button className="px-2 py-1 bg-white dark:bg-[#1E232E] hover:bg-slate-100 dark:hover:bg-[#2E1850] text-slate-900 dark:text-[#F3F4F6] border-r border-black dark:border-[#383F50]">
              ‹
            </button>
            <span className="px-3 py-1 bg-white dark:bg-[#161922] text-slate-900 dark:text-[#F3F4F6]">
              SEP 14 – SEP 20, 2026
            </span>
            <button className="px-2 py-1 bg-white dark:bg-[#1E232E] hover:bg-slate-100 dark:hover:bg-[#2E1850] text-slate-900 dark:text-[#F3F4F6] border-l border-black dark:border-[#383F50]">
              ›
            </button>
          </div>
        </div>

        {/* Streak & CNS Readiness Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* CNS Ready Badge: #10B981 (Emerald) on #0A291E */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#A7F3D0] dark:bg-[#0A291E] text-emerald-950 dark:text-[#10B981] border-2 border-black dark:border-[#10B981] rounded-lg font-bold text-xs shadow-[2px_2px_0px_#000] hover:scale-105 transition-transform cursor-default">
            <span className="animate-pulse">⚡</span>
            <span>CNS READY 94%</span>
          </div>

          {/* Streak (Fire) Badge: #F97316 (Neon Orange) on #2E190B */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-100 dark:bg-[#2E190B] text-orange-950 dark:text-[#F97316] border-2 border-black dark:border-[#F97316] rounded-lg font-bold text-xs shadow-[2px_2px_0px_#000] hover:scale-105 transition-transform cursor-default">
            <span>🔥</span>
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
            ALL CATEGORIES ({tasks.length})
          </button>
          <button
            onClick={() => setSelectedCategory('TRAINING')}
            className={`px-3 py-1 border-2 rounded shadow-[2px_2px_0px_#000] whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'TRAINING'
                ? 'bg-[#FFE4E6] dark:bg-[#2A161D] text-slate-900 dark:text-[#FB7185] border-black dark:border-[#FB7185] font-black'
                : 'bg-white dark:bg-[#161922] text-slate-800 dark:text-[#F3F4F6] border-black dark:border-[#383F50] hover:bg-slate-50 dark:hover:bg-[#2A161D]'
            }`}
          >
            🏋️ TRAINING ({trainingCount})
          </button>
          <button
            onClick={() => setSelectedCategory('STUDYING')}
            className={`px-3 py-1 border-2 rounded shadow-[2px_2px_0px_#000] whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'STUDYING'
                ? 'bg-[#BAE6FD] dark:bg-[#132637] text-slate-900 dark:text-[#38BDF8] border-black dark:border-[#38BDF8] font-black'
                : 'bg-white dark:bg-[#161922] text-slate-800 dark:text-[#F3F4F6] border-black dark:border-[#383F50] hover:bg-slate-50 dark:hover:bg-[#132637]'
            }`}
          >
            📖 STUDYING ({studyCount})
          </button>
          <button
            onClick={() => setSelectedCategory('OTHER')}
            className={`px-3 py-1 border-2 rounded shadow-[2px_2px_0px_#000] whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'OTHER'
                ? 'bg-[#FEF08A] dark:bg-[#292312] text-slate-900 dark:text-[#FBBF24] border-black dark:border-[#FBBF24] font-black'
                : 'bg-white dark:bg-[#161922] text-slate-800 dark:text-[#F3F4F6] border-black dark:border-[#383F50] hover:bg-slate-50 dark:hover:bg-[#292312]'
            }`}
          >
            ⚙️ OTHER ({otherCount})
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-slate-600 dark:text-[#9CA3AF] font-semibold whitespace-nowrap">
            <span className="font-bold text-black dark:text-[#F3F4F6]">{filteredTasks.length}</span>{' '}
            scheduled sessions
          </div>
          <button
            onClick={() => onOpenModal('task-chooser')}
            className="px-3.5 py-1.5 bg-[#8B5CF6] dark:bg-[#A855F7] hover:bg-[#7c3aed] dark:hover:bg-[#C084FC] text-white dark:text-[#0B0D11] border-2 border-black dark:border-white rounded-lg shadow-[2px_2px_0px_#000] neo-btn font-black text-xs cursor-pointer whitespace-nowrap"
          >
            + Add Activity (Wkly)
          </button>
        </div>
      </div>

      {/* 7-Day Grid */}
      <div className="flex-1 p-6 overflow-x-auto scrollbar-custom">
        <div className="grid grid-cols-7 gap-4 min-w-[1220px] items-stretch pb-24">
          {WEEK_DAYS.map((day, idx) => (
            <div
              key={day.name}
              style={{ animationDelay: `${idx * 60}ms` }}
              className="animate-in fade-in slide-in-from-bottom-3 duration-300 fill-mode-both"
            >
              <DayColumn
                day={day}
                tasks={getTasksForDay(day.name)}
                onTaskClick={onTaskClick}
                onAddTask={(dayName) => {
                  if (onAddTaskDay) {
                    onAddTaskDay(dayName);
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
    </section>
  );
}
