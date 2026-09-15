import { useState } from 'react';
import { Task, DayOfWeek } from '../../types';

interface OtherFormProps {
  onSave: (task: Omit<Task, 'id'>) => void;
  onClose: () => void;
}

export function OtherForm({ onSave, onClose }: OtherFormProps) {
  const [title, setTitle] = useState('Sports Psychology Visualization & Breathwork');
  const [tag, setTag] = useState('Sports Psych / Mindset');
  const [day, setDay] = useState<DayOfWeek>('Tuesday');
  const [time, setTime] = useState('18:30 (45 mins)');
  const [colorTint, setColorTint] = useState('bg-[#fed7aa]');
  const [notes, setNotes] = useState('Pre-match autonomic down-regulation. Pack high-carb electrolyte fuel bottles for Wednesday morning.');

  const tagsList = [
    { name: 'Sports Psych / Mindset', icon: '🧠' },
    { name: 'Nutrition & Prep', icon: '🥗' },
    { name: 'Team Logistics & Travel', icon: '🚌' },
    { name: 'Life Admin', icon: '🗂️' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      category: 'OTHER',
      day,
      time: time.split(' ')[0],
      duration: time,
      colorTint,
      subtitle: tag,
      details: { tag, notes }
    });
  };

  return (
    <form className="p-6 space-y-4 max-h-[80vh] overflow-y-auto font-display" onSubmit={handleSubmit}>
      <div>
        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">Activity Name</label>
        <input 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-xs font-bold px-3 py-2.5 bg-[#fcf9f8] border-2 border-black rounded-lg neo-box-sm focus:bg-white focus:outline-none" 
          required 
          type="text" 
        />
      </div>

      <div>
        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1.5">Category Tag</label>
        <div className="grid grid-cols-2 gap-2">
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
              <span>{t.icon}</span> {t.name}
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
            className="w-full text-xs font-bold px-3 py-2.5 bg-[#fcf9f8] border-2 border-black rounded-lg neo-box-sm focus:bg-white focus:outline-none" 
            type="text" 
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">Priority & Logistics Notes</label>
        <textarea 
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full text-xs font-medium font-sans px-3 py-2 bg-[#fcf9f8] border-2 border-black rounded-lg neo-box-sm focus:bg-white focus:outline-none" 
          rows={2}
        />
      </div>

      <div className="p-3 bg-[#fcf9f8] border-2 border-black rounded-lg neo-box-sm">
        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-800 mb-2">Color Swatch (Amber / Yellow default)</label>
        <div className="flex items-center gap-3">
          {[
            { id: 'amber', colorClass: 'bg-[#fed7aa]' },
            { id: 'lavender', colorClass: 'bg-[#f3e8ff]' },
            { id: 'yellow', colorClass: 'bg-[#fef08a]' }
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
          <span>Save Activity</span>
          <span>✓</span>
        </button>
      </div>
    </form>
  );
}
