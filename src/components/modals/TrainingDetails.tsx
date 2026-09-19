import { useState } from 'react';
import { Task, ExerciseItem } from '../../types';

interface TrainingDetailsProps {
  task: Task;
  onClose: () => void;
  onEdit: () => void;
  onFinish: () => void;
  onUpdateTask?: (taskId: string, updatedFields: Partial<Task>) => void;
}

export function TrainingDetails({ task, onClose, onEdit, onFinish, onUpdateTask }: TrainingDetailsProps) {
  // Extract real exercises from the task details
  const realExercises: ExerciseItem[] = task.details?.exercises || [];

  // State to track which exercise IDs are completed
  const [completedIds, setCompletedIds] = useState<(number | string)[]>(() => {
    return realExercises.filter(ex => ex.completed).map(ex => ex.id);
  });

  const toggleExercise = (id: number | string) => {
    const isCurrentlyCompleted = completedIds.includes(id);
    const nextCompleted = isCurrentlyCompleted
      ? completedIds.filter(item => item !== id)
      : [...completedIds, id];

    setCompletedIds(nextCompleted);

    // Save updated exercises checklist state back to database
    if (onUpdateTask && realExercises.length > 0) {
      const updatedExercises = realExercises.map(ex => ({
        ...ex,
        completed: nextCompleted.includes(ex.id)
      }));

      onUpdateTask(task.id, {
        details: {
          ...task.details,
          exercises: updatedExercises
        }
      });
    }
  };

  return (
    <div className="p-6 space-y-5 font-display">
      <div>
        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">
          {task.title}
        </h3>
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1">📅 <span>{task.day}</span></span>
          <span className="flex items-center gap-1">⏱️ <span>{task.time} ({task.duration || '60 min'})</span></span>
          <span className="flex items-center gap-1 text-[#8b5cf6]">
            <span>🏷️</span> <span>{task.subtitle || 'Training Session'}</span>
          </span>
        </div>
      </div>
      
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-800">
          <span>Session Exercise Checklist</span>
          <span className="text-[10px] text-slate-500 font-bold">
            {completedIds.length} of {realExercises.length} COMPLETED
          </span>
        </div>
        
        {realExercises.length === 0 ? (
          <div className="p-5 border-2 border-dashed border-slate-300 rounded-lg text-center bg-slate-50 space-y-2">
            <p className="text-xs font-medium text-slate-500 font-sans">No exercise drills logged for this session yet.</p>
            <button 
              onClick={onEdit} 
              className="text-xs font-bold text-[#8b5cf6] underline hover:text-purple-800"
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
                className={`p-3 border-2 border-black rounded-lg neo-box-sm flex items-center gap-3 transition-all duration-200 cursor-pointer ${
                  isCompleted ? 'bg-slate-100 opacity-70 scale-[0.99]' : 'bg-[#fcf9f8] hover:bg-white'
                }`}
                onClick={() => toggleExercise(ex.id)}
              >
                <div className="flex-shrink-0">
                  <input 
                    type="checkbox" 
                    checked={isCompleted} 
                    onChange={() => {}} // Handled by parent div
                    className="w-4 h-4 border-2 border-black rounded accent-black cursor-pointer" 
                  />
                </div>
                <div className="flex-1">
                  <h5 className={`text-xs font-black transition-all ${
                    isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                  }`}>
                    {ex.name}
                  </h5>
                  {ex.desc && (
                    <p className={`text-[10px] font-medium font-sans ${
                      isCompleted ? 'line-through text-slate-400' : 'text-slate-600'
                    }`}>
                      {ex.desc}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className={`px-2 py-1 bg-white border-2 border-black rounded font-black text-xs shadow-[1px_1px_0px_#000] ${
                    isCompleted ? 'line-through text-slate-400' : ''
                  }`}>
                    {ex.sets || 3} × {ex.reps || 10}
                  </span>
                  {ex.rpe && (
                    <span className={`px-1.5 py-0.5 ${ex.rpeColor || 'bg-yellow-100'} border border-black rounded text-[10px] font-bold`}>
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
        <div className="p-3 bg-yellow-50 border-2 border-black rounded-lg neo-box-sm space-y-1">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-900 flex items-center gap-1">
            <span>🥋</span> Coach Notes & Readiness
          </div>
          <p className="text-xs font-medium font-sans text-slate-700 leading-relaxed whitespace-pre-wrap">
            {task.details.notes}
          </p>
        </div>
      ) : (
        <div className="p-3 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 text-xs font-sans">
          No additional coach notes logged for this session.
        </div>
      )}
      
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-black">
        <button onClick={onClose} className="px-3 py-2 border-2 border-black rounded-lg font-bold text-xs hover:bg-slate-100 neo-box-sm neo-btn">
          Close
        </button>
        <div className="flex items-center gap-2">
          <button onClick={onEdit} className="px-4 py-2 bg-white hover:bg-slate-50 border-2 border-black rounded-lg font-black text-xs shadow-[2px_2px_0px_#000] neo-btn flex items-center gap-1.5">
            <span>✎</span>
            <span>Edit Training</span>
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
