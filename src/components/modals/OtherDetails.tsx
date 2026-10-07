import { useState, useEffect } from 'react';
import { Task, GoalItem } from '../../types';

interface OtherDetailsProps {
  task: Task;
  onClose: () => void;
  onEdit: () => void;
  onFinish: () => void;
  onUpdateTask?: (taskId: string, updatedFields: Partial<Task>) => void;
}

export function OtherDetails({
  task,
  onClose,
  onEdit,
  onFinish,
  onUpdateTask,
}: OtherDetailsProps) {
  const realGoals: GoalItem[] = task.details?.goals || [];
  const dynamicFields = task.fields || task.details?.fields || [];
  const canvasFields = task.canvasFields || task.details?.canvasFields || [];

  const [completedIds, setCompletedIds] = useState<(number | string)[]>(() => {
    return realGoals.filter((g) => g.checked).map((g) => g.id);
  });

  useEffect(() => {
    setCompletedIds((task.details?.goals || []).filter((g) => g.checked).map((g) => g.id));
  }, [task]);

  const toggleGoal = (id: number | string) => {
    const isCurrentlyCompleted = completedIds.includes(id);
    const nextCompleted = isCurrentlyCompleted
      ? completedIds.filter((item) => item !== id)
      : [...completedIds, id];

    setCompletedIds(nextCompleted);

    if (onUpdateTask && realGoals.length > 0) {
      const updatedGoals = realGoals.map((g) => ({
        ...g,
        checked: nextCompleted.includes(g.id),
      }));

      onUpdateTask(task.id, {
        details: {
          ...task.details,
          goals: updatedGoals,
        },
      });
    }
  };

  return (
    <div className="p-6 space-y-5 font-display">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-black px-2 py-0.5 bg-[#FEF08A] dark:bg-[#292312] text-slate-900 dark:text-[#FBBF24] border border-black dark:border-[#FBBF24] rounded uppercase">
            {task.details?.tag || task.subtitle || 'General'}
          </span>
        </div>
        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-[#F3F4F6]">
          {task.title}
        </h3>
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-bold text-slate-700 dark:text-[#9CA3AF]">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] leading-none">calendar_today</span>
            <span>{task.day}</span>
          </span>
          <span className="flex items-center gap-1 font-mono">
            <span className="material-symbols-outlined text-[14px] leading-none">timer</span>
            <span>
              {task.time} ({task.duration || '30 min'})
            </span>
          </span>
        </div>
      </div>

      {canvasFields.length > 0 ? (
        <div className="space-y-2">
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-[#F3F4F6]">
            Canvas Blocks ({canvasFields.length})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            {canvasFields
              .filter((cf) => cf.type !== 'checklist' && cf.type !== 'longText')
              .map((cf, idx) => (
                <div
                  key={cf.id || idx}
                  className={`${
                    cf.layoutSize === 'full-width' ? 'sm:col-span-12' : 'sm:col-span-6'
                  } p-2.5 bg-[#FCF9F8] dark:bg-[#1E232E] border-2 border-black dark:border-[#383F50] rounded-lg neo-box-sm flex items-center justify-between gap-2`}
                >
                  <span className="text-[10px] font-black uppercase text-slate-500 dark:text-[#9CA3AF]">
                    {cf.label}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-[#F3F4F6] font-sans text-right">
                    {String(cf.value ?? '')}
                  </span>
                </div>
              ))}
          </div>
        </div>
      ) : (
        dynamicFields.length > 0 && (
          <div className="space-y-2">
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-[#F3F4F6]">
              Structured Fields ({dynamicFields.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {dynamicFields.map((field, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-[#FCF9F8] dark:bg-[#1E232E] border-2 border-black dark:border-[#383F50] rounded-lg neo-box-sm flex items-center justify-between gap-2"
                >
                  <span className="text-[10px] font-black uppercase text-slate-500 dark:text-[#9CA3AF]">
                    {field.key}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-[#F3F4F6] font-sans text-right">
                    {field.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-[#F3F4F6]">
          <span>Checklist / Subtasks</span>
          <span className="text-[10px] text-slate-500 dark:text-[#9CA3AF] font-bold">
            {completedIds.length} of {realGoals.length} COMPLETED
          </span>
        </div>

        {realGoals.length === 0 ? (
          <div className="p-5 border-2 border-dashed border-slate-300 dark:border-[#383F50] rounded-lg text-center bg-slate-50 dark:bg-[#10141C] space-y-2">
            <p className="text-xs font-medium text-slate-500 dark:text-[#9CA3AF] font-sans">
              No action items or subtasks listed for this activity.
            </p>
            <button
              onClick={onEdit}
              className="text-xs font-bold text-amber-700 dark:text-[#FBBF24] underline hover:opacity-80 cursor-pointer"
            >
              + Click here to add subtasks
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {realGoals.map((goal, i) => {
              const isCompleted = completedIds.includes(goal.id);
              return (
                <div
                  key={goal.id || i}
                  onClick={() => toggleGoal(goal.id)}
                  className={`p-3 border-2 rounded-lg neo-box-sm flex items-center justify-between cursor-pointer transition-all duration-200 ${
                    isCompleted
                      ? 'bg-slate-100 dark:bg-[#10141C] border-slate-400 dark:border-[#383F50] opacity-70 scale-[0.99]'
                      : 'bg-[#FCF9F8] dark:bg-[#1E232E] border-black dark:border-[#383F50] hover:bg-white dark:hover:bg-[#292312]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 flex-1">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => {}}
                      className="w-4 h-4 border-2 border-black dark:border-[#FBBF24] rounded accent-amber-500 cursor-pointer flex-shrink-0"
                    />
                    <span
                      className={`text-xs font-bold transition-all ${
                        isCompleted
                          ? 'line-through text-slate-400 dark:text-[#64748B]'
                          : 'text-slate-900 dark:text-[#F3F4F6]'
                      }`}
                    >
                      {goal.text || `Item #${i + 1}`}
                    </span>
                  </div>
                  {isCompleted && (
                    <span className="text-[10px] font-bold bg-[#A7F3D0] dark:bg-[#0A291E] text-[#062E1E] dark:text-[#10B981] border border-black dark:border-[#10B981] px-1.5 py-0.5 rounded flex-shrink-0 ml-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] leading-none">check</span>
                      <span>Done</span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {task.details?.notes ? (
        <div className="p-3 bg-amber-50 dark:bg-[#292312] border-2 border-black dark:border-[#FBBF24] rounded-lg neo-box-sm space-y-1">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-900 dark:text-[#FBBF24] flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px] leading-none">notes</span>
            <span>Priority & Logistics Notes</span>
          </div>
          <p className="text-xs font-medium font-sans text-slate-700 dark:text-[#F3F4F6] leading-relaxed whitespace-pre-wrap">
            {task.details.notes}
          </p>
        </div>
      ) : (
        <div className="p-3 bg-slate-50 dark:bg-[#10141C] border-2 border-dashed border-slate-300 dark:border-[#383F50] rounded-lg text-slate-400 dark:text-[#64748B] text-xs font-sans">
          No additional priority or logistics notes logged.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-black dark:border-[#383F50]">
        <button
          onClick={onClose}
          className="px-3 py-2 bg-white dark:bg-[#1E232E] text-slate-900 dark:text-[#F3F4F6] border-2 border-black dark:border-[#383F50] rounded-lg font-bold text-xs hover:bg-slate-100 dark:hover:bg-[#10141C] neo-box-sm neo-btn cursor-pointer"
        >
          Close
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-white dark:bg-[#1E232E] hover:bg-slate-50 dark:hover:bg-[#292312] text-slate-900 dark:text-[#F3F4F6] border-2 border-black dark:border-[#383F50] rounded-lg font-black text-xs shadow-[2px_2px_0px_#000] neo-btn flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px] leading-none">edit</span>
            <span>Edit Activity</span>
          </button>
          <button
            onClick={onFinish}
            className="px-4 py-2 bg-[#34D399] hover:bg-[#10B981] text-[#062E1E] border-2 border-black rounded-lg font-black text-xs shadow-[3px_3px_0px_#000] neo-btn flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px] leading-none">check</span>
            <span>Finish Task</span>
          </button>
        </div>
      </div>
    </div>
  );
}
