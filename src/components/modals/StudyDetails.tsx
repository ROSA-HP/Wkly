import { Task } from '../../types';

interface StudyDetailsProps {
  task: Task;
  onClose: () => void;
  onEdit: () => void;
  onFinish: () => void;
}

export function StudyDetails({ task, onClose, onEdit, onFinish }: StudyDetailsProps) {
  // Use mock details if actual details don't exist yet on the task object
  const defaultGoals = [
    { text: 'Chapter 19 practice problems (1-18)', checked: true, tag: 'Required', tagColor: 'bg-white' },
    { text: 'Review reaction mechanisms flashcards', checked: false, tag: 'Recall', tagColor: 'bg-yellow-100' },
    { text: 'Pre-lab quiz preparation on Gradescope', checked: false, tag: 'Due 23:59', tagColor: 'bg-purple-100' },
  ];

  return (
    <div className="p-6 space-y-5 font-display">
      <div>
        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">
          {task.title}
        </h3>
        <p className="text-xs font-bold text-[#006577] mt-0.5">
          {task.details?.studyType || 'Carbonyl Reactions & Nucleophilic Additions'}
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1">📅 <span>{task.day}, Sep 15</span></span>
          <span className="flex items-center gap-1">⏱️ <span>{task.duration || `${task.time} (120 min)`}</span></span>
          <span className="flex items-center gap-1 text-[#008096]">🎯 Deep Cognitive Focus</span>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-800">
          <span>Checklist & Deliverables</span>
          <span className="text-[10px] text-slate-500 font-bold">TAP TO COMPLETE</span>
        </div>
        <div className="space-y-2">
          {defaultGoals.map((goal, i) => (
            <label key={i} className="p-3 bg-[#fcf9f8] border-2 border-black rounded-lg neo-box-sm flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2.5">
                <input 
                  type="checkbox" 
                  defaultChecked={goal.checked}
                  className="w-4 h-4 border-2 border-black rounded accent-[#008096]" 
                />
                <span className={`text-xs font-bold ${goal.checked ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                  {goal.text}
                </span>
              </div>
              <span className={`text-[10px] font-bold ${goal.tagColor} border border-black px-1.5 py-0.5 rounded`}>
                {goal.tag}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="p-3 bg-blue-50 border-2 border-black rounded-lg neo-box-sm space-y-1">
        <div className="text-[10px] font-black uppercase tracking-wider text-slate-900 flex items-center gap-1">
          <span>🏛️</span> Professor Cue & Syllabus Note
        </div>
        <p className="text-xs font-medium font-sans text-slate-700 leading-relaxed">
          Midterm Exam 2 includes Grignard reagents and alpha-beta unsaturated carbonyls. Verify resonance stability prior to mechanism diagram submissions.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-black">
        <button onClick={onClose} className="px-3 py-2 border-2 border-black rounded-lg font-bold text-xs hover:bg-slate-100 neo-box-sm neo-btn">
          Close
        </button>
        <div className="flex items-center gap-2">
          <button onClick={onEdit} className="px-4 py-2 bg-white hover:bg-slate-50 border-2 border-black rounded-lg font-black text-xs shadow-[2px_2px_0px_#000] neo-btn flex items-center gap-1.5">
            <span>✎</span>
            <span>Edit Study Block</span>
          </button>
          <button onClick={onFinish} className="px-4 py-2 bg-[#86efac] hover:bg-[#4ade80] border-2 border-black rounded-lg font-black text-xs shadow-[3px_3px_0px_#000] neo-btn flex items-center gap-1.5 text-slate-950">
            <span>✓</span>
            <span>Finish Study Task</span>
          </button>
        </div>
      </div>
    </div>
  );
}
