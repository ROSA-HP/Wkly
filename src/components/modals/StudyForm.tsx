import { useState } from 'react';
import { Task, DayOfWeek } from '../../types';

interface StudyFormProps {
  onSave: (task: Omit<Task, 'id'>) => void;
  onClose: () => void;
}

export function StudyForm({ onSave, onClose }: StudyFormProps) {
  const [subject, setSubject] = useState('Organic Chemistry II (CHEM 142)');
  const [day, setDay] = useState<DayOfWeek>('Tuesday');
  const [time, setTime] = useState('10:00 (90 mins)');
  const [studyType, setStudyType] = useState('Problem Set / Homework');
  const [colorTint, setColorTint] = useState('bg-[#bae6fd]');

  const [goals, setGoals] = useState([
    { id: 1, text: 'Chapter 4 Practice Questions (14 - 32)', checked: true },
    { id: 2, text: 'Flashcards Review: Carbonyl Electrophiles', checked: false },
    { id: 3, text: 'Export Chemdraw structures for Canvas upload', checked: false }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: subject,
      category: 'STUDYING',
      day,
      time: time.split(' ')[0],
      duration: time,
      colorTint,
      subtitle: `${studyType} • ${time.includes('(') ? time.split('(')[1].replace(')', '') : '90m'}`,
      details: { studyType, goals }
    });
  };

  const handleAddGoal = () => {
    setGoals([...goals, { id: goals.length + 1, text: 'Supplementary review problems', checked: false }]);
  };

  return (
    <form className="p-6 space-y-4 max-h-[80vh] overflow-y-auto font-display" onSubmit={handleSubmit}>
      <div>
        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">Subject / Course Name</label>
        <div className="relative">
          <input 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full text-xs font-bold px-3 py-2.5 bg-[#fcf9f8] border-2 border-black rounded-lg neo-box-sm focus:bg-white focus:outline-none" 
            list="courses-preset" 
            required 
            type="text" 
          />
          <datalist id="courses-preset">
            <option value="Organic Chemistry II (CHEM 142)" />
            <option value="Applied Biostatistics (STATS 202)" />
            <option value="Physics II with Lab (PHYS 43)" />
            <option value="Cellular Physiology (BIO 105)" />
            <option value="Linear Algebra & Differential Eqs" />
          </datalist>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">Target Day</label>
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
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">Time Slot & Duration</label>
          <input 
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full text-xs font-bold px-3 py-2.5 bg-[#fcf9f8] border-2 border-black rounded-lg neo-box-sm focus:bg-white focus:outline-none" 
            type="text" 
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1.5">Study Block Type</label>
        <div className="flex flex-wrap gap-2">
          {['Problem Set / Homework', 'Lecture', 'Exam Cram', 'Lab Writeup', 'Reading'].map(type => (
            <button 
              key={type}
              type="button"
              onClick={() => setStudyType(type)}
              className={`px-2.5 py-1 border-2 border-black rounded-lg text-xs font-bold transition-all ${
                studyType === type 
                  ? 'bg-[#8b5cf6] text-white shadow-[2px_2px_0px_#000]' 
                  : 'bg-white hover:bg-slate-50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800">Task Checklist / Focus Goals</label>
          <span className="text-[10px] font-bold text-slate-500">Deliverables</span>
        </div>
        <div className="space-y-2">
          {goals.map((goal, i) => (
            <div key={goal.id} className="p-2 bg-white border-2 border-black rounded-lg neo-box-sm flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={goal.checked}
                onChange={() => {
                  const newGoals = [...goals];
                  newGoals[i].checked = !newGoals[i].checked;
                  setGoals(newGoals);
                }}
                className="w-4 h-4 border-2 border-black rounded accent-[#008096] cursor-pointer" 
              />
              <input 
                type="text" 
                value={goal.text} 
                onChange={(e) => {
                  const newGoals = [...goals];
                  newGoals[i].text = e.target.value;
                  setGoals(newGoals);
                }}
                className="w-full text-xs font-bold bg-transparent border-none focus:outline-none font-sans" 
              />
            </div>
          ))}
        </div>
        <button 
          type="button" 
          onClick={handleAddGoal}
          className="w-full mt-2 py-2 bg-[#f6f3f2] hover:bg-white border-2 border-dashed border-black rounded-lg text-xs font-black text-slate-700 hover:text-black transition-colors flex items-center justify-center gap-1.5"
        >
          <span>+ Add Goal</span>
        </button>
      </div>

      <div className="p-3 bg-[#fcf9f8] border-2 border-black rounded-lg neo-box-sm">
        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-800 mb-2">Card Color Tint (Sky Blue default)</label>
        <div className="flex items-center gap-3">
          {[
            { id: 'blue', colorClass: 'bg-[#bae6fd]' },
            { id: 'yellow', colorClass: 'bg-[#fef08a]' },
            { id: 'mint', colorClass: 'bg-[#bbf7d0]' },
            { id: 'lavender', colorClass: 'bg-[#f3e8ff]' }
          ].map(tint => (
            <label key={tint.id} className="cursor-pointer">
              <input 
                type="radio" 
                name="color-tint-study" 
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
        <button type="submit" className="px-5 py-2 bg-[#008096] text-white border-2 border-black rounded-lg font-black text-xs shadow-[3px_3px_0px_#000] neo-btn flex items-center gap-1.5">
          <span>Save Study Session</span>
          <span>✓</span>
        </button>
      </div>
    </form>
  );
}
