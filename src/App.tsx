import { useState, useEffect } from 'react';
import { ViewState, ModalState, Task } from './types';
import { Header } from './components/layout/Header';
import { LoginView } from './components/views/LoginView';
import { DashboardView } from './components/views/DashboardView';
import { ModalContainer } from './components/modals/ModalContainer';
import { TrainingForm } from './components/modals/TrainingForm';
import { StudyForm } from './components/modals/StudyForm';
import { OtherForm } from './components/modals/OtherForm';
import { TrainingDetails } from './components/modals/TrainingDetails';
import { StudyDetails } from './components/modals/StudyDetails';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('login');
  const [activeModal, setActiveModal] = useState<ModalState>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only try to fetch tasks if we are actually on the dashboard 
    // (meaning we have logged in and got our token)
    if (currentView === 'dashboard') {
      fetchTasks();
    }
  }, [currentView]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      // 1. Get the digital ID card from the browser's vault
      const token = localStorage.getItem('token');
      
      const res = await fetch('/api/tasks', {
        // 2. Attach the token to the request headers
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error('Not authorized');
      
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      // If the token is fake or expired, boot them back to login!
      setCurrentView('login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    setCurrentView('dashboard');
  };

  const handleReset = () => {
    // To properly "log out", we delete the token from the vault!
    localStorage.removeItem('token');
    setCurrentView('login');
    setActiveModal(null);
    setActiveTask(null);
    setTasks([]); // Clear the tasks from memory
  };

  const handleAddTask = async (newTaskData: Omit<Task, 'id'>) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Must send token here too!
        },
        body: JSON.stringify(newTaskData)
      });
      const savedTask = await res.json();
      setTasks([...tasks, savedTask]);
      setActiveModal(null);
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  };

  const handleTaskClick = (task: Task) => {
    setActiveTask(task);
    if (task.category === 'TRAINING' || task.category === 'OTHER') {
      setActiveModal('training-details');
    } else {
      setActiveModal('study-details');
    }
  };

  const handleFinishTask = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/tasks/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}` // And here!
        }
      });
      setTasks(tasks.filter(task => task.id !== id));
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
          onOpenModal={setActiveModal}
          onTaskClick={handleTaskClick}
        />
      )}

      {/* Forms */}
      <ModalContainer 
        isOpen={activeModal === 'training-form'} 
        onClose={() => setActiveModal(null)}
        title="New Training Session"
        badge={
          <span className="px-2.5 py-1 bg-[#fce7f3] border-2 border-black rounded text-xs font-black shadow-[2px_2px_0px_#000]">
            🏋️ NEW TRAINING SESSION
          </span>
        }
        subtitle="Step 4 • Training Builder"
      >
        <TrainingForm onSave={handleAddTask} onClose={() => setActiveModal(null)} />
      </ModalContainer>

      <ModalContainer 
        isOpen={activeModal === 'study-form'} 
        onClose={() => setActiveModal(null)}
        title="New Study Session"
        badge={
          <span className="px-2.5 py-1 bg-[#e0f2fe] border-2 border-black rounded text-xs font-black shadow-[2px_2px_0px_#000]">
            📖 NEW STUDY SESSION
          </span>
        }
        subtitle="Step 5 • Academic Sync"
      >
        <StudyForm onSave={handleAddTask} onClose={() => setActiveModal(null)} />
      </ModalContainer>

      <ModalContainer 
        isOpen={activeModal === 'other-form'} 
        onClose={() => setActiveModal(null)}
        title="New Other Activity"
        badge={
          <span className="px-2.5 py-1 bg-[#fed7aa] border-2 border-black rounded text-xs font-black shadow-[2px_2px_0px_#000]">
            ⚙️ NEW OTHER ACTIVITY
          </span>
        }
        subtitle="Step 6 • Life & Logistics"
      >
        <OtherForm onSave={handleAddTask} onClose={() => setActiveModal(null)} />
      </ModalContainer>

      {/* Detail & Completion Views */}
      <ModalContainer 
        isOpen={activeModal === 'training-details'} 
        onClose={() => setActiveModal(null)}
        title="Training Session Details"
        badge={
          <span className="px-2.5 py-1 bg-[#fce7f3] border-2 border-black rounded text-xs font-black shadow-[2px_2px_0px_#000]">
            {activeTask?.category === 'OTHER' ? '⚙️ OTHER ACTIVITY' : '🏋️ TRAINING SESSION'}
          </span>
        }
        subtitle={
          <span className="px-2 py-0.5 border border-black rounded text-[11px] font-bold bg-white uppercase">
            {activeTask?.subtitle || 'PHASE II • HIGH VELOCITY'}
          </span>
        }
      >
        {activeTask && (
          <TrainingDetails 
            task={activeTask} 
            onClose={() => setActiveModal(null)} 
            onEdit={() => setActiveModal(activeTask.category === 'OTHER' ? 'other-form' : 'training-form')}
            onFinish={() => handleFinishTask(activeTask.id)}
          />
        )}
      </ModalContainer>

      <ModalContainer 
        isOpen={activeModal === 'study-details'} 
        onClose={() => setActiveModal(null)}
        title="Study Block Details"
        badge={
          <span className="px-2.5 py-1 bg-[#bae6fd] border-2 border-black rounded text-xs font-black shadow-[2px_2px_0px_#000]">
            📖 ACADEMIC STUDY BLOCK
          </span>
        }
        subtitle={
          <span className="px-2 py-0.5 border border-black rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Canvas Synced (Verified)
          </span>
        }
      >
        {activeTask && (
          <StudyDetails 
            task={activeTask} 
            onClose={() => setActiveModal(null)} 
            onEdit={() => setActiveModal('study-form')}
            onFinish={() => handleFinishTask(activeTask.id)}
          />
        )}
      </ModalContainer>
    </>
  );
}

