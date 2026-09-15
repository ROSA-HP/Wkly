import { Task, DayOfWeek, ModalState } from '../../types';
import { DayColumn } from '../dashboard/DayColumn';
import { FabMenu } from '../dashboard/FabMenu';

interface DashboardViewProps {
  tasks: Task[];
  onOpenModal: (modal: ModalState) => void;
  onTaskClick: (task: Task) => void;
}

const WEEK_DAYS: { name: DayOfWeek; date: number; isToday?: boolean }[] = [
  { name: 'Monday', date: 14 },
  { name: 'Tuesday', date: 15, isToday: true },
  { name: 'Wednesday', date: 16 },
  { name: 'Thursday', date: 17 },
  { name: 'Friday', date: 18 },
  { name: 'Saturday', date: 19 },
  { name: 'Sunday', date: 20 },
];

export function DashboardView({ tasks, onOpenModal, onTaskClick }: DashboardViewProps) {
  const getTasksForDay = (dayName: DayOfWeek) => tasks.filter(task => task.day === dayName);
  
  const trainingCount = tasks.filter(task => task.category === 'TRAINING').length;
  const studyCount = tasks.filter(task => task.category === 'STUDYING').length;
  const otherCount = tasks.filter(task => task.category === 'OTHER').length;

  return (
    <section className="flex-1 flex flex-col relative min-h-screen animate-in fade-in duration-300">
      {/* Top App Navigation / Status Bar */}
      <div className="bg-white border-b-2 border-black px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 font-display">
        <div className="flex items-center gap-4">
          <h2 className="text-lg md:text-xl font-extrabold uppercase tracking-tight">Rosa's Weekly Plan</h2>
          <div className="flex items-center border-2 border-black rounded overflow-hidden shadow-[2px_2px_0px_#000] text-xs font-bold">
            <button className="px-2 py-1 bg-white hover:bg-slate-100 border-r border-black">‹</button>
            <span className="px-3 py-1 bg-white">SEP 14 – SEP 20, 2026</span>
            <button className="px-2 py-1 bg-white hover:bg-slate-100 border-l border-black">›</button>
          </div>
        </div>
        
        <div className="flex items-center gap-3 hidden sm:flex">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-200 border-2 border-black rounded-full font-bold text-xs shadow-[2px_2px_0px_#000]">
            <span>⚡</span> 12 DAY STREAK
          </div>
          <button className="w-8 h-8 rounded-full bg-[#fce7f3] border-2 border-black font-black text-xs flex items-center justify-center shadow-[2px_2px_0px_#000]">
            RP
          </button>
        </div>
      </div>

      {/* Subheader Filter Pills */}
      <div className="bg-[#fcf9f8] border-b-2 border-black px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-bold font-display">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-custom pb-1">
          <span className="text-slate-500 uppercase tracking-wider text-[10px] font-black mr-1">Views:</span>
          <button className="px-3 py-1 bg-yellow-200 border-2 border-black rounded shadow-[2px_2px_0px_#000] whitespace-nowrap">ALL CATEGORIES</button>
          <button className="px-3 py-1 bg-white hover:bg-slate-50 border-2 border-black rounded shadow-[2px_2px_0px_#000] whitespace-nowrap">TRAINING ({trainingCount})</button>
          <button className="px-3 py-1 bg-white hover:bg-slate-50 border-2 border-black rounded shadow-[2px_2px_0px_#000] whitespace-nowrap">STUDYING ({studyCount})</button>
          <button className="px-3 py-1 bg-white hover:bg-slate-50 border-2 border-black rounded shadow-[2px_2px_0px_#000] whitespace-nowrap">OTHER ({otherCount})</button>
        </div>
        <div className="text-slate-600 font-semibold whitespace-nowrap">
          <span className="font-bold text-black">{tasks.length}</span> scheduled sessions
        </div>
      </div>

      {/* 7-Day Grid */}
      <div className="flex-1 p-6 overflow-x-auto scrollbar-custom">
        <div className="grid grid-cols-7 gap-4 min-w-[1100px] items-stretch pb-24">
          {WEEK_DAYS.map((day) => (
            <DayColumn 
              key={day.name}
              day={day} 
              tasks={getTasksForDay(day.name)} 
              onTaskClick={onTaskClick}
              onAddTask={() => onOpenModal('training-form')} // Simplified for demo
            />
          ))}
        </div>
      </div>

      <FabMenu onOpenModal={onOpenModal} />
    </section>
  );
}
