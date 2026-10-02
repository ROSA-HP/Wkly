import { useState, FormEvent } from 'react';

interface LoginViewProps {
  onLogin: () => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('rosa.athlete@stanford.edu');
  const [password, setPassword] = useState('password123');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const performLogin = async (targetEmail: string, targetPass: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: targetPass }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      if (data.token) {
        localStorage.setItem('token', data.token);
        onLogin();
      }
    } catch (err) {
      setError('Failed to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isRegistering) {
      await performLogin(email, password);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      setIsRegistering(false);
      setError('Account created! Logging you in...');
      await performLogin(email, password);
    } catch (err) {
      setError('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 bg-[#FCF9F8] dark:bg-[#0B0D11] transition-colors duration-200 animate-in fade-in">
      <div className="w-full max-w-5xl">
        {/* Sub-navigation header inside Login screen */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-8 mb-6 border-b-2 border-black dark:border-[#383F50] gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#8B5CF6] dark:bg-[#A855F7] border-2 border-black dark:border-white rounded flex items-center justify-center shadow-[2px_2px_0px_#000]">
              <svg
                className="w-5 h-5 text-white dark:text-[#0B0D11] fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-display font-extrabold tracking-tight text-slate-900 dark:text-[#F3F4F6]">
                Wkly
              </h1>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-[#9CA3AF] font-display">
                Weekly Activity & Performance Planner
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 font-display">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-[#FFE4E6] dark:bg-[#2A161D] text-slate-900 dark:text-[#FB7185] border-2 border-black dark:border-[#FB7185] rounded-full shadow-[2px_2px_0px_#000]">
              <span className="w-2 h-2 rounded-full bg-pink-500 dark:bg-[#FB7185] animate-pulse"></span>{' '}
              Academic Sync Active
            </span>
            <div className="flex border-2 border-black dark:border-[#383F50] rounded overflow-hidden shadow-[2px_2px_0px_#000] text-xs font-bold">
              <span className="px-3 py-1 bg-[#FEF08A] dark:bg-[#292312] text-slate-900 dark:text-[#FBBF24] border-r-2 border-black dark:border-[#383F50]">
                NCAA SEASON
              </span>
              <span className="px-3 py-1 bg-white dark:bg-[#161922] text-slate-500 dark:text-[#64748B]">
                OFF-SEASON
              </span>
            </div>
          </div>
        </div>

        {/* Main Login Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Hero Card */}
          <div className="lg:col-span-6 bg-white dark:bg-[#161922] p-7 rounded-xl neo-box flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-[#FFE4E6] dark:bg-[#2A161D] text-slate-900 dark:text-[#FB7185] border-2 border-black dark:border-[#FB7185] rounded-full shadow-[2px_2px_0px_#000] font-display">
                <span className="w-2 h-2 rounded-full bg-pink-500 dark:bg-[#FB7185]"></span> DUAL-LIFE
                ARCHITECTURE
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-extrabold leading-tight text-slate-900 dark:text-[#F3F4F6]">
                Master both
                <span className="inline-block bg-[#FEF08A] dark:bg-[#292312] text-slate-900 dark:text-[#FBBF24] border-2 border-black dark:border-[#FBBF24] px-2 py-0.5 rounded shadow-[2px_2px_0px_#000] transform -rotate-1 mx-2">
                  arena
                </span>
                & academy.
              </h2>
              <p className="text-sm font-medium text-slate-600 dark:text-[#9CA3AF] leading-relaxed">
                A high-dopamine, zero-friction weekly sanctuary built for high-performance
                collegiate athletes who refuse to sacrifice their GPA.
              </p>
            </div>

            <div className="space-y-3 font-display">
              <div className="flex items-center gap-3 p-3 bg-[#FCF9F8] dark:bg-[#1E232E] border-2 border-black dark:border-[#383F50] rounded-lg shadow-[2px_2px_0px_#000]">
                <div className="w-8 h-8 rounded bg-[#FFE4E6] dark:bg-[#2A161D] border-2 border-black dark:border-[#FB7185] flex items-center justify-center text-sm font-black">
                  🏋️
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-[#F3F4F6]">
                  Periodized Training & Live RPE Set Tracking
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#FCF9F8] dark:bg-[#1E232E] border-2 border-black dark:border-[#383F50] rounded-lg shadow-[2px_2px_0px_#000]">
                <div className="w-8 h-8 rounded bg-[#BAE6FD] dark:bg-[#132637] border-2 border-black dark:border-[#38BDF8] flex items-center justify-center text-sm font-black">
                  📖
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-[#F3F4F6]">
                  Academic Study Blocks & Canvas Syllabus Sync
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#FCF9F8] dark:bg-[#1E232E] border-2 border-black dark:border-[#383F50] rounded-lg shadow-[2px_2px_0px_#000]">
                <div className="w-8 h-8 rounded bg-[#A7F3D0] dark:bg-[#122A21] border-2 border-black dark:border-[#34D399] flex items-center justify-center text-sm font-black">
                  ⚡
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-[#F3F4F6]">
                  CNS Readiness & Cognitive Load Balancing
                </div>
              </div>
            </div>
          </div>

          {/* Right Login Card */}
          <div className="lg:col-span-6 bg-white dark:bg-[#161922] p-7 rounded-xl neo-box space-y-6">
            {/* Toggle Between Login and Register */}
            <div className="grid grid-cols-2 border-2 border-black dark:border-[#383F50] rounded-lg overflow-hidden shadow-[2px_2px_0px_#000] font-bold text-xs font-display">
              <button
                onClick={() => {
                  setIsRegistering(false);
                  setError('');
                }}
                className={`py-2 text-center transition-colors cursor-pointer ${
                  !isRegistering
                    ? 'bg-[#FEF08A] dark:bg-[#A855F7] text-slate-900 dark:text-[#0B0D11] border-r-2 border-black dark:border-[#383F50] font-black'
                    : 'bg-[#F6F3F2] dark:bg-[#1E232E] hover:bg-white dark:hover:bg-[#10141C] text-slate-600 dark:text-[#9CA3AF]'
                }`}
              >
                LOG IN
              </button>
              <button
                onClick={() => {
                  setIsRegistering(true);
                  setError('');
                }}
                className={`py-2 text-center transition-colors cursor-pointer ${
                  isRegistering
                    ? 'bg-[#FEF08A] dark:bg-[#A855F7] text-slate-900 dark:text-[#0B0D11] border-l-2 border-black dark:border-[#383F50] font-black'
                    : 'bg-[#F6F3F2] dark:bg-[#1E232E] hover:bg-white dark:hover:bg-[#10141C] text-slate-600 dark:text-[#9CA3AF]'
                }`}
              >
                CREATE ACCOUNT
              </button>
            </div>

            <div>
              <h3 className="text-xl font-display font-black flex items-center gap-1.5 text-slate-900 dark:text-[#F3F4F6]">
                <span>✨</span> {isRegistering ? 'Join Wkly' : 'Welcome back to Wkly'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#9CA3AF] mt-1 font-medium">
                {isRegistering
                  ? 'Create an account to synchronize your syllabus and training.'
                  : 'Synchronize your syllabus and training intervals for the upcoming week.'}
              </p>
            </div>

            {/* Error Message Display */}
            {error && (
              <div
                className={`p-3 border-2 border-black rounded-lg text-xs font-bold font-display shadow-[2px_2px_0px_#000] ${
                  error.includes('Account created')
                    ? 'bg-green-100 dark:bg-[#0A291E] text-green-800 dark:text-[#10B981] dark:border-[#10B981]'
                    : 'bg-red-100 dark:bg-[#2A161D] text-red-800 dark:text-[#FB7185] dark:border-[#FB7185]'
                }`}
              >
                {error}
              </div>
            )}

            {/* Database Connection Status Badge */}
            <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 dark:bg-[#0A291E] border-2 border-black dark:border-[#10B981] rounded-lg text-xs font-bold text-emerald-900 dark:text-[#10B981] font-display shadow-[2px_2px_0px_#000]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-[#10B981] animate-pulse"></span>
                <span>Database: MongoDB & REST API Connected</span>
              </span>
              <span className="text-[10px] font-mono font-bold bg-emerald-200 dark:bg-[#122A21] border border-emerald-700 dark:border-[#34D399] text-emerald-950 dark:text-[#34D399] px-1.5 py-0.5 rounded">
                LIVE
              </span>
            </div>

            {!isRegistering && (
              <>
                {/* 1-Click Instant Demo Access */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => performLogin('rosa.athlete@stanford.edu', 'password123')}
                  className="w-full py-3 px-4 bg-[#FEF08A] hover:bg-yellow-200 dark:bg-[#292312] dark:hover:bg-[#383019] text-slate-900 dark:text-[#FBBF24] border-2 border-black dark:border-[#FBBF24] rounded-lg shadow-[3px_3px_0px_#000] neo-btn flex items-center justify-center gap-2 font-display font-black text-xs cursor-pointer"
                >
                  <span>⚡</span>
                  <span>
                    {loading
                      ? 'Entering Planner...'
                      : '1-Click Instant Demo Login (Stanford Athlete)'}
                  </span>
                  <span className="text-[10px] bg-black dark:bg-[#0B0D11] text-white dark:text-[#FBBF24] border border-transparent dark:border-[#FBBF24] px-2 py-0.5 rounded font-mono">
                    Real Data
                  </span>
                </button>

                <div className="relative flex items-center justify-center font-display">
                  <div className="border-t-2 border-black dark:border-[#383F50] w-full"></div>
                  <span className="bg-white dark:bg-[#161922] px-3 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-[#9CA3AF] absolute">
                    or sign in with email
                  </span>
                </div>
              </>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-[11px] font-display font-black uppercase tracking-wider text-slate-700 dark:text-[#F3F4F6] mb-1">
                  University or Personal Email
                </label>
                <div className="relative">
                  <input
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-lg neo-input"
                    type="email"
                    placeholder="rosa.athlete@stanford.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1 font-display">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-[#F3F4F6]">
                    Secret Password
                  </label>
                  {!isRegistering && (
                    <span className="text-[11px] font-bold text-slate-500 dark:text-[#9CA3AF]">
                      Default: password123
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-lg neo-input"
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {!isRegistering && (
                <div className="flex items-center justify-between text-xs font-bold font-display text-slate-800 dark:text-[#F3F4F6]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      defaultChecked
                      className="w-4 h-4 border-2 border-black dark:border-[#383F50] rounded accent-[#8b5cf6] dark:accent-[#A855F7]"
                      type="checkbox"
                    />
                    <span>Remember me for 30 days</span>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#8B5CF6] dark:bg-[#A855F7] hover:bg-[#7c3aed] dark:hover:bg-[#C084FC] text-white dark:text-[#0B0D11] font-display font-black text-sm border-2 border-black dark:border-white rounded-lg shadow-[4px_4px_0px_#000] neo-btn flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                <span>
                  {loading
                    ? 'Please wait...'
                    : isRegistering
                      ? 'Create Account'
                      : 'Enter Planner'}
                </span>
                <span className="text-base font-bold">→</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
