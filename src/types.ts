export type ViewState = 'login' | 'dashboard';
export type ModalState = null | 'training-form' | 'study-form' | 'other-form' | 'training-details' | 'study-details';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type TaskCategory = 'TRAINING' | 'STUDYING' | 'RECOVERY' | 'OTHER';

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  day: DayOfWeek;
  time: string; // e.g., '07:00 AM'
  duration: string; // e.g., '60 min'
  colorTint: string; // e.g., 'bg-neo-pink', 'bg-neo-blue'
  subtitle: string;
  details?: any; // Specific details based on category
}
