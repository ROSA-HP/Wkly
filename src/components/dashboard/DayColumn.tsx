import { Task, ModalState, DayOfWeek } from '../../types';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`p-2.5 ${task.colorTint} border-2 border-black rounded-lg neo-box-sm neo-btn cursor-pointer font-display flex flex-col gap-1`}
    >
      <div className="flex items-center justify-between text-[10px] font-black mb-1">
        <span className="bg-white px-1.5 py-0.5 border border-black rounded">
          {task.category}
        </span>
        <span className="text-slate-700">{task.time.split(' ')[0]}</span>
      </div>
      <h4 className="font-extrabold text-xs leading-tight">{task.title}</h4>
      <p className="text-[10px] text-slate-600 font-medium font-sans mt-auto">{task.subtitle}</p>
    </div>
  );
}

interface DayColumnProps {
  day: { name: DayOfWeek; date: number; isToday?: boolean };
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: () => void;
}

export function DayColumn({ day, tasks, onTaskClick, onAddTask }: DayColumnProps) {
  const shortName = day.name.substring(0, 3).toUpperCase();
  
  return (
    <div className={`bg-white border-2 border-black rounded-xl p-3 flex flex-col justify-between ${day.isToday ? 'neo-box-active relative' : 'neo-box'}`}>
      <div>
        <div className="flex justify-between items-baseline border-b-2 border-black pb-2 mb-3 font-display">
          {day.isToday ? (
            <>
              <div className="flex items-center gap-1">
                <span className="text-xs font-extrabold text-[#8b5cf6] tracking-wider">{shortName}</span>
                <span className="w-2 h-2 rounded-full bg-[#8b5cf6]"></span>
              </div>
              <span className="text-xs font-black bg-[#8b5cf6] text-white px-2 py-0.5 rounded border border-black">{day.date} TODAY</span>
            </>
          ) : (
             <>
               <span className="text-xs font-extrabold text-slate-500 tracking-wider">{shortName}</span>
               <span className="text-lg font-black">{day.date}</span>
             </>
          )}
        </div>
        
        <div className="space-y-2.5">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
          
          <button 
            onClick={onAddTask}
            className={`w-full py-2 border-2 border-dashed rounded-lg text-[10px] font-display font-extrabold transition-colors ${
              day.isToday 
                ? 'border-[#8b5cf6] bg-[#f5f3ff] text-[#8b5cf6] hover:bg-[#ede9fe]' 
                : 'border-black text-slate-500 hover:text-black hover:bg-slate-50'
            }`}
          >
            + ADD TASK
          </button>
        </div>
      </div>
      
      <div className={`pt-4 mt-4 border-t-2 text-[10px] text-center font-display font-bold ${
        day.isToday ? 'border-purple-100 text-[#8b5cf6]' : 'border-slate-100 text-slate-400'
      }`}>
        {tasks.length} ACTIVITY{tasks.length !== 1 ? 'IES' : ''}
      </div>
    </div>
  );
}
