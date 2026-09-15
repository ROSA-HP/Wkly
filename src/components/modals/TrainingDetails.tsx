import { Task } from '../../types';

interface TrainingDetailsProps {
  task: Task;
  onClose: () => void;
  onEdit: () => void;
  onFinish: () => void;
}

export function TrainingDetails({ task, onClose, onEdit, onFinish }: TrainingDetailsProps) {
  // Use mock details if actual details don't exist yet on the task object
  const defaultExercises = [
    { name: '1. Explosive Pull-ups', desc: 'Load: Bodyweight + 15 kg', stats: '4 × 8', tag: 'RPE 8.5', tagColor: 'bg-emerald-100' },
    { name: '2. Box Jumps (Plyometric)', desc: 'Load: 30" Box • Rapid Ground Contact', stats: '5 × 6', tag: 'Fast Twitch', tagColor: 'bg-pink-100' }
  ];

  return (
    <div className="p-6 space-y-5 font-display">
      <div>
        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">
          {task.title}
        </h3>
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1">📅 <span>{task.day}, Sep 15</span></span>
          <span className="flex items-center gap-1">⏱️ <span>{task.duration || `${task.time} (60 min)`}</span></span>
          <span className="flex items-center gap-1 text-[#8b5cf6]">⚡ <span>85% Load • RPE 8.5</span></span>
        </div>
      </div>
      
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-800">
          <span>Exercise Breakdown</span>
          <span className="text-[10px] text-slate-500 font-bold">SETS × REPS</span>
        </div>
        
        {defaultExercises.map((ex, i) => (
          <div key={i} className="p-3 bg-[#fcf9f8] border-2 border-black rounded-lg neo-box-sm flex items-center justify-between">
            <div>
              <h5 className="text-xs font-black">{ex.name}</h5>
              <p className="text-[10px] text-slate-600 font-medium font-sans">{ex.desc}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-1 bg-white border-2 border-black rounded font-black text-xs shadow-[1px_1px_0px_#000]">{ex.stats}</span>
              <span className={`px-1.5 py-0.5 ${ex.tagColor} border border-black rounded text-[10px] font-bold`}>{ex.tag}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 bg-yellow-50 border-2 border-black rounded-lg neo-box-sm space-y-1">
        <div className="text-[10px] font-black uppercase tracking-wider text-slate-900 flex items-center gap-1">
          <span>🥋</span> Coach Notes & Readiness
        </div>
        <p className="text-xs font-medium font-sans text-slate-700 leading-relaxed">
          {task.details?.notes || 'Target CNS readiness 92%. Focus on hip extension and snap. Ensure 90s full recovery between explosive efforts.'}
        </p>
      </div>
      
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
