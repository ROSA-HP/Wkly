import { useState, FormEvent } from 'react';
import { Task, DayOfWeek, ExerciseItem } from '../../types';
import { ClockTimePicker } from './ClockTimePicker';

interface TrainingFormProps {
  initialTask?: Task | null;
  defaultDay?: DayOfWeek;
  onSave: (task: Omit<Task, 'id'>) => void;
  onClose: () => void;
}

export function TrainingForm({ initialTask, defaultDay, onSave, onClose }: TrainingFormProps) {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [day, setDay] = useState<DayOfWeek>(initialTask?.day || defaultDay || 'Monday');
  const [time, setTime] = useState(initialTask?.time || '08:00 AM');
  const [duration, setDuration] = useState(initialTask?.duration || '60 min');
  const [colorTint, setColorTint] = useState(initialTask?.colorTint || 'bg-[#fce7f3]');
  const [notes, setNotes] = useState(initialTask?.details?.notes || '');

  // Start with empty exercises checklist unless editing existing task
  const [exercises, setExercises] = useState<ExerciseItem[]>(
    initialTask?.details?.exercises ? [...initialTask.details.exercises] : []
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      title: title.trim() || 'Training Session',
      category: 'TRAINING',
      day,
      time,
      duration,
      colorTint,
      subtitle: exercises.length > 0 ? `${exercises.length} Drills Scheduled` : 'Training Workout',
      details: { exercises, notes },
    });
  };

  const addExerciseRow = () => {
    const nextNum = exercises.length + 1;
    setExercises([
      ...exercises,
      {
        id: Date.now(),
        name: `Exercise ${nextNum}`,
        desc: 'Target weight / tempo',
        sets: 3,
        reps: 10,
        rpe: 'RPE 8',
        rpeColor: 'bg-yellow-100',
        completed: false,
      },
    ]);
  };

  const removeExerciseRow = (id: number | string) => {
    setExercises(exercises.filter((ex) => ex.id !== id));
  };

  return (
    <form
      className="p-6 space-y-4 max-h-[80vh] overflow-y-auto font-display scrollbar-custom"
      onSubmit={handleSubmit}
    >
      <div>
        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-[#F3F4F6] mb-1">
          Session / Workout Title
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Upper Body Hypertrophy, Sprint Drills, Conditioning"
          className="w-full text-xs font-bold px-3 py-2.5 rounded-lg neo-input"
          required
          type="text"
        />
      </div>

      <div>
        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-[#F3F4F6] mb-1">
          Target Day
        </label>
        <select
          value={day}
          onChange={(e) => setDay(e.target.value as DayOfWeek)}
          className="w-full text-xs font-bold px-3 py-2.5 rounded-lg neo-input cursor-pointer"
        >
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
            (d) => (
              <option key={d} value={d} className="bg-white dark:bg-[#161922] text-slate-900 dark:text-[#F3F4F6]">
                {d}
              </option>
            )
          )}
        </select>
      </div>

      {/* Clock-Based Start Time & Duration Selector */}
      <ClockTimePicker
        timeValue={time}
        durationValue={duration}
        onChangeTime={setTime}
        onChangeDuration={setDuration}
      />

      <div className="p-3 bg-[#FCF9F8] dark:bg-[#1E232E] border-2 border-black dark:border-[#383F50] rounded-lg neo-box-sm">
        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-800 dark:text-[#F3F4F6] mb-2">
          Card Color Tint
        </label>
        <div className="flex items-center gap-3">
          {[
            { id: 'pink', colorClass: 'bg-[#fce7f3]', previewClass: 'bg-[#FFE4E6] dark:bg-[#2A161D] border-black dark:border-[#FB7185]' },
            { id: 'mint', colorClass: 'bg-[#dcfce7]', previewClass: 'bg-[#A7F3D0] dark:bg-[#122A21] border-black dark:border-[#34D399]' },
            { id: 'yellow', colorClass: 'bg-[#fef08a]', previewClass: 'bg-[#FEF08A] dark:bg-[#292312] border-black dark:border-[#FBBF24]' },
            { id: 'lavender', colorClass: 'bg-[#ede9fe]', previewClass: 'bg-[#ede9fe] dark:bg-[#2E1850] border-black dark:border-[#A855F7]' },
          ].map((tint) => (
            <label key={tint.id} className="cursor-pointer">
              <input
                type="radio"
                name="color-tint-training"
                value={tint.colorClass}
                checked={colorTint === tint.colorClass}
                onChange={() => setColorTint(tint.colorClass)}
                className="hidden peer"
              />
              <div
                className={`w-7 h-7 rounded-full ${tint.previewClass} border-2 peer-checked:ring-3 peer-checked:ring-black dark:peer-checked:ring-white`}
              ></div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-[#F3F4F6]">
            Exercise Drills (Sets × Reps)
          </label>
          <span className="text-[10px] font-bold text-slate-500 dark:text-[#9CA3AF]">
            {exercises.length} {exercises.length === 1 ? 'drill' : 'drills'}
          </span>
        </div>

        {exercises.length === 0 ? (
          <div className="p-4 bg-slate-50 dark:bg-[#10141C] border-2 border-dashed border-slate-300 dark:border-[#383F50] rounded-lg text-center text-xs text-slate-500 dark:text-[#9CA3AF] font-sans">
            No exercise drills added yet. Click below to add your sets and reps.
          </div>
        ) : (
          <div className="space-y-2">
            {exercises.map((ex, i) => (
              <div
                key={ex.id}
                className="p-2.5 bg-white dark:bg-[#1E232E] border-2 border-black dark:border-[#383F50] rounded-lg neo-box-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
              >
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
                    className="w-full text-xs font-bold text-slate-900 dark:text-[#F3F4F6] bg-transparent border-b border-dashed border-slate-300 dark:border-[#383F50] focus:outline-none focus:border-black dark:focus:border-[#A855F7]"
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
                    className="w-full text-[10px] text-slate-500 dark:text-[#9CA3AF] font-sans bg-transparent border-none focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-1.5 mt-2 sm:mt-0">
                  <div className="flex items-center gap-1 bg-[#FCF9F8] dark:bg-[#10141C] border-2 border-black dark:border-[#383F50] rounded px-2 py-1 shadow-[1px_1px_0px_#000]">
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
                      className="w-8 text-center text-xs font-black text-slate-900 dark:text-[#F3F4F6] bg-transparent focus:outline-none"
                    />
                    <span className="text-xs font-black text-slate-700 dark:text-[#9CA3AF] px-0.5">
                      ×
                    </span>
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
                      className="w-8 text-center text-xs font-black text-slate-900 dark:text-[#F3F4F6] bg-transparent focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExerciseRow(ex.id)}
                    title="Remove drill"
                    className="w-6 h-6 rounded bg-red-100 dark:bg-[#2A161D] hover:bg-red-200 border border-black dark:border-[#FB7185] flex items-center justify-center text-xs font-bold text-red-700 dark:text-[#FB7185] cursor-pointer"
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
          className="w-full mt-2 py-2 bg-[#F6F3F2] dark:bg-[#1E232E] hover:bg-white dark:hover:bg-[#2E1850] border-2 border-dashed border-black dark:border-[#383F50] rounded-lg text-xs font-black text-slate-700 dark:text-[#F3F4F6] hover:text-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>+</span>
          <span>Add Exercise Drill</span>
        </button>
      </div>

      <div>
        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-[#F3F4F6] mb-1">
          Coach Notes & Readiness Cue
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Ensure full recovery between sets. Focus on velocity and form."
          className="w-full text-xs font-medium font-sans px-3 py-2 rounded-lg neo-input"
          rows={2}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black dark:border-[#383F50] mt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-white dark:bg-[#1E232E] text-slate-900 dark:text-[#F3F4F6] border-2 border-black dark:border-[#383F50] rounded-lg font-bold text-xs hover:bg-slate-100 dark:hover:bg-[#10141C] neo-box-sm neo-btn cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 bg-[#8B5CF6] dark:bg-[#A855F7] hover:bg-[#7c3aed] dark:hover:bg-[#C084FC] text-white dark:text-[#0B0D11] border-2 border-black dark:border-white rounded-lg font-black text-xs shadow-[4px_4px_0px_#000] neo-btn flex items-center gap-1.5 cursor-pointer"
        >
          <span>{initialTask ? 'Update Session' : 'Save & Add to Schedule'}</span>
          <span>✓</span>
        </button>
      </div>
    </form>
  );
}
