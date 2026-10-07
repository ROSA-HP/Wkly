import { Task, DayOfWeek } from '../../types';
import { DayInfo } from '../../utils/dateUtils';

export type { DayInfo };

interface TaskCardProps {
  key?: string;
  task: Task;
  onClick: () => void;
}

const COLOR_NAME_THEMES: Record<string, { cardClasses: string; badgeClasses: string }> = {
  Pink: {
    cardClasses: 'bg-[#FFD1DC] border-black dark:bg-[#2A161D] dark:border-[#F472B6]',
    badgeClasses:
      'bg-white text-slate-900 border-black dark:bg-[#0B0D11] dark:text-[#F472B6] dark:border-[#F472B6]',
  },
  Blue: {
    cardClasses: 'bg-[#BAE6FD] border-black dark:bg-[#132637] dark:border-[#38BDF8]',
    badgeClasses:
      'bg-white text-slate-900 border-black dark:bg-[#0B0D11] dark:text-[#38BDF8] dark:border-[#38BDF8]',
  },
  Green: {
    cardClasses: 'bg-[#BBF7D0] border-black dark:bg-[#122A21] dark:border-[#4ADE80]',
    badgeClasses:
      'bg-white text-slate-900 border-black dark:bg-[#0B0D11] dark:text-[#4ADE80] dark:border-[#4ADE80]',
  },
  Yellow: {
    cardClasses: 'bg-[#FEF08A] border-black dark:bg-[#292312] dark:border-[#FBBF24]',
    badgeClasses:
      'bg-white text-slate-900 border-black dark:bg-[#0B0D11] dark:text-[#FBBF24] dark:border-[#FBBF24]',
  },
  Lavender: {
    cardClasses: 'bg-[#E9D5FF] border-black dark:bg-[#2E1850] dark:border-[#C084FC]',
    badgeClasses:
      'bg-white text-slate-900 border-black dark:bg-[#0B0D11] dark:text-[#C084FC] dark:border-[#C084FC]',
  },
  Peach: {
    cardClasses: 'bg-[#FED7AA] border-black dark:bg-[#2E190B] dark:border-[#FB923C]',
    badgeClasses:
      'bg-white text-slate-900 border-black dark:bg-[#0B0D11] dark:text-[#FB923C] dark:border-[#FB923C]',
  },
  Mint: {
    cardClasses: 'bg-[#A7F3D0] border-black dark:bg-[#122A21] dark:border-[#34D399]',
    badgeClasses:
      'bg-white text-slate-900 border-black dark:bg-[#0B0D11] dark:text-[#34D399] dark:border-[#34D399]',
  },
  Coral: {
    cardClasses: 'bg-[#FECDD3] border-black dark:bg-[#2A161D] dark:border-[#FB7185]',
    badgeClasses:
      'bg-white text-slate-900 border-black dark:bg-[#0B0D11] dark:text-[#FB7185] dark:border-[#FB7185]',
  },
  Lilac: {
    cardClasses: 'bg-[#F5D0FE] border-black dark:bg-[#2E1850] dark:border-[#E879F9]',
    badgeClasses:
      'bg-white text-slate-900 border-black dark:bg-[#0B0D11] dark:text-[#E879F9] dark:border-[#E879F9]',
  },
  'Soft Gray': {
    cardClasses: 'bg-[#E2E8F0] border-black dark:bg-[#1E232E] dark:border-[#94A3B8]',
    badgeClasses:
      'bg-white text-slate-900 border-black dark:bg-[#0B0D11] dark:text-[#94A3B8] dark:border-[#94A3B8]',
  },
};

