import { Task } from './types';
import { getYmdForDayOfWeek } from './utils/dateUtils';

export const initialTasks: Task[] = [
  {
    id: 'seed-1',
    title: 'Clean & Jerk + Heavy Back Squats',
    category: 'TRAINING',
    day: 'Monday',
    date: getYmdForDayOfWeek('Monday'),
    time: '07:00 AM',
    duration: '75 min',
    colorTint: 'bg-[#fce7f3]',
    subtitle: 'BLOCK A • STRENGTH PEAK',
    details: {
      notes: 'Focus on explosive hip drive in second pull. Keep core braced through full squat depth.',
      exercises: [
        { id: 101, name: 'Snatch High Pulls', desc: 'Explosive triple extension', sets: 4, reps: 3, rpe: 'RPE 8.0', rpeColor: 'bg-emerald-100 text-emerald-900', completed: true },
        { id: 102, name: 'Clean & Jerk', desc: 'Ascending load to working weight', sets: 5, reps: 2, rpe: 'RPE 8.5', rpeColor: 'bg-yellow-100 text-yellow-900', completed: true },
        { id: 103, name: 'Barbell Back Squats', desc: 'Pause at bottom 1 second', sets: 4, reps: 5, rpe: 'RPE 9.0', rpeColor: 'bg-red-100 text-red-900', completed: false }
      ]
    }
  },
  {
    id: 'seed-2',
    title: 'Biomechanics Lab & Kinematics',
    category: 'STUDYING',
    day: 'Monday',
    date: getYmdForDayOfWeek('Monday'),
    time: '14:00 PM',
    duration: '90 min',
    colorTint: 'bg-[#bae6fd]',
    subtitle: 'Midterm Prep',
    details: {
      studyType: 'Problem Set / Homework',
      notes: 'Exam covers chapters 4-7: angular kinematics, force plates, and torque vectors.',
      goals: [
        { id: 201, text: 'Review gait analysis lecture notes', checked: true },
        { id: 202, text: 'Complete angular kinematics problem set 4', checked: false },
        { id: 203, text: 'Draft lab report conclusion', checked: false }
      ]
    }
  },
  {
    id: 'seed-3',
    title: 'Upper Body Plyometrics & Core',
    category: 'TRAINING',
    day: 'Tuesday',
    date: getYmdForDayOfWeek('Tuesday'),
    time: '08:30 AM',
    duration: '60 min',
    colorTint: 'bg-[#fce7f3]',
    subtitle: 'EXPLOSIVE VELOCITY',
    details: {
      notes: 'Rest 90 seconds between plyo sets to ensure maximal recruitment.',
      exercises: [
        { id: 301, name: 'Medicine Ball Chest Slams', desc: 'Maximum explosive velocity', sets: 4, reps: 6, rpe: 'RPE 8.0', rpeColor: 'bg-emerald-100 text-emerald-900', completed: true },
        { id: 302, name: 'Banded Push Press', desc: 'Focus on bar speed', sets: 4, reps: 4, rpe: 'RPE 8.5', rpeColor: 'bg-yellow-100 text-yellow-900', completed: false },
        { id: 303, name: 'Hanging Leg Raises', desc: 'Controlled negative', sets: 3, reps: 12, rpe: 'RPE 7.5', rpeColor: 'bg-emerald-100 text-emerald-900', completed: false }
      ]
    }
  },
  {
    id: 'seed-4',
    title: 'Calculus II: Multivariable Integrals',
    category: 'STUDYING',
    day: 'Tuesday',
    date: getYmdForDayOfWeek('Tuesday'),
    time: '11:00 AM',
    duration: '90 min',
    colorTint: 'bg-[#bae6fd]',
    subtitle: 'Problem Set #5',
    details: {
      studyType: 'Exam Prep / Review',
      notes: 'Office hours at 3 PM if struggling with spherical coordinates conversion.',
      goals: [
        { id: 401, text: 'Solve triple integrals section 14.3', checked: true },
        { id: 402, text: 'Review Green theorem examples and proof', checked: false },
        { id: 403, text: 'Submit WebAssign assignment by 11:59 PM', checked: false }
      ]
    }
  },
  {
    id: 'seed-5',
    title: 'Team Strategy & Video Breakdown',
    category: 'OTHER',
    day: 'Tuesday',
    date: getYmdForDayOfWeek('Tuesday'),
    time: '16:00 PM',
    duration: '45 min',
    colorTint: 'bg-[#fed7aa]',
    subtitle: 'Team Logistics & Travel',
    details: {
      tag: 'Team Logistics & Travel',
      notes: 'Review rival team offensive press film in team auditorium. Bring scouting tablet.',
      goals: [
        { id: 501, text: 'Pack scouting tablet and notebook', checked: false },
        { id: 502, text: 'Review transition defense clips before meeting', checked: false }
      ]
    }
  },
  {
    id: 'seed-6',
    title: 'Active Recovery & Mobility Flow',
    category: 'TRAINING',
    day: 'Wednesday',
    date: getYmdForDayOfWeek('Wednesday'),
    time: '09:00 AM',
    duration: '45 min',
    colorTint: 'bg-[#bbf7d0]',
    subtitle: 'CNS RECOVERY',
    details: {
      notes: 'Low intensity, focus on diaphragmatic breathing and opening hip flexors.',
      exercises: [
        { id: 601, name: 'Foam Rolling IT Band & Quads', desc: '2 min per muscle group', sets: 1, reps: 1, rpe: 'RPE 5.0', rpeColor: 'bg-emerald-100 text-emerald-900', completed: false },
        { id: 602, name: '90/90 Hip Mobility Flow', desc: 'Controlled rotation', sets: 3, reps: 10, rpe: 'RPE 5.5', rpeColor: 'bg-emerald-100 text-emerald-900', completed: false }
      ]
    }
  },
  {
    id: 'seed-7',
    title: 'Organic Chemistry Quiz Prep',
    category: 'STUDYING',
    day: 'Wednesday',
    date: getYmdForDayOfWeek('Wednesday'),
    time: '15:30 PM',
    duration: '120 min',
    colorTint: 'bg-[#bae6fd]',
    subtitle: 'Reaction Mechanisms',
    details: {
      studyType: 'Problem Set / Homework',
      notes: 'Master arrow pushing for nucleophilic substitution reactions.',
      goals: [
        { id: 701, text: 'Practice SN1 vs SN2 reaction pathways', checked: true },
        { id: 702, text: 'Flashcards on carbonyl additions', checked: false }
      ]
    }
  },
  {
    id: 'seed-8',
    title: 'Speed & Agility Acceleration Gates',
    category: 'TRAINING',
    day: 'Thursday',
    date: getYmdForDayOfWeek('Thursday'),
    time: '07:30 AM',
    duration: '60 min',
    colorTint: 'bg-[#fce7f3]',
    subtitle: 'MAX VELOCITY',
    details: {
      notes: 'Laser timed 10m and 20m splits. Full recovery between sprints.',
      exercises: [
        { id: 801, name: '10m Sled Sprints', desc: '10% bodyweight resistance', sets: 5, reps: 1, rpe: 'RPE 9.0', rpeColor: 'bg-red-100 text-red-900', completed: false },
        { id: 802, name: 'Flying 20m Acceleration', desc: 'Target under 2.80s split', sets: 4, reps: 1, rpe: 'RPE 9.5', rpeColor: 'bg-red-100 text-red-900', completed: false }
      ]
    }
  },
  {
    id: 'seed-9',
    title: 'Sports Psychology Visualization & Breathwork',
    category: 'OTHER',
    day: 'Thursday',
    date: getYmdForDayOfWeek('Thursday'),
    time: '18:30 PM',
    duration: '45 min',
    colorTint: 'bg-[#fed7aa]',
    subtitle: 'Mindset & Meditation',
    details: {
      tag: 'Mindset & Meditation',
      notes: 'Pre-match autonomic down-regulation. Box breathing: 4s inhale, 4s hold, 4s exhale, 4s hold.',
      goals: [
        { id: 901, text: '15 min box breathing session', checked: false },
        { id: 902, text: 'Pack high-carb electrolyte bottles for Friday', checked: false }
      ]
    }
  },
  {
    id: 'seed-10',
    title: 'Pre-Game Primer & Match Lift',
    category: 'TRAINING',
    day: 'Friday',
    date: getYmdForDayOfWeek('Friday'),
    time: '10:00 AM',
    duration: '45 min',
    colorTint: 'bg-[#fce7f3]',
    subtitle: 'NEURAL POTENTIATION',
    details: {
      notes: 'Do not fatigue. Keep bar speed maximum.',
      exercises: [
        { id: 1001, name: 'Trap Bar Jump Squats', desc: 'Explosive vertical jump', sets: 3, reps: 3, rpe: 'RPE 7.0', rpeColor: 'bg-emerald-100 text-emerald-900', completed: false },
        { id: 1002, name: 'Speed Power Cleans', desc: 'Catch high and crisp', sets: 3, reps: 2, rpe: 'RPE 7.5', rpeColor: 'bg-emerald-100 text-emerald-900', completed: false }
      ]
    }
  },
  {
    id: 'seed-11',
    title: 'Academic Advisor Check-in',
    category: 'OTHER',
    day: 'Friday',
    date: getYmdForDayOfWeek('Friday'),
    time: '14:00 PM',
    duration: '30 min',
    colorTint: 'bg-[#fed7aa]',
    subtitle: 'Life Admin',
    details: {
      tag: 'Life Admin',
      notes: 'Confirm NCAA eligibility credits for spring semester schedule.',
      goals: [
        { id: 1101, text: 'Print current unofficial degree audit', checked: false }
      ]
    }
  }
];
