import { useState, FormEvent } from 'react';
import { Task, DayOfWeek, GoalItem } from '../../types';

interface OtherFormProps {
  initialTask?: Task | null;
  defaultDay?: DayOfWeek;
  onSave: (task: Omit<Task, 'id'>) => void;
  onClose: () => void;
}

export function OtherForm({ initialTask, defaultDay, onSave, onClose }: OtherFormProps) {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [tag, setTag] = useState(initialTask?.details?.tag || initialTask?.subtitle || 'Life Admin');
  const [day, setDay] = useState<DayOfWeek>(initialTask?.day || defaultDay || 'Monday');
  const [time, setTime] = useState(initialTask?.time ? `${initialTask.time} (${initialTask.duration || '30 min'})` : '18:00 (30 min)');
  const [colorTint, setColorTint] = useState(initialTask?.colorTint || 'bg-[#fed7aa]');
  const [notes, setNotes] = useState(initialTask?.details?.notes || '');
  
  // Checklist for other tasks (starts empty)
  const [goals, setGoals] = useState<GoalItem[]>(
    initialTask?.details?.goals ? [...initialTask.details.goals] : []
  );

  const tagsList = [
    { name: 'Life Admin', icon: '🗂️' },
    { name: 'Nutrition & Meal Prep', icon: '🥗' },
    { name: 'Team Logistics & Travel', icon: '🚌' },
    { name: 'Recovery & Physio', icon: '💆' },
    { name: 'Personal Errands', icon: '🛒' },
    { name: 'Mindset & Meditation', icon: '🧠' },
  ];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanTime = time.includes(' ') ? time.split(' ')[0] : time;
    const cleanDuration = time.includes('(') ? time.split('(')[1].replace(')', '') : '30 min';

    onSave({
      title: title.trim() || 'Other Activity',
      category: 'OTHER',
      day,
      time: cleanTime,
      duration: cleanDuration,
      colorTint,
      subtitle: tag,
      details: { tag, notes, goals }
    });
  };

  const handleAddGoal = () => {
    setGoals([...goals, { id: Date.now(), text: '', checked: false }]);
  };

  const handleRemoveGoal = (id: number | string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  return (
    <form className="p-6 space-y-4 max-h-[80vh] overflow-y-auto font-display" onSubmit={handleSubmit}>
      <div>
        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">Activity Name</label>
        <input 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Grocery run, Team briefing, Physio appointment"
          className="w-full text-xs font-bold px-3 py-2.5 bg-[#fcf9f8] border-2 border-black rounded-lg neo-box-sm focus:bg-white focus:outline-none" 
          required 
          type="text" 
        />
      </div>

      <div>
        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1.5">Category Tag</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {tagsList.map(t => (
            <button 
              key={t.name}
              type="button"
              onClick={() => setTag(t.name)}
              className={`p-2 text-left border-2 border-black rounded-lg text-xs flex items-center gap-1.5 transition-all ${
                tag === t.name 
                  ? 'bg-yellow-300 font-black shadow-[2px_2px_0px_#000]' 
                  : 'bg-white hover:bg-slate-50 font-bold'
              }`}
            >
              <span>{t.icon}</span> <span className="truncate">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">Day Target</label>
          <select 
            value={day}
            onChange={(e) => setDay(e.target.value as DayOfWeek)}
            className="w-full text-xs font-bold px-3 py-2.5 bg-[#fcf9f8] border-2 border-black rounded-lg neo-box-sm focus:bg-white focus:outline-none"
          >
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">Time & Duration</label>
          <input 
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="18:00 (30 min)"
            className="w-full text-xs font-bold px-3 py-2.5 bg-[#fcf9f8] border-2 border-black rounded-lg neo-box-sm focus:bg-white focus:outline-none" 
            type="text" 
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800">Checklist / Action Items</label>
          <span className="text-[10px] font-bold text-slate-500">
            {goals.length} {goals.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {goals.length === 0 ? (
          <div className="p-3 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg text-center text-xs text-slate-500 font-sans">
            No action items yet. Click below to add subtasks.
          </div>
        ) : (
          <div className="space-y-2">
            {goals.map((goal, i) => (
              <div key={goal.id || i} className="p-2 bg-white border-2 border-black rounded-lg neo-box-sm flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={goal.checked}
                  onChange={() => {
                    const newGoals = [...goals];
                    newGoals[i].checked = !newGoals[i].checked;
                    setGoals(newGoals);
                  }}
                  className="w-4 h-4 border-2 border-black rounded accent-amber-500 cursor-pointer" 
                />
                <input 
                  type="text" 
                  value={goal.text} 
                  placeholder="e.g. Pick up dry cleaning, pack gym bag"
                  onChange={(e) => {
                    const newGoals = [...goals];
                    newGoals[i].text = e.target.value;
                    setGoals(newGoals);
                  }}
                  className="w-full text-xs font-bold bg-transparent border-none focus:outline-none font-sans" 
                />
                <button
                  type="button"
                  onClick={() => handleRemoveGoal(goal.id)}
                  title="Remove item"
                  className="w-6 h-6 rounded bg-red-100 hover:bg-red-200 border border-black flex items-center justify-center text-xs font-bold text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <button 
          type="button" 
          onClick={handleAddGoal}
          className="w-full mt-2 py-2 bg-[#f6f3f2] hover:bg-white border-2 border-dashed border-black rounded-lg text-xs font-black text-slate-700 hover:text-black transition-colors flex items-center justify-center gap-1.5"
        >
          <span>+ Add Checklist Item</span>
        </button>
      </div>

      <div>
        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">Priority & Logistics Notes</label>
        <textarea 
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Bring confirmation receipt, parking on 3rd floor"
          className="w-full text-xs font-medium font-sans px-3 py-2 bg-[#fcf9f8] border-2 border-black rounded-lg neo-box-sm focus:bg-white focus:outline-none" 
          rows={2}
        />
      </div>

      <div className="p-3 bg-[#fcf9f8] border-2 border-black rounded-lg neo-box-sm">
        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-800 mb-2">Color Swatch</label>
        <div className="flex items-center gap-3">
          {[
            { id: 'amber', colorClass: 'bg-[#fed7aa]' },
            { id: 'lavender', colorClass: 'bg-[#f3e8ff]' },
            { id: 'yellow', colorClass: 'bg-[#fef08a]' },
            { id: 'mint', colorClass: 'bg-[#bbf7d0]' }
          ].map(tint => (
            <label key={tint.id} className="cursor-pointer">
              <input 
                type="radio" 
                name="color-tint-other" 
                value={tint.colorClass}
                checked={colorTint === tint.colorClass}
                onChange={() => setColorTint(tint.colorClass)}
                className="hidden peer" 
              />
              <div className={`w-7 h-7 rounded-full ${tint.colorClass} border-2 border-black peer-checked:ring-4 peer-checked:ring-black`}></div>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black mt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 border-2 border-black rounded-lg font-bold text-xs hover:bg-slate-100 neo-box-sm neo-btn">
          Cancel
        </button>
        <button type="submit" className="px-5 py-2 bg-black text-yellow-300 border-2 border-black rounded-lg font-black text-xs shadow-[3px_3px_0px_#000] neo-btn flex items-center gap-1.5">
          <span>{initialTask ? 'Update Activity' : 'Save Activity'}</span>
          <span>✓</span>
        </button>
      </div>
    </form>
  );
}
