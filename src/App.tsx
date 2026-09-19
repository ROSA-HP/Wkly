import { useState, useEffect } from 'react';
import { ViewState, ModalState, Task, DayOfWeek } from './types';
import { Header } from './components/layout/Header';
import { LoginView } from './components/views/LoginView';
import { DashboardView } from './components/views/DashboardView';
import { ModalContainer } from './components/modals/ModalContainer';
import { TrainingForm } from './components/modals/TrainingForm';
import { StudyForm } from './components/modals/StudyForm';
import { OtherForm } from './components/modals/OtherForm';
import { TrainingDetails } from './components/modals/TrainingDetails';
import { StudyDetails } from './components/modals/StudyDetails';
import { OtherDetails } from './components/modals/OtherDetails';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>(() => {
    return localStorage.getItem('token') ? 'dashboard' : 'login';
  });
  const [activeModal, setActiveModal] = useState<ModalState>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Tuesday');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentView === 'dashboard') {
      fetchTasks();
    }
  }, [currentView]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCurrentView('login');
        return;
      }
      
      const res = await fetch('/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error('Not authorized');
      
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      localStorage.removeItem('token');
      setCurrentView('login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    setCurrentView('dashboard');
  };

  const handleReset = () => {
    localStorage.removeItem('token');
    setCurrentView('login');
    setActiveModal(null);
    setActiveTask(null);
    setTasks([]);
  };

  // Handles both creating a new task or updating an existing one in the database
  const handleSaveTask = async (taskData: Omit<Task, 'id'>) => {
    try {
      const token = localStorage.getItem('token');
      if (activeTask && activeTask.id) {
        // UPDATE existing task
        const res = await fetch(`/api/tasks/${activeTask.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(taskData)
        });
        const updatedTask = await res.json();
        setTasks(prev => prev.map(t => t.id === activeTask.id ? { ...t, ...updatedTask } : t));
      } else {
        // CREATE new task
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(taskData)
        });
        const savedTask = await res.json();
        setTasks(prev => [...prev, savedTask]);
      }
      setActiveModal(null);
      setActiveTask(null);
    } catch (err) {
      console.error('Failed to save task:', err);
    }
  };

  // Real-time checklist toggle update to MongoDB
  const handleUpdateTask = async (taskId: string, updatedFields: Partial<Task>) => {
    try {
      const token = localStorage.getItem('token');
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updatedFields } : t));
      if (activeTask && activeTask.id === taskId) {
        setActiveTask(prev => prev ? { ...prev, ...updatedFields } : null);
      }

      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedFields)
      });
    } catch (err) {
      console.error('Failed to update task checklist:', err);
    }
  };

  const handleTaskClick = (task: Task) => {
    setActiveTask(task);
    if (task.category === 'TRAINING') {
      setActiveModal('training-details');
    } else if (task.category === 'STUDYING') {
      setActiveModal('study-details');
    } else {
      setActiveModal('other-details');
    }
  };

  const handleAddTaskOnDay = (day: DayOfWeek) => {
    setSelectedDay(day);
    setActiveTask(null);
    // User request: when user presses add task in each day, make it "other", not sport!
    setActiveModal('other-form');
  };

  const handleOpenModal = (modal: ModalState) => {
    setActiveTask(null);
    setActiveModal(modal);
  };

  const handleFinishTask = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/tasks/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setTasks(prev => prev.filter(task => task.id !== id));
      setActiveModal(null);
      setActiveTask(null);
    } catch (err) {
      console.error('Failed to finish task:', err);
    }
  };

  return (
    <>
      <Header 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        onReset={handleReset} 
      />
      
      {currentView === 'login' && <LoginView onLogin={handleLogin} />}
      
      {currentView === 'dashboard' && (
        <DashboardView 
          tasks={tasks} 
          onOpenModal={handleOpenModal}
          onTaskClick={handleTaskClick}
          onAddTaskDay={handleAddTaskOnDay}
        />
      )}

      {/* Forms */}
      <ModalContainer 
        isOpen={activeModal === 'training-form'} 
        onClose={() => { setActiveModal(null); setActiveTask(null); }}
        title={activeTask ? "Edit Training Session" : "New Training Session"}
        badge={
          <span className="px-2.5 py-1 bg-[#fce7f3] border-2 border-black rounded text-xs font-black shadow-[2px_2px_0px_#000]">
            🏋️ {activeTask ? "EDIT TRAINING" : "NEW TRAINING SESSION"}
          </span>
        }
        subtitle="Training Builder"
      >
        <TrainingForm 
          initialTask={activeTask}
          defaultDay={selectedDay}
          onSave={handleSaveTask} 
          onClose={() => { setActiveModal(null); setActiveTask(null); }} 
        />
      </ModalContainer>

      <ModalContainer 
        isOpen={activeModal === 'study-form'} 
        onClose={() => { setActiveModal(null); setActiveTask(null); }}
        title={activeTask ? "Edit Study Session" : "New Study Session"}
        badge={
          <span className="px-2.5 py-1 bg-[#e0f2fe] border-2 border-black rounded text-xs font-black shadow-[2px_2px_0px_#000]">
            📖 {activeTask ? "EDIT STUDY" : "NEW STUDY SESSION"}
          </span>
        }
        subtitle="Academic Sync"
      >
        <StudyForm 
          initialTask={activeTask}
          defaultDay={selectedDay}
          onSave={handleSaveTask} 
          onClose={() => { setActiveModal(null); setActiveTask(null); }} 
        />
      </ModalContainer>

      <ModalContainer 
        isOpen={activeModal === 'other-form'} 
        onClose={() => { setActiveModal(null); setActiveTask(null); }}
        title={activeTask ? "Edit Activity" : "New Activity"}
        badge={
          <span className="px-2.5 py-1 bg-[#fed7aa] border-2 border-black rounded text-xs font-black shadow-[2px_2px_0px_#000]">
            ⚙️ {activeTask ? "EDIT ACTIVITY" : "NEW OTHER ACTIVITY"}
          </span>
        }
        subtitle="Life & Logistics"
      >
        <OtherForm 
          initialTask={activeTask}
          defaultDay={selectedDay}
          onSave={handleSaveTask} 
          onClose={() => { setActiveModal(null); setActiveTask(null); }} 
        />
      </ModalContainer>

      {/* Real Details Views */}
      <ModalContainer 
        isOpen={activeModal === 'training-details'} 
        onClose={() => { setActiveModal(null); setActiveTask(null); }}
        title="Training Session Details"
        badge={
          <span className="px-2.5 py-1 bg-[#fce7f3] border-2 border-black rounded text-xs font-black shadow-[2px_2px_0px_#000]">
            🏋️ TRAINING SESSION
          </span>
        }
        subtitle={
          <span className="px-2 py-0.5 border border-black rounded text-[11px] font-bold bg-white uppercase">
            {activeTask?.subtitle || 'WORKOUT'}
          </span>
        }
      >
        {activeTask && (
          <TrainingDetails 
            task={activeTask} 
            onClose={() => { setActiveModal(null); setActiveTask(null); }} 
            onEdit={() => setActiveModal('training-form')}
            onFinish={() => handleFinishTask(activeTask.id)}
            onUpdateTask={handleUpdateTask}
          />
        )}
      </ModalContainer>

      <ModalContainer 
        isOpen={activeModal === 'study-details'} 
        onClose={() => { setActiveModal(null); setActiveTask(null); }}
        title="Study Block Details"
        badge={
          <span className="px-2.5 py-1 bg-[#bae6fd] border-2 border-black rounded text-xs font-black shadow-[2px_2px_0px_#000]">
            📖 ACADEMIC STUDY BLOCK
          </span>
        }
        subtitle={
          <span className="px-2 py-0.5 border border-black rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> {activeTask?.subtitle || 'Verified'}
          </span>
        }
      >
        {activeTask && (
          <StudyDetails 
            task={activeTask} 
            onClose={() => { setActiveModal(null); setActiveTask(null); }} 
            onEdit={() => setActiveModal('study-form')}
            onFinish={() => handleFinishTask(activeTask.id)}
            onUpdateTask={handleUpdateTask}
          />
        )}
      </ModalContainer>

      <ModalContainer 
        isOpen={activeModal === 'other-details'} 
        onClose={() => { setActiveModal(null); setActiveTask(null); }}
        title="Activity Details"
        badge={
          <span className="px-2.5 py-1 bg-[#fed7aa] border-2 border-black rounded text-xs font-black shadow-[2px_2px_0px_#000]">
            ⚙️ OTHER ACTIVITY
          </span>
        }
        subtitle={
          <span className="px-2 py-0.5 border border-black rounded text-[11px] font-bold bg-white uppercase">
            {activeTask?.details?.tag || activeTask?.subtitle || 'GENERAL'}
          </span>
        }
      >
        {activeTask && (
          <OtherDetails 
            task={activeTask} 
            onClose={() => { setActiveModal(null); setActiveTask(null); }} 
            onEdit={() => setActiveModal('other-form')}
            onFinish={() => handleFinishTask(activeTask.id)}
            onUpdateTask={handleUpdateTask}
          />
        )}
      </ModalContainer>
    </>
  );
}

