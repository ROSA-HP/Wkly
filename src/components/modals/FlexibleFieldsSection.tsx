import React from 'react';
import { ExerciseItem, GoalItem, TaskField } from '../../types';

export const ALLOWED_FIELD_KEYS = [
  'Subject',
  'Duration (mins)',
  'Exercise',
  'Weight',
  'Sets',
  'Reps',
  'Project',
  'Hardware Used',
  'Tech Stack',
  'Committee',
  'Deck/Resource',
  'Intensity (1-10)',
  'Deadline',
  'Notes',
] as const;

export const STUDY_BLOCK_TYPES = [
  'Problem Set / Homework',
  'Lecture',
  'Exam Cram',
  'Lab Writeup',
  'Reading',
];

export const OTHER_CATEGORY_TAGS = [
  { name: 'Life Admin', icon: 'folder' },
  { name: 'Nutrition & Meal Prep', icon: 'restaurant' },
  { name: 'Team Logistics & Travel', icon: 'directions_bus' },
  { name: 'Recovery & Physio', icon: 'spa' },
  { name: 'Personal Errands', icon: 'shopping_cart' },
  { name: 'Mindset & Meditation', icon: 'psychology' },
];

export interface FlexibleItem {
  id: string | number;
  /**
   * 'training-drill' -> renders the exact Exercise card from TrainingForm (Exercise 1, SETS, REPS, WT, Tempo / Rest cue)
   * 'checklist-goal' -> renders the Checkbox + Goal item card from StudyForm / OtherForm
   * 'study-type'     -> renders the Study Block Type pill selector from StudyForm
   * 'category-tag'   -> renders the Category Tag icon grid from OtherForm
   * 'intensity'      -> renders 1-10 RPE / Intensity selector
   * 'key-value'      -> renders structured Wkly key/value or Custom key/value
   */
  kind: 'training-drill' | 'checklist-goal' | 'study-type' | 'category-tag' | 'intensity' | 'key-value';
  key: string;
  value: string | number;
  isCustomKey?: boolean;
  drill?: {
    name: string;
    sets: number;
    reps: number;
    weight: string;
    desc: string;
    completed?: boolean;
  };
  goal?: {
    text: string;
    checked: boolean;
  };
}

const NUMERIC_KEYS = new Set(['Duration (mins)', 'Sets', 'Reps', 'Intensity (1-10)']);

const FIELD_SELECTOR_OPTIONS = [
  { label: 'Training Drill (Exercise · Sets · Reps · Wt)', value: '__WIDGET_TRAINING__' },
  { label: 'Checklist / Focus Goal Item', value: '__WIDGET_GOAL__' },
  { label: 'Study Block Type (Pills)', value: '__WIDGET_STUDY_TYPE__' },
  { label: 'Category Tag (Icon Grid)', value: '__WIDGET_CATEGORY_TAG__' },
  { label: 'Intensity / RPE (1-10)', value: 'Intensity (1-10)' },
  { label: 'Subject / Course', value: 'Subject' },
  { label: 'Deck / Resource', value: 'Deck/Resource' },
  { label: 'Project', value: 'Project' },
  { label: 'Tech Stack', value: 'Tech Stack' },
  { label: 'Hardware Used', value: 'Hardware Used' },
  { label: 'Committee', value: 'Committee' },
  { label: 'Deadline', value: 'Deadline' },
  { label: 'Duration (mins)', value: 'Duration (mins)' },
  { label: 'Notes', value: 'Notes' },
  { label: 'Weight (Single Field)', value: 'Weight' },
  { label: 'Sets (Single Field)', value: 'Sets' },
  { label: 'Reps (Single Field)', value: 'Reps' },
  { label: 'Custom Field Key...', value: '__CUSTOM__' },
];

