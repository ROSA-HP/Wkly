import { useState, useEffect } from 'react';
import { Task, ExerciseItem } from '../../types';

interface TrainingDetailsProps {
  task: Task;
  onClose: () => void;
  onEdit: () => void;
  onFinish: () => void;
  onUpdateTask?: (taskId: string, updatedFields: Partial<Task>) => void;
}

export function TrainingDetails({
  task,
  onClose,
  onEdit,
  onFinish,
  onUpdateTask,
}: TrainingDetailsProps) {
  const realExercises: ExerciseItem[] = task.details?.exercises || [];
  const dynamicFields = task.fields || task.details?.fields || [];

  const [completedIds, setCompletedIds] = useState<(number | string)[]>(() => {
    return realExercises.filter((ex) => ex.completed).map((ex) => ex.id);
  });

  useEffect(() => {
    setCompletedIds((task.details?.exercises || []).filter((ex) => ex.completed).map((ex) => ex.id));
  }, [task]);

  const toggleExercise = (id: number | string) => {
    const isCurrentlyCompleted = completedIds.includes(id);
    const nextCompleted = isCurrentlyCompleted
      ? completedIds.filter((item) => item !== id)
      : [...completedIds, id];

    setCompletedIds(nextCompleted);

    if (onUpdateTask && realExercises.length > 0) {
      const updatedExercises = realExercises.map((ex) => ({
        ...ex,
        completed: nextCompleted.includes(ex.id),
      }));

      onUpdateTask(task.id, {
        details: {
          ...task.details,
          exercises: updatedExercises,
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
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-bold text-slate-700 dark:text-[#9CA3AF]">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] leading-none">calendar_today</span>
            <span>{task.day}</span>
          </span>
          <span className="flex items-center gap-1 font-mono">
            <span className="material-symbols-outlined text-[14px] leading-none">timer</span>
            <span>
              {task.time} ({task.duration || '60 min'})
            </span>
          </span>
          <span className="flex items-center gap-1 text-[#8b5cf6] dark:text-[#FB7185]">
            <span className="material-symbols-outlined text-[14px] leading-none">label</span>
            <span>{task.subtitle || 'Training Session'}</span>
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
          <span>Session Exercise Checklist</span>
          <span className="text-[10px] text-slate-500 dark:text-[#9CA3AF] font-bold">
            {completedIds.length} of {realExercises.length} COMPLETED
          </span>
        </div>

        {realExercises.length === 0 ? (
          <div className="p-5 border-2 border-dashed border-slate-300 dark:border-[#383F50] rounded-lg text-center bg-slate-50 dark:bg-[#10141C] space-y-2">
            <p className="text-xs font-medium text-slate-500 dark:text-[#9CA3AF] font-sans">
              No exercise drills logged for this session yet.
            </p>
            <button
              onClick={onEdit}
              className="text-xs font-bold text-[#8b5cf6] dark:text-[#FB7185] underline hover:opacity-80 cursor-pointer"
            >
              + Click here to add drills and sets
            </button>
          </div>
        ) : (
          realExercises.map((ex, i) => {
            const isCompleted = completedIds.includes(ex.id);
            return (
              <div
                key={ex.id || i}
                className={`p-3 border-2 rounded-lg neo-box-sm flex items-center gap-3 transition-all duration-200 cursor-pointer ${
                  isCompleted
                    ? 'bg-slate-100 dark:bg-[#10141C] border-slate-400 dark:border-[#383F50] opacity-70 scale-[0.99]'
                    : 'bg-[#FCF9F8] dark:bg-[#1E232E] border-black dark:border-[#383F50] hover:bg-white dark:hover:bg-[#2A161D]'
                }`}
                onClick={() => toggleExercise(ex.id)}
              >
                <div className="flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={() => {}}
                    className="w-4 h-4 border-2 border-black dark:border-[#FB7185] rounded accent-black dark:accent-[#FB7185] cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <h5
                    className={`text-xs font-black transition-all ${
                      isCompleted
                        ? 'line-through text-slate-400 dark:text-[#64748B]'
                        : 'text-slate-900 dark:text-[#F3F4F6]'
                    }`}
                  >
                    {ex.name}
                  </h5>
                  {ex.desc && (
                    <p
                      className={`text-[10px] font-medium font-sans ${
                        isCompleted
                          ? 'line-through text-slate-400 dark:text-[#64748B]'
                          : 'text-slate-600 dark:text-[#9CA3AF]'
                      }`}
                    >
                      {ex.desc}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
                  {ex.weight && (
                    <span
                      className={`px-2 py-1 bg-[#FFE4E6] dark:bg-[#2A161D] text-slate-900 dark:text-[#FB7185] border-2 border-black dark:border-[#FB7185] rounded font-black text-[11px] shadow-[1px_1px_0px_#000] flex items-center gap-1 ${
                        isCompleted ? 'line-through opacity-60' : ''
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px] leading-none">fitness_center</span>
                      <span>{ex.weight}</span>
                    </span>
                  )}
                  <span
                    className={`px-2 py-1 bg-white dark:bg-[#10141C] text-slate-900 dark:text-[#F3F4F6] border-2 border-black dark:border-[#383F50] rounded font-black text-xs shadow-[1px_1px_0px_#000] ${
                      isCompleted ? 'line-through text-slate-400 dark:text-[#64748B]' : ''
                    }`}
                  >
                    {ex.sets || 3} sets × {ex.reps || 10} reps
                  </span>
                  {ex.rpe && (
                    <span className="px-1.5 py-0.5 bg-yellow-100 dark:bg-[#2A161D] text-slate-900 dark:text-[#FB7185] border border-black dark:border-[#FB7185] rounded text-[10px] font-bold">
                      {ex.rpe}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {task.details?.notes ? (
        <div className="p-3 bg-yellow-50 dark:bg-[#2A161D] border-2 border-black dark:border-[#FB7185] rounded-lg neo-box-sm space-y-1">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-900 dark:text-[#FB7185] flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px] leading-none">sports_martial_arts</span>
            <span>Coach Notes & Readiness</span>
          </div>
          <p className="text-xs font-medium font-sans text-slate-700 dark:text-[#F3F4F6] leading-relaxed whitespace-pre-wrap">
            {task.details.notes}
          </p>
        </div>
      ) : (
        <div className="p-3 bg-slate-50 dark:bg-[#10141C] border-2 border-dashed border-slate-300 dark:border-[#383F50] rounded-lg text-slate-400 dark:text-[#64748B] text-xs font-sans">
          No additional coach notes logged for this session.
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
            className="px-4 py-2 bg-white dark:bg-[#1E232E] hover:bg-slate-50 dark:hover:bg-[#2E1850] text-slate-900 dark:text-[#F3F4F6] border-2 border-black dark:border-[#383F50] rounded-lg font-black text-xs shadow-[2px_2px_0px_#000] neo-btn flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px] leading-none">edit</span>
            <span>Edit Training</span>
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
