import { useState } from 'react';
import { Task, DayOfWeek } from '../../types';

interface TrainingFormProps {
  onSave: (task: Omit<Task, 'id'>) => void;
  onClose: () => void;
}

export function TrainingForm({ onSave, onClose }: TrainingFormProps) {
  const [title, setTitle] = useState('Karate Conditioning (Kata & Sparring)');
  const [day, setDay] = useState<DayOfWeek>('Tuesday');
  const [time, setTime] = useState('16:00 (60 min)');
  const [colorTint, setColorTint] = useState('bg-[#fce7f3]');
  const [notes, setNotes] = useState('Focus on hip extension and snap. Ensure 90s full recovery between explosive efforts.');

  const [exercises, setExercises] = useState([
    { id: 1, name: '1. Explosive Pull-ups (+15kg)', desc: 'Bodyweight + vest', sets: 4, reps: 8, rpe: 'RPE 8.5', rpeColor: 'bg-slate-100' },
    { id: 2, name: '2. Box Jumps (30in Plyometric)', desc: 'Maximum explosive velocity', sets: 5, reps: 6, rpe: 'Twitch', rpeColor: 'bg-pink-100' }
  ]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      category: 'TRAINING',
      day,
      time: time.split(' ')[0],
      duration: time,
      colorTint,
      subtitle: 'Sets & drills scheduled',
      details: { exercises, notes }
    });
  };

  const addExerciseRow = () => {
    setExercises([...exercises, {
      id: exercises.length + 1,
      name: `${exercises.length + 1}. Kettlebell Dynamic Snatch`,
      desc: 'Power endurance • 24kg',
      sets: 3, reps: 10, rpe: 'Power', rpeColor: 'bg-purple-100'
    }]);
  };

  return (
    <form className="p-6 space-y-4 max-h-[80vh] overflow-y-auto font-display" onSubmit={handleSubmit}>
      <div>
        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">Session / Workout Title</label>
        <input 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-xs font-bold px-3 py-2.5 bg-[#fcf9f8] border-2 border-black rounded-lg neo-box-sm focus:bg-white focus:outline-none" 
          required 
          type="text" 
        />
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

      <div className="p-3 bg-[#fcf9f8] border-2 border-black rounded-lg neo-box-sm">
        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-800 mb-2">Card Color Tint</label>
        <div className="flex items-center gap-3">
          {[
            { id: 'pink', colorClass: 'bg-[#fce7f3]' },
            { id: 'mint', colorClass: 'bg-[#dcfce7]' },
            { id: 'yellow', colorClass: 'bg-[#fef08a]' },
            { id: 'lavender', colorClass: 'bg-[#ede9fe]' }
          ].map(tint => (
            <label key={tint.id} className="cursor-pointer">
              <input 
                type="radio" 
                name="color-tint-training" 
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

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800">Exercise Drills (Sets × Reps)</label>
          <span className="text-[10px] font-bold text-slate-500">Compact Holders</span>
        </div>
        <div className="space-y-2">
          {exercises.map((ex, i) => (
            <div key={ex.id} className="p-2.5 bg-white border-2 border-black rounded-lg neo-box-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex-1 w-full sm:w-auto">
                <input 
                  type="text" 
                  value={ex.name} 
                  onChange={(e) => {
                    const newEx = [...exercises];
                    newEx[i].name = e.target.value;
                    setExercises(newEx);
                  }}
                  className="w-full text-xs font-bold bg-transparent border-b border-dashed border-slate-300 focus:outline-none focus:border-black" 
                />
                <span className="text-[10px] text-slate-500 font-sans">{ex.desc}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 sm:mt-0">
                <div className="flex items-center gap-1 bg-[#fcf9f8] border-2 border-black rounded px-2 py-1 shadow-[1px_1px_0px_#000]">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Sets</span>
                  <input type="number" value={ex.sets} readOnly className="w-6 text-center text-xs font-black bg-transparent focus:outline-none" />
                  <span className="text-xs font-black text-slate-700 px-0.5">×</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase">Reps</span>
                  <input type="number" value={ex.reps} readOnly className="w-6 text-center text-xs font-black bg-transparent focus:outline-none" />
                </div>
                <span className={`text-[10px] font-bold ${ex.rpeColor} border border-black px-1.5 py-0.5 rounded`}>{ex.rpe}</span>
              </div>
            </div>
          ))}
        </div>
        <button 
          type="button" 
          onClick={addExerciseRow}
          className="w-full mt-2 py-2 bg-[#f6f3f2] hover:bg-white border-2 border-dashed border-black rounded-lg text-xs font-black text-slate-700 hover:text-black transition-colors flex items-center justify-center gap-1.5"
        >
          <span>+</span>
          <span>Add Another Exercise Drill</span>
        </button>
      </div>

      <div>
        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">Coach Notes & Readiness Cue</label>
        <textarea 
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full text-xs font-medium font-sans px-3 py-2 bg-[#fcf9f8] border-2 border-black rounded-lg neo-box-sm focus:bg-white focus:outline-none" 
          rows={2}
        />
      </div>
      
      <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black mt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 border-2 border-black rounded-lg font-bold text-xs hover:bg-slate-100 neo-box-sm neo-btn">
          Cancel
        </button>
        <button type="submit" className="px-5 py-2 bg-[#8b5cf6] text-white border-2 border-black rounded-lg font-black text-xs shadow-[3px_3px_0px_#000] neo-btn flex items-center gap-1.5">
          <span>Save & Add to Schedule</span>
          <span>✓</span>
        </button>
      </div>
    </form>
  );
}
