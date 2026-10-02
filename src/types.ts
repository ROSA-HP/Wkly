export type ViewState = 'login' | 'dashboard';
export type ModalState =
  | null
  | 'task-chooser'
  | 'new-task-modal'
  | 'training-form'
  | 'study-form'
  | 'other-form'
  | 'training-details'
  | 'study-details'
  | 'other-details';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type TaskCategory = 'TRAINING' | 'STUDYING' | 'RECOVERY' | 'OTHER';
export type WklyCategory = 'studying' | 'training' | 'other';

export type AllowedColorName =
  | 'Pink'
  | 'Blue'
  | 'Green'
  | 'Yellow'
  | 'Lavender'
  | 'Peach'
  | 'Mint'
  | 'Coral'
  | 'Lilac'
  | 'Soft Gray';

export type AllowedFieldKey =
  | 'Subject'
  | 'Duration (mins)'
  | 'Exercise'
  | 'Weight'
  | 'Sets'
  | 'Reps'
  | 'Project'
  | 'Hardware Used'
  | 'Tech Stack'
  | 'Committee'
  | 'Deck/Resource'
  | 'Intensity (1-10)'
  | 'Deadline'
  | 'Notes';

export type CanvasFieldType = 'text' | 'number' | 'checklist' | 'longText';
export type CanvasLayoutSize = 'full-width' | 'half-width';

export interface CanvasChecklistItem {
  id?: string | number;
  text: string;
  checked: boolean;
}

export interface CanvasField {
  id?: string | number;
  label: string;
  value: string | number | string[] | CanvasChecklistItem[];
  type: CanvasFieldType;
  layoutSize: CanvasLayoutSize;
  unit?: string;
  subtitle?: string;
}

export interface WklyFixedData {
  taskName: string;
  day: string; // YYYY-MM-DD
  startingTime: string; // HH:MM in 24h format
  durationMinutes: number;
  color: AllowedColorName;
}

export interface WklyCanvasTaskJSON {
  fixedData: WklyFixedData;
  canvasFields: CanvasField[];
}

export interface TaskField {
  key: AllowedFieldKey | string;
  value: string | number;
}

export interface WklyTaskJSON {
  taskName: string;
  category: WklyCategory;
  color: AllowedColorName;
  date: string; // ISO 8601 date string in 2026
  fields: TaskField[];
}

export interface ExerciseItem {
  id: number | string;
  name: string;
  weight?: string;
  desc?: string;
  sets?: number;
  reps?: number;
  rpe?: string;
  rpeColor?: string;
  completed?: boolean;
}

export interface GoalItem {
  id: number | string;
  text: string;
  checked?: boolean;
}

export interface TaskDetails {
  exercises?: ExerciseItem[];
  goals?: GoalItem[];
  notes?: string;
  studyType?: string;
  tag?: string;
  fields?: TaskField[];
  fixedData?: WklyFixedData;
  canvasFields?: CanvasField[];
  color?: AllowedColorName;
  isoDate?: string;
  [key: string]: any;
}

export interface Task {
  id: string;
  title: string;
  taskName?: string;
  category: TaskCategory;
  day: DayOfWeek;
  time: string; // e.g., '07:00 AM'
  duration: string; // e.g., '60 min'
  colorTint: string; // e.g., 'bg-neo-pink', 'bg-neo-blue'
  color?: AllowedColorName;
  date?: string;
  fields?: TaskField[];
  fixedData?: WklyFixedData;
  canvasFields?: CanvasField[];
  subtitle: string;
  completed?: boolean;
  details?: TaskDetails; // Specific details based on category
}