export function createTrainingDrillItem(
  indexNumber = 1,
  overrides?: Partial<NonNullable<FlexibleItem['drill']>>
): FlexibleItem {
  const drill = {
    name: overrides?.name ?? `Exercise ${indexNumber}`,
    sets: overrides?.sets ?? 3,
    reps: overrides?.reps ?? 10,
    weight: overrides?.weight ?? 'Bodyweight',
    desc: overrides?.desc ?? 'Tempo / Rest cue',
    completed: overrides?.completed ?? false,
  };
  return {
    id: `drill-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    kind: 'training-drill',
    key: 'Exercise',
    value: drill.name,
    drill,
  };
}

export function createChecklistGoalItem(text = '', checked = false): FlexibleItem {
  return {
    id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    kind: 'checklist-goal',
    key: 'Notes',
    value: text,
    goal: { text, checked },
  };
}

export function createKeyValueItem(key = 'Project', value: string | number = '', isCustomKey = false): FlexibleItem {
  if (key === 'Intensity (1-10)') {
    return {
      id: `int-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      kind: 'intensity',
      key: 'Intensity (1-10)',
      value: value !== '' ? Number(value) : 8,
    };
  }
  return {
    id: `kv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    kind: 'key-value',
    key,
    value,
    isCustomKey,
  };
}

/**
 * Helper to convert existing Task exercises, goals, and fields into unified FlexibleItem[]
 */
export function buildInitialFlexibleItems(
  category: 'training' | 'studying' | 'other',
  exercises?: ExerciseItem[],
  goals?: GoalItem[],
  fields?: TaskField[],
  studyType?: string,
  tag?: string
): FlexibleItem[] {
  const result: FlexibleItem[] = [];

  // 1. Add existing exercises as Training Drill cards
  if (Array.isArray(exercises) && exercises.length > 0) {
    exercises.forEach((ex, i) => {
      result.push(
        createTrainingDrillItem(i + 1, {
          name: ex.name || `Exercise ${i + 1}`,
          sets: ex.sets ?? 3,
          reps: ex.reps ?? 10,
          weight: ex.weight ?? 'Bodyweight',
          desc: ex.desc ?? 'Tempo / Rest cue',
          completed: ex.completed,
        })
      );
    });
  }

  // 2. Add existing goals as Checklist Goal cards
  if (Array.isArray(goals) && goals.length > 0) {
    goals.forEach((g) => {
      result.push(createChecklistGoalItem(g.text || '', Boolean(g.checked)));
    });
  }

  // 3. Add existing structured fields (skipping Exercise/Sets/Reps/Weight if already represented by a drill)
  if (Array.isArray(fields) && fields.length > 0) {
    const hasDrill = result.some((r) => r.kind === 'training-drill');
    const exField = fields.find((f) => f.key === 'Exercise');
    const setsField = fields.find((f) => f.key === 'Sets');
    const repsField = fields.find((f) => f.key === 'Reps');
    const weightField = fields.find((f) => f.key === 'Weight');

    if (!hasDrill && exField) {
      result.push(
        createTrainingDrillItem(1, {
          name: String(exField.value),
          sets: setsField && !isNaN(Number(setsField.value)) ? Number(setsField.value) : 3,
          reps: repsField && !isNaN(Number(repsField.value)) ? Number(repsField.value) : 10,
          weight: weightField ? String(weightField.value) : 'Bodyweight',
          desc: 'Tempo / Rest cue',
        })
      );
    }

    fields.forEach((f) => {
      if (
        (hasDrill || exField) &&
        (f.key === 'Exercise' || f.key === 'Sets' || f.key === 'Reps' || f.key === 'Weight')
      ) {
        return;
      }
      const isKnown = (ALLOWED_FIELD_KEYS as readonly string[]).includes(f.key);
      result.push(createKeyValueItem(f.key, f.value, !isKnown));
    });
  }

  // 4. Default items if starting fresh
  if (result.length === 0) {
    if (category === 'training') {
      result.push(createTrainingDrillItem(1));
    } else if (category === 'studying') {
      result.push({
        id: `st-${Date.now()}`,
        kind: 'study-type',
        key: 'Subject',
        value: studyType || 'Problem Set / Homework',
      });
      result.push(createChecklistGoalItem('', false));
      result.push(createKeyValueItem('Deck/Resource', ''));
    } else {
      result.push({
        id: `tag-${Date.now()}`,
        kind: 'category-tag',
        key: 'Project',
        value: tag || 'Life Admin',
      });
      result.push(createKeyValueItem('Project', ''));
      result.push(createChecklistGoalItem('', false));
    }
  }

  return result;
}

/**
 * Extracts Exercises, Goals, StudyType, CategoryTag, and Wkly TaskField[] from FlexibleItem[]
 */
export function compileFlexibleItems(items: FlexibleItem[]) {
  const exercises: ExerciseItem[] = [];
  const goals: GoalItem[] = [];
  const fields: TaskField[] = [];
  let extractedStudyType: string | undefined;
  let extractedTag: string | undefined;

  items.forEach((item, idx) => {
    if (item.kind === 'training-drill' && item.drill) {
      const drillName = item.drill.name.trim() || `Exercise ${exercises.length + 1}`;
      const drillSets = Number(item.drill.sets) || 3;
      const drillReps = Number(item.drill.reps) || 10;
      const drillWeight = item.drill.weight.trim() || 'Bodyweight';
      exercises.push({
        id: item.id || Date.now() + idx,
        name: drillName,
        sets: drillSets,
        reps: drillReps,
        weight: drillWeight,
        desc: item.drill.desc.trim() || `Weight: ${drillWeight}`,
        completed: Boolean(item.drill.completed),
      });
    } else if (item.kind === 'checklist-goal' && item.goal) {
      if (item.goal.text.trim() !== '') {
        goals.push({
          id: item.id || Date.now() + idx,
          text: item.goal.text.trim(),
          checked: Boolean(item.goal.checked),
        });
      }
    } else if (item.kind === 'study-type') {
      extractedStudyType = String(item.value);
    } else if (item.kind === 'category-tag') {
      extractedTag = String(item.value);
    } else if (item.kind === 'intensity') {
      fields.push({
        key: 'Intensity (1-10)',
        value: Number(item.value) || 8,
      });
    } else if (item.kind === 'key-value') {
      const cleanKey = item.key.trim();
      const cleanVal = String(item.value).trim();
      if (cleanKey !== '' && cleanVal !== '') {
        fields.push({
          key: cleanKey,
          value: NUMERIC_KEYS.has(cleanKey) && !isNaN(Number(cleanVal)) ? Number(cleanVal) : cleanVal,
        });
      }
    }
  });

  // Sync primary training drill into Wkly fields array for strict JSON schema compatibility
  if (exercises.length > 0) {
    const first = exercises[0];
    if (!fields.some((f) => f.key === 'Exercise')) {
      fields.unshift({ key: 'Exercise', value: first.name });
    }
    if (!fields.some((f) => f.key === 'Weight') && first.weight) {
      fields.push({ key: 'Weight', value: first.weight });
    }
    if (!fields.some((f) => f.key === 'Sets') && first.sets) {
      fields.push({ key: 'Sets', value: first.sets });
    }
    if (!fields.some((f) => f.key === 'Reps') && first.reps) {
      fields.push({ key: 'Reps', value: first.reps });
    }
  }

  return {
    exercises,
    goals,
    fields,
    studyType: extractedStudyType,
    tag: extractedTag,
  };
}

interface FlexibleFieldsSectionProps {
  items: FlexibleItem[];
  onChange: (nextItems: FlexibleItem[]) => void;
  label?: string;
}

export function FlexibleFieldsSection({
  items,
  onChange,
  label = 'Flexible Fields & Project Blocks',
}: FlexibleFieldsSectionProps) {
  const drillCount = items.filter((i) => i.kind === 'training-drill').length;

  const handleAddDrill = () => {
    onChange([...items, createTrainingDrillItem(drillCount + 1)]);
  };

  const handleAddGoal = () => {
    onChange([...items, createChecklistGoalItem('', false)]);
  };

  const handleAddKeyValue = (presetKey = 'Project', isCustom = false) => {
    onChange([...items, createKeyValueItem(presetKey, '', isCustom)]);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, idx) => idx !== index));
  };

  const handleSwitchType = (index: number, selection: string) => {
    const next = [...items];
    const current = next[index];

    if (selection === '__WIDGET_TRAINING__' || selection === 'Exercise') {
      const nextDrillNum = items.filter((i) => i.kind === 'training-drill').length + 1;
      next[index] = {
        id: current.id,
        kind: 'training-drill',
        key: 'Exercise',
        value: current.drill?.name || String(current.value || `Exercise ${nextDrillNum}`),
        drill: current.drill || {
          name: String(current.value || `Exercise ${nextDrillNum}`),
          sets: 3,
          reps: 10,
          weight: 'Bodyweight',
          desc: 'Tempo / Rest cue',
          completed: false,
        },
      };
    } else if (selection === '__WIDGET_GOAL__') {
      next[index] = {
        id: current.id,
        kind: 'checklist-goal',
        key: 'Notes',
        value: current.goal?.text || String(current.value || ''),
        goal: current.goal || {
          text: String(current.value || ''),
          checked: false,
        },
      };
    } else if (selection === '__WIDGET_STUDY_TYPE__') {
      next[index] = {
        id: current.id,
        kind: 'study-type',
        key: 'Subject',
        value: STUDY_BLOCK_TYPES.includes(String(current.value))
          ? String(current.value)
          : 'Problem Set / Homework',
      };
    } else if (selection === '__WIDGET_CATEGORY_TAG__') {
      next[index] = {
        id: current.id,
        kind: 'category-tag',
        key: 'Project',
        value: String(current.value || 'Life Admin'),
      };
    } else if (selection === 'Intensity (1-10)') {
      next[index] = {
        id: current.id,
        kind: 'intensity',
        key: 'Intensity (1-10)',
        value: !isNaN(Number(current.value)) && Number(current.value) >= 1 ? Number(current.value) : 8,
      };
    } else if (selection === '__CUSTOM__') {
      next[index] = {
        id: current.id,
        kind: 'key-value',
        key: '',
        value: current.value ?? '',
        isCustomKey: true,
      };
    } else {
      next[index] = {
        id: current.id,
        kind: 'key-value',
        key: selection,
        value: current.value ?? '',
        isCustomKey: false,
      };
    }

    onChange(next);
  };

  const updateDrillProp = (
    index: number,
    prop: keyof NonNullable<FlexibleItem['drill']>,
    val: any
  ) => {
    const next = [...items];
    const current = next[index];
    const updatedDrill = {
      ...(current.drill || {
        name: 'Exercise 1',
        sets: 3,
        reps: 10,
        weight: 'Bodyweight',
        desc: 'Tempo / Rest cue',
      }),
      [prop]: val,
    };
    next[index] = {
      ...current,
      value: updatedDrill.name,
      drill: updatedDrill,
    };
    onChange(next);
  };

  const updateGoalProp = (index: number, prop: 'text' | 'checked', val: any) => {
    const next = [...items];
    const current = next[index];
    const updatedGoal = {
      ...(current.goal || { text: '', checked: false }),
      [prop]: val,
    };
    next[index] = {
      ...current,
      value: updatedGoal.text,
      goal: updatedGoal,
    };
    onChange(next);
  };

  const updateKeyValue = (index: number, prop: 'key' | 'value', val: any) => {
    const next = [...items];
    next[index] = {
      ...next[index],
      [prop]: val,
    };
    onChange(next);
  };

  return (
    <div className="space-y-3 font-display">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-[#F3F4F6]">
          {label}
        </label>
        <span className="text-[10px] font-bold text-slate-500 dark:text-[#9CA3AF]">
          {items.length} {items.length === 1 ? 'block' : 'blocks'}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="p-4 bg-slate-50 dark:bg-[#10141C] border-2 border-dashed border-slate-300 dark:border-[#383F50] rounded-lg text-center text-xs text-slate-500 dark:text-[#9CA3AF] font-sans">
          No fields added yet. Click below to add a Training Drill (Sets × Reps × Wt), Checklist Goal, or Structured Field.
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item, idx) => {
            // 1. EXACT DESIGN FROM UPLOADED SCREENSHOT (Training Drill: Exercise 1, SETS, REPS, WT, Tempo / Rest cue)
            if (item.kind === 'training-drill') {
              const drill = item.drill || {
                name: 'Exercise 1',
                sets: 3,
                reps: 10,
                weight: 'Bodyweight',
                desc: 'Tempo / Rest cue',
              };
              return (
                <div
                  key={item.id || idx}
                  className="p-3 bg-white dark:bg-[#1E232E] border-2 border-black dark:border-[#383F50] rounded-lg neo-box-sm space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={drill.name}
                      placeholder={`Exercise ${idx + 1}`}
                      onChange={(e) => updateDrillProp(idx, 'name', e.target.value)}
                      className="flex-1 text-xs font-black text-slate-900 dark:text-[#F3F4F6] bg-transparent border-b-2 border-black/20 dark:border-[#383F50] pb-1 focus:outline-none focus:border-black dark:focus:border-[#A855F7]"
                    />
                    <select
                      value="__WIDGET_TRAINING__"
                      onChange={(e) => handleSwitchType(idx, e.target.value)}
                      title="Switch field widget type"
                      className="text-[10px] font-bold bg-[#FCF9F8] dark:bg-[#10141C] text-slate-600 dark:text-[#9CA3AF] border border-black/30 dark:border-[#383F50] rounded px-1.5 py-0.5 cursor-pointer focus:outline-none"
                    >
                      {FIELD_SELECTOR_OPTIONS.map((opt) => (
                        <option
                          key={opt.value}
                          value={opt.value}
                          className="bg-white dark:bg-[#161922] text-slate-900 dark:text-[#F3F4F6]"
                        >
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      title="Remove drill"
                      className="w-6 h-6 rounded bg-red-100 dark:bg-[#2A161D] hover:bg-red-200 border border-black dark:border-[#FB7185] flex items-center justify-center text-xs font-bold text-red-700 dark:text-[#FB7185] cursor-pointer flex-shrink-0"
                    >
                      <span className="material-symbols-outlined text-[13px] leading-none">close</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center justify-between bg-[#FCF9F8] dark:bg-[#10141C] border-2 border-black dark:border-[#383F50] rounded px-2 py-1 shadow-[1px_1px_0px_#000]">
                      <span className="text-[9px] font-black text-slate-500 dark:text-[#9CA3AF] uppercase">
                        Sets
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={drill.sets}
                        onChange={(e) =>
                          updateDrillProp(idx, 'sets', parseInt(e.target.value, 10) || 1)
                        }
                        className="w-10 text-right text-xs font-black text-slate-900 dark:text-[#F3F4F6] bg-transparent focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-between bg-[#FCF9F8] dark:bg-[#10141C] border-2 border-black dark:border-[#383F50] rounded px-2 py-1 shadow-[1px_1px_0px_#000]">
                      <span className="text-[9px] font-black text-slate-500 dark:text-[#9CA3AF] uppercase">
                        Reps
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={drill.reps}
                        onChange={(e) =>
                          updateDrillProp(idx, 'reps', parseInt(e.target.value, 10) || 1)
                        }
                        className="w-10 text-right text-xs font-black text-slate-900 dark:text-[#F3F4F6] bg-transparent focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-between bg-[#FCF9F8] dark:bg-[#10141C] border-2 border-black dark:border-[#383F50] rounded px-2 py-1 shadow-[1px_1px_0px_#000]">
                      <span className="text-[9px] font-black text-slate-500 dark:text-[#9CA3AF] uppercase mr-1">
                        Wt
                      </span>
                      <input
                        type="text"
                        value={drill.weight}
                        placeholder="Bodyweight"
                        onChange={(e) => updateDrillProp(idx, 'weight', e.target.value)}
                        className="w-full text-right text-xs font-black text-slate-900 dark:text-[#F3F4F6] bg-transparent focus:outline-none font-sans"
                      />
                    </div>
                  </div>

                  <input
                    type="text"
                    value={drill.desc}
                    placeholder="Tempo / Rest cue"
                    onChange={(e) => updateDrillProp(idx, 'desc', e.target.value)}
                    className="w-full text-[10px] text-slate-500 dark:text-[#9CA3AF] font-sans bg-transparent border-none focus:outline-none"
                  />
                </div>
              );
            }

            // 2. CHECKLIST / FOCUS GOAL ITEM (Matches StudyForm & OtherForm checklist row)
            if (item.kind === 'checklist-goal') {
              const goal = item.goal || { text: '', checked: false };
              return (
                <div
                  key={item.id || idx}
                  className="p-2.5 bg-white dark:bg-[#1E232E] border-2 border-black dark:border-[#383F50] rounded-lg neo-box-sm flex items-center gap-2"
                >
                  <input
                    type="checkbox"
                    checked={goal.checked}
                    onChange={(e) => updateGoalProp(idx, 'checked', e.target.checked)}
                    className="w-4 h-4 border-2 border-black dark:border-[#38BDF8] rounded accent-[#008096] dark:accent-[#38BDF8] cursor-pointer flex-shrink-0"
                  />
                  <input
                    type="text"
                    value={goal.text}
                    placeholder="Checklist goal / deliverable item..."
                    onChange={(e) => updateGoalProp(idx, 'text', e.target.value)}
                    className="flex-1 text-xs font-bold text-slate-900 dark:text-[#F3F4F6] bg-transparent border-none focus:outline-none font-sans"
                  />
                  <select
                    value="__WIDGET_GOAL__"
                    onChange={(e) => handleSwitchType(idx, e.target.value)}
                    className="text-[10px] font-bold bg-[#FCF9F8] dark:bg-[#10141C] text-slate-600 dark:text-[#9CA3AF] border border-black/30 dark:border-[#383F50] rounded px-1.5 py-0.5 cursor-pointer focus:outline-none"
                  >
                    {FIELD_SELECTOR_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#161922]">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    title="Remove goal"
                    className="w-6 h-6 rounded bg-red-100 dark:bg-[#2A161D] hover:bg-red-200 border border-black dark:border-[#FB7185] flex items-center justify-center text-xs font-bold text-red-700 dark:text-[#FB7185] cursor-pointer flex-shrink-0"
                  >
                    <span className="material-symbols-outlined text-[13px] leading-none">close</span>
                  </button>
                </div>
              );
            }

            // 3. STUDY BLOCK TYPE PILL SELECTOR (Matches StudyForm.tsx)
            if (item.kind === 'study-type') {
              return (
                <div
                  key={item.id || idx}
                  className="p-3 bg-white dark:bg-[#1E232E] border-2 border-black dark:border-[#383F50] rounded-lg neo-box-sm space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-[#38BDF8] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] leading-none">menu_book</span>
                      <span>Study Block Type</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <select
                        value="__WIDGET_STUDY_TYPE__"
                        onChange={(e) => handleSwitchType(idx, e.target.value)}
                        className="text-[10px] font-bold bg-[#FCF9F8] dark:bg-[#10141C] text-slate-600 dark:text-[#9CA3AF] border border-black/30 dark:border-[#383F50] rounded px-1.5 py-0.5 cursor-pointer focus:outline-none"
                      >
                        {FIELD_SELECTOR_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#161922]">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        className="w-6 h-6 rounded bg-red-100 dark:bg-[#2A161D] hover:bg-red-200 border border-black dark:border-[#FB7185] flex items-center justify-center text-xs font-bold text-red-700 dark:text-[#FB7185] cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[13px] leading-none">close</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {STUDY_BLOCK_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => updateKeyValue(idx, 'value', type)}
                        className={`px-2.5 py-1 border-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          item.value === type
                            ? 'bg-[#8B5CF6] dark:bg-[#A855F7] text-white dark:text-[#0B0D11] border-black dark:border-white shadow-[2px_2px_0px_#000]'
                            : 'bg-[#FCF9F8] dark:bg-[#10141C] text-slate-800 dark:text-[#F3F4F6] border-black dark:border-[#383F50]'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              );
            }

            // 4. CATEGORY TAG ICON GRID (Matches OtherForm.tsx)
            if (item.kind === 'category-tag') {
              return (
                <div
                  key={item.id || idx}
                  className="p-3 bg-white dark:bg-[#1E232E] border-2 border-black dark:border-[#383F50] rounded-lg neo-box-sm space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-[#FBBF24] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] leading-none">label</span>
                      <span>Category Tag</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <select
                        value="__WIDGET_CATEGORY_TAG__"
                        onChange={(e) => handleSwitchType(idx, e.target.value)}
                        className="text-[10px] font-bold bg-[#FCF9F8] dark:bg-[#10141C] text-slate-600 dark:text-[#9CA3AF] border border-black/30 dark:border-[#383F50] rounded px-1.5 py-0.5 cursor-pointer focus:outline-none"
                      >
                        {FIELD_SELECTOR_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#161922]">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        className="w-6 h-6 rounded bg-red-100 dark:bg-[#2A161D] hover:bg-red-200 border border-black dark:border-[#FB7185] flex items-center justify-center text-xs font-bold text-red-700 dark:text-[#FB7185] cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[13px] leading-none">close</span>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {OTHER_CATEGORY_TAGS.map((t) => (
                      <button
                        key={t.name}
                        type="button"
                        onClick={() => updateKeyValue(idx, 'value', t.name)}
                        className={`p-2 text-left border-2 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          item.value === t.name
                            ? 'bg-yellow-300 dark:bg-[#292312] text-slate-900 dark:text-[#FBBF24] border-black dark:border-[#FBBF24] font-black shadow-[2px_2px_0px_#000]'
                            : 'bg-[#FCF9F8] dark:bg-[#10141C] text-slate-800 dark:text-[#F3F4F6] border-black dark:border-[#383F50] font-bold'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
                        <span className="truncate">{t.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            }

            // 5. INTENSITY / RPE (1-10) WIDGET
            if (item.kind === 'intensity') {
              const currentInt = Number(item.value) || 8;
              return (
                <div
                  key={item.id || idx}
                  className="p-3 bg-white dark:bg-[#1E232E] border-2 border-black dark:border-[#383F50] rounded-lg neo-box-sm space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-[#FB7185] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] leading-none">bolt</span>
                      <span>Intensity / RPE (1–10): <span className="font-mono">{currentInt}/10</span></span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <select
                        value="Intensity (1-10)"
                        onChange={(e) => handleSwitchType(idx, e.target.value)}
                        className="text-[10px] font-bold bg-[#FCF9F8] dark:bg-[#10141C] text-slate-600 dark:text-[#9CA3AF] border border-black/30 dark:border-[#383F50] rounded px-1.5 py-0.5 cursor-pointer focus:outline-none"
                      >
                        {FIELD_SELECTOR_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#161922]">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        className="w-6 h-6 rounded bg-red-100 dark:bg-[#2A161D] hover:bg-red-200 border border-black dark:border-[#FB7185] flex items-center justify-center text-xs font-bold text-red-700 dark:text-[#FB7185] cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[13px] leading-none">close</span>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-10 gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => updateKeyValue(idx, 'value', num)}
                        className={`py-1 rounded border-2 font-mono text-xs font-black transition-all cursor-pointer ${
                          currentInt === num
                            ? 'bg-[#FFE4E6] dark:bg-[#2A161D] text-slate-900 dark:text-[#FB7185] border-black dark:border-[#FB7185] shadow-[1px_1px_0px_#000]'
                            : 'bg-[#FCF9F8] dark:bg-[#10141C] text-slate-600 dark:text-[#9CA3AF] border-black/40 dark:border-[#383F50]'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              );
            }

            // 6. STRUCTURED KEY-VALUE OR CUSTOM FIELD CARD (Matches Neo-Brutalist Box Design)
            const isNumeric = NUMERIC_KEYS.has(item.key);
            return (
              <div
                key={item.id || idx}
                className="p-2.5 bg-white dark:bg-[#1E232E] border-2 border-black dark:border-[#383F50] rounded-lg neo-box-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2"
              >
                {item.isCustomKey ? (
                  <div className="flex items-center gap-1 sm:w-56">
                    <input
                      type="text"
                      value={item.key}
                      placeholder="Custom Field Name..."
                      onChange={(e) => updateKeyValue(idx, 'key', e.target.value)}
                      className="flex-1 text-xs font-black px-2.5 py-1.5 bg-[#FCF9F8] dark:bg-[#10141C] border-2 border-black dark:border-[#383F50] rounded shadow-[1px_1px_0px_#000] focus:outline-none"
                    />
                    <button
                      type="button"
                      title="Switch to preset field or widget"
                      onClick={() => handleSwitchType(idx, 'Project')}
                      className="px-2 py-1.5 bg-[#FCF9F8] dark:bg-[#10141C] border-2 border-black dark:border-[#383F50] rounded text-[10px] font-black cursor-pointer flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-[14px] leading-none">arrow_drop_down</span>
                    </button>
                  </div>
                ) : (
                  <select
                    value={item.key}
                    onChange={(e) => handleSwitchType(idx, e.target.value)}
                    className="sm:w-56 text-xs font-black px-2.5 py-1.5 bg-[#FCF9F8] dark:bg-[#10141C] text-slate-900 dark:text-[#F3F4F6] border-2 border-black dark:border-[#383F50] rounded shadow-[1px_1px_0px_#000] cursor-pointer focus:outline-none"
                  >
                    {FIELD_SELECTOR_OPTIONS.map((opt) => (
                      <option
                        key={opt.value}
                        value={opt.value}
                        className="bg-white dark:bg-[#161922] text-slate-900 dark:text-[#F3F4F6]"
                      >
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}

                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    inputMode={isNumeric ? 'numeric' : 'text'}
                    pattern={isNumeric ? '[0-9]*' : undefined}
                    value={item.value}
                    placeholder={
                      item.key === 'Duration (mins)'
                        ? 'e.g. 45, 60, 90 (numbers only)'
                        : item.key === 'Subject'
                        ? 'e.g. Japanese, Organic Chemistry II'
                        : item.key === 'Deck/Resource'
                        ? 'e.g. Kaishi 1.5k Anki Deck'
                        : item.key === 'Project'
                        ? 'e.g. MERN Application'
                        : item.key === 'Tech Stack'
                        ? 'e.g. Node.js, Express, React'
                        : item.key === 'Committee'
                        ? 'e.g. MUN Head OC'
                        : isNumeric
                        ? 'Enter numbers only...'
                        : `Enter ${item.key || 'field'} value...`
                    }
                    onKeyDown={(e) => {
                      if (!isNumeric) return;
                      const allowedKeys = [
                        'Backspace',
                        'Delete',
                        'ArrowLeft',
                        'ArrowRight',
                        'Tab',
                        'Enter',
                        'Home',
                        'End',
                      ];
                      if (
                        !allowedKeys.includes(e.key) &&
                        !e.ctrlKey &&
                        !e.metaKey &&
                        !/^[0-9]$/.test(e.key)
                      ) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (isNumeric) {
                        const digits = raw.replace(/\D/g, '');
                        updateKeyValue(idx, 'value', digits === '' ? '' : Number(digits));
                      } else {
                        updateKeyValue(idx, 'value', raw);
                      }
                    }}
                    className="flex-1 text-xs font-bold text-slate-900 dark:text-[#F3F4F6] bg-[#FCF9F8] dark:bg-[#10141C] border-2 border-black dark:border-[#383F50] rounded px-2.5 py-1.5 shadow-[1px_1px_0px_#000] focus:outline-none font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    title="Remove field"
                    className="w-6 h-6 rounded bg-red-100 dark:bg-[#2A161D] hover:bg-red-200 border border-black dark:border-[#FB7185] flex items-center justify-center text-xs font-bold text-red-700 dark:text-[#FB7185] cursor-pointer flex-shrink-0"
                  >
                    <span className="material-symbols-outlined text-[13px] leading-none">close</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Buttons matching TrainingForm / StudyForm / OtherForm dashed button aesthetic */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
        <button
          type="button"
          onClick={handleAddDrill}
          className="py-2 px-3 bg-[#F6F3F2] dark:bg-[#1E232E] hover:bg-[#FFE4E6] dark:hover:bg-[#2A161D] border-2 border-dashed border-black dark:border-[#FB7185] rounded-lg text-xs font-black text-slate-800 dark:text-[#F3F4F6] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[15px] leading-none">add</span>
          <span>Add Exercise Drill</span>
        </button>

        <button
          type="button"
          onClick={handleAddGoal}
          className="py-2 px-3 bg-[#F6F3F2] dark:bg-[#1E232E] hover:bg-[#BAE6FD] dark:hover:bg-[#132637] border-2 border-dashed border-black dark:border-[#38BDF8] rounded-lg text-xs font-black text-slate-800 dark:text-[#F3F4F6] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[15px] leading-none">add</span>
          <span>Add Checklist Goal</span>
        </button>

        <button
          type="button"
          onClick={() => handleAddKeyValue('Project', false)}
          className="py-2 px-3 bg-[#F6F3F2] dark:bg-[#1E232E] hover:bg-[#FEF08A] dark:hover:bg-[#292312] border-2 border-dashed border-black dark:border-[#FBBF24] rounded-lg text-xs font-black text-slate-800 dark:text-[#F3F4F6] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[15px] leading-none">add</span>
          <span>Add Flexible Field</span>
        </button>
      </div>
    </div>
  );
}
