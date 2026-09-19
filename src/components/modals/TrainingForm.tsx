import { useState, FormEvent } from 'react';
import { Task, DayOfWeek, ExerciseItem } from '../../types';

interface TrainingFormProps {
  initialTask?: Task | null;
  defaultDay?: DayOfWeek;
  onSave: (task: Omit<Task, 'id'>) => void;
  onClose: () => void;
}

export function TrainingForm({ initialTask, defaultDay, onSave, onClose }: TrainingFormProps) {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [day, setDay] = useState<DayOfWeek>(initialTask?.day || defaultDay || 'Monday');
  const [time, setTime] = useState(initialTask?.time ? `${initialTask.time} (${initialTask.duration || '60 min'})` : '08:00 (60 min)');
  const [colorTint, setColorTint] = useState(initialTask?.colorTint || 'bg-[#fce7f3]');
  const [notes, setNotes] = useState(initialTask?.details?.notes || '');

  // Start with empty exercises checklist unless editing existing task
  const [exercises, setExercises] = useState<ExerciseItem[]>(
    initialTask?.details?.exercises ? [...initialTask.details.exercises] : []
  );
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanTime = time.includes(' ') ? time.split(' ')[0] : time;
    const cleanDuration = time.includes('(') ? time.split('(')[1].replace(')', '') : '60 min';

    onSave({
      title: title.trim() || 'Training Session',
      category: 'TRAINING',
      day,
      time: cleanTime,
      duration: cleanDuration,
      colorTint,
      subtitle: exercises.length > 0 ? `${exercises.length} Drills Scheduled` : 'Training Workout',
      details: { exercises, notes }
    });
  };

  const addExerciseRow = () => {
    const nextNum = exercises.length + 1;
    setExercises([...exercises, {
      id: Date.now(),
      name: `Exercise ${nextNum}`,
      desc: 'Target weight / tempo',
      sets: 3,
      reps: 10,
      rpe: 'RPE 8',
      rpeColor: 'bg-yellow-100',
      completed: false
    }]);
  };

  const removeExerciseRow = (id: number | string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  return (
    <form className="p-6 space-y-4 max-h-[80vh] overflow-y-auto font-display" onSubmit={handleSubmit}>
      <div>
        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">Session / Workout Title</label>
        <input 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Upper Body Hypertrophy, Sprint Drills, Conditioning"
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
            placeholder="08:00 (60 min)"
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
          <span className="text-[10px] font-bold text-slate-500">
            {exercises.length} {exercises.length === 1 ? 'drill' : 'drills'}
          </span>
        </div>

        {exercises.length === 0 ? (
          <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg text-center text-xs text-slate-500 font-sans">
            No exercise drills added yet. Click below to add your sets and reps.
          </div>
        ) : (
          <div className="space-y-2">
            {exercises.map((ex, i) => (
              <div key={ex.id} className="p-2.5 bg-white border-2 border-black rounded-lg neo-box-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex-1 w-full sm:w-auto">
                  <input 
                    type="text" 
                    value={ex.name} 
                    placeholder="Exercise name"
                    onChange={(e) => {
                      const newEx = [...exercises];
                      newEx[i].name = e.target.value;
                      setExercises(newEx);
                    }}
                    className="w-full text-xs font-bold bg-transparent border-b border-dashed border-slate-300 focus:outline-none focus:border-black" 
                  />
                  <input 
                    type="text" 
                    value={ex.desc || ''} 
                    placeholder="Notes (e.g. Load, Tempo, RPE)"
                    onChange={(e) => {
                      const newEx = [...exercises];
                      newEx[i].desc = e.target.value;
                      setExercises(newEx);
                    }}
                    className="w-full text-[10px] text-slate-500 font-sans bg-transparent border-none focus:outline-none" 
                  />
                </div>
                <div className="flex items-center gap-1.5 mt-2 sm:mt-0">
                  <div className="flex items-center gap-1 bg-[#fcf9f8] border-2 border-black rounded px-2 py-1 shadow-[1px_1px_0px_#000]">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Sets</span>
                    <input 
                      type="number" 
                      min="1" 
                      value={ex.sets || 3} 
                      onChange={(e) => {
                        const newEx = [...exercises];
                        newEx[i].sets = parseInt(e.target.value) || 1;
                        setExercises(newEx);
                      }}
                      className="w-8 text-center text-xs font-black bg-transparent focus:outline-none" 
                    />
                    <span className="text-xs font-black text-slate-700 px-0.5">×</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase">Reps</span>
                    <input 
                      type="number" 
                      min="1" 
                      value={ex.reps || 10} 
                      onChange={(e) => {
                        const newEx = [...exercises];
                        newEx[i].reps = parseInt(e.target.value) || 1;
                        setExercises(newEx);
                      }}
                      className="w-8 text-center text-xs font-black bg-transparent focus:outline-none" 
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExerciseRow(ex.id)}
                    title="Remove drill"
                    className="w-6 h-6 rounded bg-red-100 hover:bg-red-200 border border-black flex items-center justify-center text-xs font-bold text-red-700"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button 
          type="button" 
          onClick={addExerciseRow}
          className="w-full mt-2 py-2 bg-[#f6f3f2] hover:bg-white border-2 border-dashed border-black rounded-lg text-xs font-black text-slate-700 hover:text-black transition-colors flex items-center justify-center gap-1.5"
        >
          <span>+</span>
          <span>Add Exercise Drill</span>
        </button>
      </div>

      <div>
        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">Coach Notes & Readiness Cue</label>
        <textarea 
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Ensure full recovery between sets. Focus on velocity and form."
          className="w-full text-xs font-medium font-sans px-3 py-2 bg-[#fcf9f8] border-2 border-black rounded-lg neo-box-sm focus:bg-white focus:outline-none" 
          rows={2}
        />
      </div>
      
      <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black mt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 border-2 border-black rounded-lg font-bold text-xs hover:bg-slate-100 neo-box-sm neo-btn">
          Cancel
        </button>
        <button type="submit" className="px-5 py-2 bg-[#8b5cf6] text-white border-2 border-black rounded-lg font-black text-xs shadow-[3px_3px_0px_#000] neo-btn flex items-center gap-1.5">
          <span>{initialTask ? 'Update Session' : 'Save & Add to Schedule'}</span>
          <span>✓</span>
        </button>
      </div>
    </form>
  );
}
