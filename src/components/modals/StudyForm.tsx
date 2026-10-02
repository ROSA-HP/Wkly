import { useState, FormEvent } from 'react';
import { Task, DayOfWeek, GoalItem } from '../../types';
import { ClockTimePicker } from './ClockTimePicker';

interface StudyFormProps {
  initialTask?: Task | null;
  defaultDay?: DayOfWeek;
  onSave: (task: Omit<Task, 'id'>) => void;
  onClose: () => void;
}

export function StudyForm({ initialTask, defaultDay, onSave, onClose }: StudyFormProps) {
  const [subject, setSubject] = useState(initialTask?.title || '');
  const [day, setDay] = useState<DayOfWeek>(initialTask?.day || defaultDay || 'Monday');
  const [time, setTime] = useState(initialTask?.time || '10:00 AM');
  const [duration, setDuration] = useState(initialTask?.duration || '90 min');
  const [studyType, setStudyType] = useState(
    initialTask?.details?.studyType || 'Problem Set / Homework'
  );
  const [colorTint, setColorTint] = useState(initialTask?.colorTint || 'bg-[#bae6fd]');
  const [notes, setNotes] = useState(initialTask?.details?.notes || '');

  // Empty checklist by default as requested, or load existing if editing
  const [goals, setGoals] = useState<GoalItem[]>(
    initialTask?.details?.goals ? [...initialTask.details.goals] : []
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      title: subject.trim() || 'Study Session',
      category: 'STUDYING',
      day,
      time,
      duration,
      colorTint,
      subtitle: `${studyType} • ${duration}`,
      details: { studyType, goals, notes },
    });
  };

  const handleAddGoal = () => {
    setGoals([...goals, { id: Date.now(), text: '', checked: false }]);
  };

  const handleRemoveGoal = (id: number | string) => {
    setGoals(goals.filter((g) => g.id !== id));
  };

  return (
    <form
      className="p-6 space-y-4 max-h-[80vh] overflow-y-auto font-display scrollbar-custom"
      onSubmit={handleSubmit}
    >
      <div>
        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-[#F3F4F6] mb-1">
          Subject / Course Name
        </label>
        <div className="relative">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Organic Chemistry, Biostatistics, Linear Algebra"
            className="w-full text-xs font-bold px-3 py-2.5 rounded-lg neo-input"
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

      <div>
        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-[#F3F4F6] mb-1.5">
          Study Block Type
        </label>
        <div className="flex flex-wrap gap-2">
          {['Problem Set / Homework', 'Lecture', 'Exam Cram', 'Lab Writeup', 'Reading'].map(
            (type) => (
              <button
                key={type}
                type="button"
                onClick={() => setStudyType(type)}
                className={`px-2.5 py-1 border-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  studyType === type
                    ? 'bg-[#8B5CF6] dark:bg-[#A855F7] text-white dark:text-[#0B0D11] border-black dark:border-white shadow-[2px_2px_0px_#000]'
                    : 'bg-white dark:bg-[#1E232E] text-slate-800 dark:text-[#F3F4F6] border-black dark:border-[#383F50] hover:bg-slate-50 dark:hover:bg-[#132637]'
                }`}
              >
                {type}
              </button>
            )
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-[#F3F4F6]">
            Task Checklist / Focus Goals
          </label>
          <span className="text-[10px] font-bold text-slate-500 dark:text-[#9CA3AF]">
            {goals.length} {goals.length === 1 ? 'goal' : 'goals'}
          </span>
        </div>

        {goals.length === 0 ? (
          <div className="p-4 bg-slate-50 dark:bg-[#10141C] border-2 border-dashed border-slate-300 dark:border-[#383F50] rounded-lg text-center text-xs text-slate-500 dark:text-[#9CA3AF] font-sans">
            No specific checklist items yet. Click below to add assignment deliverables.
          </div>
        ) : (
          <div className="space-y-2">
            {goals.map((goal, i) => (
              <div
                key={goal.id || i}
                className="p-2 bg-white dark:bg-[#1E232E] border-2 border-black dark:border-[#383F50] rounded-lg neo-box-sm flex items-center gap-2"
              >
                <input
                  type="checkbox"
                  checked={goal.checked}
                  onChange={() => {
                    const newGoals = [...goals];
                    newGoals[i].checked = !newGoals[i].checked;
                    setGoals(newGoals);
                  }}
                  className="w-4 h-4 border-2 border-black dark:border-[#38BDF8] rounded accent-[#008096] dark:accent-[#38BDF8] cursor-pointer"
                />
                <input
                  type="text"
                  value={goal.text}
                  placeholder="e.g. Chapter 4 Practice Questions (14 - 32)"
                  onChange={(e) => {
                    const newGoals = [...goals];
                    newGoals[i].text = e.target.value;
                    setGoals(newGoals);
                  }}
                  className="w-full text-xs font-bold text-slate-900 dark:text-[#F3F4F6] bg-transparent border-none focus:outline-none font-sans"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveGoal(goal.id)}
                  title="Remove goal"
                  className="w-6 h-6 rounded bg-red-100 dark:bg-[#2A161D] hover:bg-red-200 border border-black dark:border-[#FB7185] flex items-center justify-center text-xs font-bold text-red-700 dark:text-[#FB7185] cursor-pointer"
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
          className="w-full mt-2 py-2 bg-[#F6F3F2] dark:bg-[#1E232E] hover:bg-white dark:hover:bg-[#132637] border-2 border-dashed border-black dark:border-[#383F50] rounded-lg text-xs font-black text-slate-700 dark:text-[#F3F4F6] hover:text-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>+ Add Goal</span>
        </button>
      </div>

      <div>
        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-[#F3F4F6] mb-1">
          Study Notes / Syllabus References
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Bring formula sheet, focus on mechanisms"
          className="w-full text-xs font-medium font-sans px-3 py-2 rounded-lg neo-input"
          rows={2}
        />
      </div>

      <div className="p-3 bg-[#FCF9F8] dark:bg-[#1E232E] border-2 border-black dark:border-[#383F50] rounded-lg neo-box-sm">
        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-800 dark:text-[#F3F4F6] mb-2">
          Card Color Tint
        </label>
        <div className="flex items-center gap-3">
          {[
            { id: 'blue', colorClass: 'bg-[#bae6fd]', previewClass: 'bg-[#BAE6FD] dark:bg-[#132637] border-black dark:border-[#38BDF8]' },
            { id: 'yellow', colorClass: 'bg-[#fef08a]', previewClass: 'bg-[#FEF08A] dark:bg-[#292312] border-black dark:border-[#FBBF24]' },
            { id: 'mint', colorClass: 'bg-[#bbf7d0]', previewClass: 'bg-[#A7F3D0] dark:bg-[#122A21] border-black dark:border-[#34D399]' },
            { id: 'lavender', colorClass: 'bg-[#f3e8ff]', previewClass: 'bg-[#f3e8ff] dark:bg-[#2E1850] border-black dark:border-[#A855F7]' },
          ].map((tint) => (
            <label key={tint.id} className="cursor-pointer">
              <input
                type="radio"
                name="color-tint-study"
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
          <span>{initialTask ? 'Update Study Session' : 'Save Study Session'}</span>
          <span>✓</span>
        </button>
      </div>
    </form>
  );
}
