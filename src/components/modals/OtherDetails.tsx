import { useState } from 'react';
import { Task, GoalItem } from '../../types';

interface OtherDetailsProps {
  task: Task;
  onClose: () => void;
  onEdit: () => void;
  onFinish: () => void;
  onUpdateTask?: (taskId: string, updatedFields: Partial<Task>) => void;
}

export function OtherDetails({ task, onClose, onEdit, onFinish, onUpdateTask }: OtherDetailsProps) {
  const realGoals: GoalItem[] = task.details?.goals || [];

  const [completedIds, setCompletedIds] = useState<(number | string)[]>(() => {
    return realGoals.filter(g => g.checked).map(g => g.id);
  });

  const toggleGoal = (id: number | string) => {
    const isCurrentlyCompleted = completedIds.includes(id);
    const nextCompleted = isCurrentlyCompleted
      ? completedIds.filter(item => item !== id)
      : [...completedIds, id];

    setCompletedIds(nextCompleted);

    if (onUpdateTask && realGoals.length > 0) {
      const updatedGoals = realGoals.map(g => ({
        ...g,
        checked: nextCompleted.includes(g.id)
      }));

      onUpdateTask(task.id, {
        details: {
          ...task.details,
          goals: updatedGoals
        }
      });
    }
  };

  return (
    <div className="p-6 space-y-5 font-display">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-black px-2 py-0.5 bg-yellow-200 border border-black rounded uppercase">
            {task.details?.tag || task.subtitle || 'General'}
          </span>
        </div>
        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">
          {task.title}
        </h3>
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1">📅 <span>{task.day}</span></span>
          <span className="flex items-center gap-1">⏱️ <span>{task.time} ({task.duration || '30 min'})</span></span>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-800">
          <span>Checklist / Subtasks</span>
          <span className="text-[10px] text-slate-500 font-bold">
            {completedIds.length} of {realGoals.length} COMPLETED
          </span>
        </div>

        {realGoals.length === 0 ? (
          <div className="p-5 border-2 border-dashed border-slate-300 rounded-lg text-center bg-slate-50 space-y-2">
            <p className="text-xs font-medium text-slate-500 font-sans">No action items or subtasks listed for this activity.</p>
            <button 
              onClick={onEdit} 
              className="text-xs font-bold text-amber-700 underline hover:text-amber-900"
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
                  className={`p-3 border-2 border-black rounded-lg neo-box-sm flex items-center justify-between cursor-pointer transition-all duration-200 ${
                    isCompleted ? 'bg-slate-100 opacity-70 scale-[0.99]' : 'bg-[#fcf9f8] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 flex-1">
                    <input 
                      type="checkbox" 
                      checked={isCompleted}
                      onChange={() => {}} 
                      className="w-4 h-4 border-2 border-black rounded accent-amber-500 cursor-pointer flex-shrink-0" 
                    />
                    <span className={`text-xs font-bold transition-all ${
                      isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                    }`}>
                      {goal.text || `Item #${i + 1}`}
                    </span>
                  </div>
                  {isCompleted && (
                    <span className="text-[10px] font-bold bg-green-100 text-green-800 border border-black px-1.5 py-0.5 rounded flex-shrink-0 ml-2">
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
        <div className="p-3 bg-amber-50 border-2 border-black rounded-lg neo-box-sm space-y-1">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-900 flex items-center gap-1">
            <span>📝</span> Priority & Logistics Notes
          </div>
          <p className="text-xs font-medium font-sans text-slate-700 leading-relaxed whitespace-pre-wrap">
            {task.details.notes}
          </p>
        </div>
      ) : (
        <div className="p-3 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 text-xs font-sans">
          No additional priority or logistics notes logged.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-black">
        <button onClick={onClose} className="px-3 py-2 border-2 border-black rounded-lg font-bold text-xs hover:bg-slate-100 neo-box-sm neo-btn">
          Close
        </button>
        <div className="flex items-center gap-2">
          <button onClick={onEdit} className="px-4 py-2 bg-white hover:bg-slate-50 border-2 border-black rounded-lg font-black text-xs shadow-[2px_2px_0px_#000] neo-btn flex items-center gap-1.5">
            <span>✎</span>
            <span>Edit Activity</span>
          </button>
          <button onClick={onFinish} className="px-4 py-2 bg-[#86efac] hover:bg-[#4ade80] border-2 border-black rounded-lg font-black text-xs shadow-[3px_3px_0px_#000] neo-btn flex items-center gap-1.5 text-slate-950">
            <span>✓</span>
            <span>Finish Task</span>
          </button>
        </div>
      </div>
    </div>
  );
}
