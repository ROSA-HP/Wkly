import { useState, useEffect } from 'react';
import { Task, GoalItem } from '../../types';

interface StudyDetailsProps {
  task: Task;
  onClose: () => void;
  onEdit: () => void;
  onFinish: () => void;
  onUpdateTask?: (taskId: string, updatedFields: Partial<Task>) => void;
}

export function StudyDetails({
  task,
  onClose,
  onEdit,
  onFinish,
  onUpdateTask,
}: StudyDetailsProps) {
  const realGoals: GoalItem[] = task.details?.goals || [];
  const dynamicFields = task.fields || task.details?.fields || [];

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
        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-[#F3F4F6]">
          {task.title}
        </h3>
        {task.details?.studyType && (
          <p className="text-xs font-bold text-[#006577] dark:text-[#38BDF8] mt-0.5">
            {task.details.studyType}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-bold text-slate-700 dark:text-[#9CA3AF]">
          <span className="flex items-center gap-1">
            📅 <span>{task.day}</span>
          </span>
          <span className="flex items-center gap-1 font-mono">
            ⏱️{' '}
            <span>
              {task.time} ({task.duration || '90 min'})
            </span>
          </span>
          <span className="flex items-center gap-1 text-[#008096] dark:text-[#38BDF8]">
            <span>🏷️</span> <span>{task.subtitle || 'Study Block'}</span>
          </span>
        </div>
      </div>

      {dynamicFields.length > 0 && (
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
      )}

      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-[#F3F4F6]">
          <span>Checklist & Deliverables</span>
          <span className="text-[10px] text-slate-500 dark:text-[#9CA3AF] font-bold">
            {completedIds.length} of {realGoals.length} COMPLETED
          </span>
        </div>

        {realGoals.length === 0 ? (
          <div className="p-5 border-2 border-dashed border-slate-300 dark:border-[#383F50] rounded-lg text-center bg-slate-50 dark:bg-[#10141C] space-y-2">
            <p className="text-xs font-medium text-slate-500 dark:text-[#9CA3AF] font-sans">
              No checklist deliverables added for this study session.
            </p>
            <button
              onClick={onEdit}
              className="text-xs font-bold text-[#008096] dark:text-[#38BDF8] underline hover:opacity-80 cursor-pointer"
            >
              + Click here to add focus goals & assignments
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
                      : 'bg-[#FCF9F8] dark:bg-[#1E232E] border-black dark:border-[#383F50] hover:bg-white dark:hover:bg-[#132637]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 flex-1">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => {}}
                      className="w-4 h-4 border-2 border-black dark:border-[#38BDF8] rounded accent-[#008096] dark:accent-[#38BDF8] cursor-pointer flex-shrink-0"
                    />
                    <span
                      className={`text-xs font-bold transition-all ${
                        isCompleted
                          ? 'line-through text-slate-400 dark:text-[#64748B]'
                          : 'text-slate-900 dark:text-[#F3F4F6]'
                      }`}
                    >
                      {goal.text || `Deliverable #${i + 1}`}
                    </span>
                  </div>
                  {isCompleted && (
                    <span className="text-[10px] font-bold bg-[#A7F3D0] dark:bg-[#0A291E] text-[#062E1E] dark:text-[#10B981] border border-black dark:border-[#10B981] px-1.5 py-0.5 rounded flex-shrink-0 ml-2">
                      Done ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {task.details?.notes ? (
        <div className="p-3 bg-blue-50 dark:bg-[#132637] border-2 border-black dark:border-[#38BDF8] rounded-lg neo-box-sm space-y-1">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-900 dark:text-[#38BDF8] flex items-center gap-1">
            <span>🏛️</span> Professor Cue & Syllabus Note
          </div>
          <p className="text-xs font-medium font-sans text-slate-700 dark:text-[#F3F4F6] leading-relaxed whitespace-pre-wrap">
            {task.details.notes}
          </p>
        </div>
      ) : (
        <div className="p-3 bg-slate-50 dark:bg-[#10141C] border-2 border-dashed border-slate-300 dark:border-[#383F50] rounded-lg text-slate-400 dark:text-[#64748B] text-xs font-sans">
          No syllabus notes attached to this study block.
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
            className="px-4 py-2 bg-white dark:bg-[#1E232E] hover:bg-slate-50 dark:hover:bg-[#132637] text-slate-900 dark:text-[#F3F4F6] border-2 border-black dark:border-[#383F50] rounded-lg font-black text-xs shadow-[2px_2px_0px_#000] neo-btn flex items-center gap-1.5 cursor-pointer"
          >
            <span>✎</span>
            <span>Edit Study Block</span>
          </button>
          <button
            onClick={onFinish}
            className="px-4 py-2 bg-[#34D399] hover:bg-[#10B981] text-[#062E1E] border-2 border-black rounded-lg font-black text-xs shadow-[3px_3px_0px_#000] neo-btn flex items-center gap-1.5 cursor-pointer"
          >
            <span>✓</span>
            <span>Finish Task</span>
          </button>
        </div>
      </div>
    </div>
  );
}