function getCardThemeClasses(task: Task): {
  cardClasses: string;
  badgeClasses: string;
} {
  const explicitColor = task.color || task.details?.color;
  if (explicitColor && COLOR_NAME_THEMES[explicitColor]) {
    return COLOR_NAME_THEMES[explicitColor];
  }

  const tint = (task.colorTint || '').toLowerCase();

  // Check if task uses mint/recovery tint explicitly
  if (
    task.category === 'RECOVERY' ||
    tint.includes('dcfce7') ||
    tint.includes('bbf7d0') ||
    tint.includes('a7f3d0')
  ) {
    return COLOR_NAME_THEMES.Mint;
  }

  // Check if task uses lavender/purple tint explicitly
  if (tint.includes('ede9fe') || tint.includes('f3e8ff') || tint.includes('e9d5ff')) {
    return COLOR_NAME_THEMES.Lavender;
  }

  if (tint.includes('fed7aa')) {
    return COLOR_NAME_THEMES.Peach;
  }

  if (tint.includes('f5d0fe')) {
    return COLOR_NAME_THEMES.Lilac;
  }

  if (tint.includes('e2e8f0')) {
    return COLOR_NAME_THEMES['Soft Gray'];
  }

  if (task.category === 'TRAINING') {
    return COLOR_NAME_THEMES.Coral;
  }

  if (task.category === 'STUDYING') {
    return COLOR_NAME_THEMES.Blue;
  }

  // Default: OTHER / Prep -> Pale Amber in Light, #292312 with #FBBF24 2px border in Night
  return COLOR_NAME_THEMES.Yellow;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const { cardClasses, badgeClasses } = getCardThemeClasses(task);
  const rawDynamicFields = task.fields || task.details?.fields || [];
  const canvasFields = task.canvasFields || task.details?.canvasFields || [];
  const exercises = task.details?.exercises || [];

  // Avoid repeating Exercise/Weight/Sets/Reps as text lines when exercise drill pills are already rendered
  const dynamicFields =
    exercises.length > 0
      ? rawDynamicFields.filter(
          (f) => !['Exercise', 'Weight', 'Sets', 'Reps'].includes(String(f.key))
        )
      : rawDynamicFields;

  return (
    <div
      onClick={onClick}
      className={`p-2.5 ${cardClasses} border-2 rounded-lg shadow-[3px_3px_0px_#000] neo-btn cursor-pointer font-display flex flex-col gap-1.5 transition-colors min-w-0 overflow-hidden`}
    >
      <div className="flex items-center justify-between gap-1.5 mb-0.5 min-w-0">
        <span
          className={`px-1.5 py-0.5 border rounded uppercase tracking-wide text-[9px] font-black leading-tight truncate max-w-[58%] ${badgeClasses}`}
        >
          {canvasFields.length > 0 ? 'CANVAS' : task.category}
        </span>
        <span className="text-slate-700 dark:text-[#9CA3AF] font-mono text-[9.5px] font-bold whitespace-nowrap shrink-0">
          {task.time}
        </span>
      </div>

      <h4 className="font-extrabold text-xs leading-snug text-slate-900 dark:text-[#F3F4F6] break-words min-w-0">
        {task.title || task.taskName || task.fixedData?.taskName}
      </h4>

      {exercises.length > 0 && (
        <div className="mt-0.5 space-y-1 min-w-0">
          {exercises.slice(0, 2).map((ex, idx) => (
            <div
              key={ex.id || idx}
              className="px-2 py-1 bg-white/85 dark:bg-[#0B0D11]/85 border border-black dark:border-[#383F50] rounded text-[9px] font-sans min-w-0 overflow-hidden"
            >
              <div className="flex items-center justify-between gap-1.5 min-w-0">
                <span className="font-bold text-slate-900 dark:text-[#F3F4F6] truncate min-w-0 flex-1">
                  {ex.name || `Exercise ${idx + 1}`}
                </span>
                <span className="font-mono font-black text-slate-700 dark:text-[#FB7185] whitespace-nowrap shrink-0">
                  {ex.sets || 3}×{ex.reps || 10}
                </span>
              </div>
              {ex.weight && (
                <div className="text-[8px] font-mono font-semibold text-slate-500 dark:text-[#9CA3AF] truncate mt-0.5">
                  {ex.weight}
                </div>
              )}
            </div>
          ))}
          {exercises.length > 2 && (
            <div className="text-[9px] font-bold text-slate-700 dark:text-[#9CA3AF] truncate">
              +{exercises.length - 2} more drills
            </div>
          )}
        </div>
      )}

      {canvasFields.length > 0 ? (
        <div className="mt-0.5 space-y-1 text-[9px] font-sans min-w-0">
          {canvasFields.slice(0, 3).map((cf, idx) => {
            const displayVal = Array.isArray(cf.value)
              ? `${cf.value.length} items`
              : String(cf.value ?? '');
            return (
              <div
                key={cf.id || idx}
                className="px-1.5 py-1 bg-white/85 dark:bg-[#0B0D11]/85 border border-black/80 dark:border-[#383F50] rounded flex items-center justify-between gap-1.5 min-w-0 overflow-hidden"
              >
                <span className="font-bold text-slate-900 dark:text-[#F3F4F6] truncate min-w-0">
                  {cf.label}:
                </span>
                <span className="font-mono font-semibold text-slate-700 dark:text-[#9CA3AF] truncate shrink-0 max-w-[55%]">
                  {displayVal}
                </span>
              </div>
            );
          })}
          {canvasFields.length > 3 && (
            <div className="text-[9px] font-bold text-slate-700 dark:text-[#9CA3AF] truncate">
              +{canvasFields.length - 3} more blocks
            </div>
          )}
        </div>
      ) : dynamicFields.length > 0 ? (
        <div className="mt-0.5 space-y-0.5 text-[10px] font-sans text-slate-700 dark:text-[#9CA3AF] min-w-0">
          {dynamicFields.slice(0, 3).map((f, idx) => (
            <div key={idx} className="truncate min-w-0">
              <span className="font-bold text-slate-900 dark:text-[#F3F4F6]">{f.key}:</span>{' '}
              <span>{f.value}</span>
            </div>
          ))}
          {dynamicFields.length > 3 && (
            <div className="text-[9px] opacity-75 truncate">
              +{dynamicFields.length - 3} more fields
            </div>
          )}
        </div>
      ) : (
        exercises.length === 0 && (
          <p className="text-[10px] text-slate-600 dark:text-[#9CA3AF] font-medium font-sans mt-auto break-words line-clamp-2 min-w-0">
            {task.subtitle}
          </p>
        )
      )}
    </div>
  );
}


