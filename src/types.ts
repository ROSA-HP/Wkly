export type ViewState = 'login' | 'dashboard';
export type ModalState = null | 'training-form' | 'study-form' | 'other-form' | 'training-details' | 'study-details' | 'other-details';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type TaskCategory = 'TRAINING' | 'STUDYING' | 'RECOVERY' | 'OTHER';

export interface ExerciseItem {
  id: number | string;
  name: string;
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
  [key: string]: any;
}

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  day: DayOfWeek;
  time: string; // e.g., '07:00 AM'
  duration: string; // e.g., '60 min'
  colorTint: string; // e.g., 'bg-neo-pink', 'bg-neo-blue'
  subtitle: string;
  completed?: boolean;
  details?: TaskDetails; // Specific details based on category
}
