import { ViewState } from '../../types';

interface LoginViewProps {
  onLogin: () => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  return (
    <section className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 animate-in fade-in duration-300">
      <div className="w-full max-w-5xl">
        {/* Sub-navigation header inside Login screen */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-8 mb-6 border-b-2 border-black gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#8b5cf6] border-2 border-black rounded flex items-center justify-center shadow-[2px_2px_0px_#000]">
              <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
            </div>
            <div>
              <h1 className="text-xl font-display font-extrabold tracking-tight">AcroPulse</h1>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 font-display">Scholar-Athlete Operating System</p>
            </div>
          </div>
          <div className="flex items-center gap-3 font-display">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-[#fce7f3] border-2 border-black rounded-full shadow-[2px_2px_0px_#000]">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span> Academic Sync Active
            </span>
            <div className="flex border-2 border-black rounded overflow-hidden shadow-[2px_2px_0px_#000] text-xs font-bold">
              <span className="px-3 py-1 bg-yellow-300 border-r-2 border-black">NCAA SEASON</span>
              <span className="px-3 py-1 bg-white text-slate-500">OFF-SEASON</span>
            </div>
          </div>
        </div>

        {/* Main Login Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Hero Card */}
          <div className="lg:col-span-6 bg-white p-7 rounded-xl neo-box flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-[#fce7f3] border-2 border-black rounded-full shadow-[2px_2px_0px_#000] font-display">
                <span className="w-2 h-2 rounded-full bg-pink-500"></span> DUAL-LIFE ARCHITECTURE
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-extrabold leading-tight">
                Master both 
                <span className="inline-block bg-yellow-200 border-2 border-black px-2 py-0.5 rounded shadow-[2px_2px_0px_#000] transform -rotate-1 mx-2">arena</span> 
                & academy.
              </h2>
              <p className="text-sm font-medium text-slate-600 leading-relaxed">
                A high-dopamine, zero-friction weekly sanctuary built for high-performance collegiate athletes who refuse to sacrifice their GPA.
              </p>
            </div>

            <div className="space-y-3 font-display">
              <div className="flex items-center gap-3 p-3 bg-[#fcf9f8] border-2 border-black rounded-lg shadow-[2px_2px_0px_#000]">
                <div className="w-8 h-8 rounded bg-[#fce7f3] border-2 border-black flex items-center justify-center text-sm font-black">🏋️</div>
                <div className="text-xs font-bold">Periodized Training & Live RPE Set Tracking</div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#fcf9f8] border-2 border-black rounded-lg shadow-[2px_2px_0px_#000]">
                <div className="w-8 h-8 rounded bg-[#e0f2fe] border-2 border-black flex items-center justify-center text-sm font-black">📖</div>
                <div className="text-xs font-bold">Academic Study Blocks & Canvas Syllabus Sync</div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#fcf9f8] border-2 border-black rounded-lg shadow-[2px_2px_0px_#000]">
                <div className="w-8 h-8 rounded bg-[#dcfce7] border-2 border-black flex items-center justify-center text-sm font-black">⚡</div>
                <div className="text-xs font-bold">CNS Readiness & Cognitive Load Balancing</div>
              </div>
            </div>
          </div>

          {/* Right Login Card */}
          <div className="lg:col-span-6 bg-white p-7 rounded-xl neo-box space-y-6">
            <div className="grid grid-cols-2 border-2 border-black rounded-lg overflow-hidden shadow-[2px_2px_0px_#000] font-bold text-xs font-display">
              <button className="py-2 bg-yellow-300 border-r-2 border-black text-center">LOG IN</button>
              <button className="py-2 bg-[#f6f3f2] hover:bg-white text-slate-600 text-center">CREATE ACCOUNT</button>
            </div>
            
            <div>
              <h3 className="text-xl font-display font-black flex items-center gap-1.5">
                <span>✨</span> Welcome back, Scholar-Athlete
              </h3>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Synchronize your syllabus and training intervals for the upcoming week.
              </p>
            </div>

            <button 
              onClick={onLogin}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border-2 border-black rounded-lg neo-box-sm neo-btn flex items-center justify-center gap-3 font-bold text-xs font-display"
            >
              {/* Google Icon SVG (simplified for brevity, use full SVG from original if needed) */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center font-display">
              <div className="border-t-2 border-black w-full"></div>
              <span className="bg-white px-3 text-[10px] font-black uppercase tracking-wider text-slate-500 absolute">or continue with email</span>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
              <div>
                <label className="block text-[11px] font-display font-black uppercase tracking-wider text-slate-700 mb-1">University or Personal Email</label>
                <div className="relative">
                  <input className="w-full text-xs font-semibold px-3 py-2.5 bg-[#fcf9f8] border-2 border-black rounded-lg neo-box-sm focus:bg-white focus:outline-none focus:border-[#8b5cf6]" type="email" defaultValue="rosa.athlete@stanford.edu" />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1 font-display">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700">Secret Password</label>
                  <a className="text-[11px] font-bold text-[#8b5cf6] hover:underline" href="#">Forgot password?</a>
                </div>
                <div className="relative">
                  <input className="w-full text-xs font-semibold px-3 py-2.5 bg-[#fcf9f8] border-2 border-black rounded-lg neo-box-sm focus:bg-white focus:outline-none focus:border-[#8b5cf6]" type="password" defaultValue="••••••••••••" />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-bold font-display">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input defaultChecked className="w-4 h-4 border-2 border-black rounded accent-[#8b5cf6]" type="checkbox" />
                  <span>Remember me for 30 days</span>
                </label>
              </div>

              <button type="submit" className="w-full py-3 px-4 bg-[#8b5cf6] text-white font-display font-black text-sm border-2 border-black rounded-lg shadow-[4px_4px_0px_#000] neo-btn flex items-center justify-center gap-2">
                <span>Enter Planner</span>
                <span className="text-base font-bold">→</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