interface DayColumnProps {
  key?: string;
  day: DayInfo;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (day: DayOfWeek, dateStr: string) => void;
}

function getStartMinutes(task: Task): number {
  if (task.time) {
    const match = task.time.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
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

  const iso = task.date || task.details?.isoDate;
  if (iso) {
    const d = new Date(iso);
    if (!isNaN(d.getTime())) {
      return d.getUTCHours() * 60 + d.getUTCMinutes();
    }
  }

  return 9999;
}

export function DayColumn({ day, tasks, onTaskClick, onAddTask }: DayColumnProps) {
  const shortName = day.name.substring(0, 3).toUpperCase();
  const sortedTasks = [...tasks].sort((a, b) => getStartMinutes(a) - getStartMinutes(b));

  return (
    <div
      className={`rounded-xl p-3 flex flex-col justify-between transition-all min-w-0 overflow-hidden ${
        day.isToday
          ? 'today-canvas-grid border-2 border-[#8B5CF6] dark:border-[#A855F7] shadow-[4px_4px_0px_#121212] dark:shadow-[4px_4px_0px_#000000] relative ring-1 ring-[#8B5CF6]/30 dark:ring-[#A855F7]/30'
          : 'bg-white dark:bg-[#161922] border-2 border-black dark:border-[#383F50] shadow-[4px_4px_0px_#000]'
      }`}
    >
      <div className="min-w-0">
        <div
          className={`flex justify-between items-center pb-2.5 mb-3 font-display border-b-2 ${
            day.isToday
              ? 'border-[#8B5CF6]/25 dark:border-[#A855F7]/35'
              : 'border-black dark:border-[#383F50]'
          }`}
        >
          {day.isToday ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-[#8B5CF6] dark:text-[#C084FC] tracking-wider">
                  {shortName}
                </span>
                <span className="w-2 h-2 rounded-full bg-[#8B5CF6] dark:bg-[#A855F7] animate-pulse"></span>
              </div>
              <span className="text-xs font-black bg-[#8B5CF6] dark:bg-[#A855F7] text-white dark:text-[#0B0D11] px-2.5 py-0.5 rounded-md border-2 border-black dark:border-white shadow-[2px_2px_0px_#000]">
                {day.date} TODAY
              </span>
            </>
          ) : (
            <>
              <span className="text-xs font-extrabold text-slate-500 dark:text-[#9CA3AF] tracking-wider">
                {shortName}
              </span>
              <span className="text-lg font-black text-slate-900 dark:text-[#F3F4F6]">
                {day.date}
              </span>
            </>
          )}
        </div>

        <div className="space-y-2.5">
          {sortedTasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}

          <button
            onClick={() => onAddTask(day.name, day.dateStr)}
            className={`w-full py-2 border-2 border-dashed rounded-lg text-[10px] font-display font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              day.isToday
                ? 'border-[#8B5CF6] dark:border-[#A855F7] bg-white/75 dark:bg-[#1A1E2F]/80 backdrop-blur-xs text-[#8B5CF6] dark:text-[#C084FC] hover:bg-[#8B5CF6]/10 dark:hover:bg-[#A855F7]/20 shadow-xs'
                : 'border-black dark:border-[#383F50] text-slate-500 dark:text-[#9CA3AF] hover:text-black dark:hover:text-[#F3F4F6] hover:bg-slate-50 dark:hover:bg-[#1E232E]'
            }`}
          >
            <span className="material-symbols-outlined text-[14px] leading-none">add</span>
            <span>ADD TASK</span>
          </button>
        </div>
      </div>

      <div
        className={`pt-3 mt-4 border-t-2 text-[10px] text-center font-display font-black tracking-wider uppercase ${
          day.isToday
            ? 'border-[#8B5CF6]/20 dark:border-[#A855F7]/30 text-[#8B5CF6] dark:text-[#C084FC]'
            : 'border-slate-100 dark:border-[#1E232E] text-slate-400 dark:text-[#64748B]'
        }`}
      >
        {tasks.length} {tasks.length === 1 ? 'ACTIVITY' : 'ACTIVITIES'}
      </div>
    </div>
  );
}
