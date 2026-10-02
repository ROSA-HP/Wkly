import { useState, useEffect, useRef, useCallback } from 'react';

interface WklyTransitionProps {
  onComplete: () => void;
  isDarkMode?: boolean;
}

interface WeekDayMeta {
  short: string;
  name: string;
  color: string;
  darkBg: string;
  darkText: string;
  sampleTask: {
    icon: string;
    title: string;
    time: string;
    tag: string;
  };
}

const WEEK_DAYS: WeekDayMeta[] = [
  {
    short: 'MON',
    name: 'Monday',
    color: '#FFD1DC',
    darkBg: '#2A161D',
    darkText: '#FB7185',
    sampleTask: { icon: '🏋️', title: 'Power Snatch & Clean Pulls', time: '07:00 AM', tag: 'TRAINING' },
  },
  {
    short: 'TUE',
    name: 'Tuesday',
    color: '#BAE6FD',
    darkBg: '#132637',
    darkText: '#38BDF8',
    sampleTask: { icon: '📖', title: 'Fluid Mechanics Problem Set', time: '10:30 AM', tag: 'ACADEMICS' },
  },
  {
    short: 'WED',
    name: 'Wednesday',
    color: '#BBF7D0',
    darkBg: '#122A21',
    darkText: '#34D399',
    sampleTask: { icon: '⚡', title: 'Explosive Pull-ups & Deep Squats', time: '07:00 AM', tag: 'TRAINING' },
  },
  {
    short: 'THU',
    name: 'Thursday',
    color: '#FEF08A',
    darkBg: '#292312',
    darkText: '#FBBF24',
    sampleTask: { icon: '📖', title: 'Thermo Lab Writeup & Prep', time: '02:00 PM', tag: 'ACADEMICS' },
  },
  {
    short: 'FRI',
    name: 'Friday',
    color: '#E9D5FF',
    darkBg: '#2E1850',
    darkText: '#C084FC',
    sampleTask: { icon: '🌱', title: 'ESP32 Sensor Calibration', time: '04:00 PM', tag: 'LAB PROTOCOL' },
  },
  {
    short: 'SAT',
    name: 'Saturday',
    color: '#FED7AA',
    darkBg: '#2E190B',
    darkText: '#FB923C',
    sampleTask: { icon: '🏃', title: 'Tempo Run & Mobility Session', time: '08:30 AM', tag: 'RECOVERY' },
  },
  {
    short: 'SUN',
    name: 'Sunday',
    color: '#A7F3D0',
    darkBg: '#102A24',
    darkText: '#6EE7B7',
    sampleTask: { icon: '🎯', title: 'Weekly Syllabus & Volume Review', time: '06:00 PM', tag: 'STRATEGY' },
  },
];

const LETTER_TILES = [
  { char: 'W', lightBg: 'bg-[#8455ef]', darkBg: 'dark:bg-[#9333EA]', text: 'text-white', tilt: '-rotate-3', freq: 440 },
  { char: 'k', lightBg: 'bg-[#fef08a]', darkBg: 'dark:bg-[#292312]', text: 'text-[#121212] dark:text-[#FBBF24]', tilt: 'rotate-2', freq: 523 },
  { char: 'l', lightBg: 'bg-[#bbf7d0]', darkBg: 'dark:bg-[#122A21]', text: 'text-[#121212] dark:text-[#34D399]', tilt: '-rotate-2', freq: 659 },
  { char: 'y', lightBg: 'bg-[#ffd1dc]', darkBg: 'dark:bg-[#2A161D]', text: 'text-[#121212] dark:text-[#FB7185]', tilt: 'rotate-3', freq: 784 },
];

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  shape: 'square' | 'circle' | 'star';
  size: number;
  rotation: number;
  rotSpeed: number;
}

export function WklyTransition({ onComplete, isDarkMode = false }: WklyTransitionProps) {
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('CALIBRATING WKLY WORKSPACE...');
  const [isExiting, setIsExiting] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [bouncedTile, setBouncedTile] = useState<number | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastPlayedDayRef = useRef<number>(-1);

  // Synthesize soft retro mechanical clicks using Web Audio API
  const playTone = useCallback((frequency: number, type: OscillatorType = 'sine', duration = 0.08) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio context policy blocked or not supported
    }
  }, [soundEnabled]);

  // Play celebration chord on 100% completion
  const playSuccessChord = useCallback(() => {
    if (!soundEnabled) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      setTimeout(() => {
        playTone(freq, 'triangle', 0.25);
      }, idx * 60);
    });
  }, [soundEnabled, playTone]);

  // Burst Neo-Brutalist celebratory confetti
  const triggerCelebrationParticles = useCallback(() => {
    const palette = ['#FFD1DC', '#BAE6FD', '#BBF7D0', '#FEF08A', '#8455ef', '#fd56a7', '#fed7aa'];
    const newParticles: Particle[] = [];
    for (let i = 0; i < 40; i++) {
      const angle = (Math.PI * 2 * i) / 40 + (Math.random() - 0.5) * 0.4;
      const speed = 4 + Math.random() * 8;
      newParticles.push({
        id: i,
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        color: palette[i % palette.length],
        shape: i % 3 === 0 ? 'star' : i % 3 === 1 ? 'square' : 'circle',
        size: 8 + Math.random() * 8,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 15,
      });
    }
    setParticles(newParticles);
  }, []);

  // Update particles physics loop
  useEffect(() => {
    if (particles.length === 0) return;
    const pTimer = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.35, // gravity
            rotation: p.rotation + p.rotSpeed,
          }))
          .filter((p) => Math.abs(p.x) < 500 && p.y < 500)
      );
    }, 20);
    return () => clearInterval(pTimer);
  }, [particles.length]);

  useEffect(() => {
    // Rich, well-paced animation sequence over 3.2 seconds
    const startTime = Date.now();
    const duration = 3200;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const rawPct = (elapsed / duration) * 100;
      const pct = Math.min(100, Math.round(rawPct));
      setProgress(pct);

      const dayIndex = Math.min(6, Math.floor((elapsed / duration) * 7));
      setActiveDayIdx(dayIndex);

      if (dayIndex !== lastPlayedDayRef.current) {
        lastPlayedDayRef.current = dayIndex;
        playTone(380 + dayIndex * 50, 'triangle', 0.06);
      }

      if (elapsed < 650) {
        setStatusMessage('INITIALIZING DUAL-LIFE ARCHITECTURE...');
      } else if (elapsed < 1400) {
        setStatusMessage('SYNCING ATHLETIC TRAINING & PERIODIZATION...');
      } else if (elapsed < 2100) {
        setStatusMessage('CALIBRATING ACADEMIC STUDY CANVASES...');
      } else if (elapsed < 2750) {
        setStatusMessage('BALANCING WEEKLY CNS READINESS & LOAD...');
      } else {
        setStatusMessage('WELCOME TO WKLY • OPENING DASHBOARD');
      }

      if (elapsed >= duration) {
        clearInterval(interval);
        triggerCelebrationParticles();
        playSuccessChord();

        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
            onComplete();
          }, 320);
        }, 300);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [onComplete, playTone, playSuccessChord, triggerCelebrationParticles]);

  const activeDay = WEEK_DAYS[activeDayIdx] || WEEK_DAYS[0];

  const handleTileClick = (idx: number, freq: number) => {
    setBouncedTile(idx);
    playTone(freq, 'sine', 0.14);
    setTimeout(() => setBouncedTile(null), 350);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 canvas-dot-grid overflow-hidden transition-all duration-300 ${
        isExiting
          ? 'opacity-0 scale-[1.04] translate-y-[-8px] pointer-events-none'
          : 'opacity-100 scale-100'
      } ${isDarkMode ? 'dark bg-[#0B0D11]' : 'bg-[#FCF9F8]'}`}
      id="wkly-transition-overlay"
      aria-label="Loading Wkly Dual-Life Dashboard"
    >
      {/* Neo-Brutalist Confetti Particles Burst */}
      {particles.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
          {particles.map((p) => (
            <div
              key={p.id}
              style={{
                transform: `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`,
                backgroundColor: p.color,
                width: `${p.size}px`,
                height: `${p.size}px`,
              }}
              className={`absolute border-2 border-[#121212] shadow-[1.5px_1.5px_0_#000] ${
                p.shape === 'circle'
                  ? 'rounded-full'
                  : p.shape === 'star'
                  ? 'rounded-sm rotate-45'
                  : 'rounded-none'
              }`}
            />
          ))}
        </div>
      )}

      {/* Ambient Floating Neo-Brutalist Badges */}
      <div className="hidden lg:block absolute top-8 left-8 transform -rotate-3 hover:rotate-0 transition-transform">
        <div className="px-3.5 py-1.5 bg-[#FFE4E6] dark:bg-[#2A161D] text-[#121212] dark:text-[#FB7185] border-[2.5px] border-[#121212] dark:border-[#FB7185] shadow-[3.5px_3.5px_0_#121212] dark:shadow-[3.5px_3.5px_0_#000000] rounded-lg font-display text-xs font-black uppercase flex items-center gap-2">
          <span>🏋️</span>
          <span>PERIODIZED ATHLETICS</span>
        </div>
      </div>

      <div className="hidden lg:block absolute top-8 right-8 transform rotate-3 hover:rotate-0 transition-transform">
        <div className="px-3.5 py-1.5 bg-[#BAE6FD] dark:bg-[#132637] text-[#121212] dark:text-[#38BDF8] border-[2.5px] border-[#121212] dark:border-[#38BDF8] shadow-[3.5px_3.5px_0_#121212] dark:shadow-[3.5px_3.5px_0_#000000] rounded-lg font-display text-xs font-black uppercase flex items-center gap-2">
          <span>📖</span>
          <span>ACADEMIC SYLLABUS SYNC</span>
        </div>
      </div>

      <div className="hidden lg:block absolute bottom-8 left-8 transform rotate-2 hover:rotate-0 transition-transform">
        <div className="px-3.5 py-1.5 bg-[#BBF7D0] dark:bg-[#122A21] text-[#121212] dark:text-[#34D399] border-[2.5px] border-[#121212] dark:border-[#34D399] shadow-[3.5px_3.5px_0_#121212] dark:shadow-[3.5px_3.5px_0_#000000] rounded-lg font-display text-xs font-black uppercase flex items-center gap-2">
          <span>⚡</span>
          <span>CNS READINESS: 99%</span>
        </div>
      </div>

      <div className="hidden lg:block absolute bottom-8 right-8 transform -rotate-2 hover:rotate-0 transition-transform">
        <div className="px-3.5 py-1.5 bg-[#FEF08A] dark:bg-[#292312] text-[#121212] dark:text-[#FBBF24] border-[2.5px] border-[#121212] dark:border-[#FBBF24] shadow-[3.5px_3.5px_0_#121212] dark:shadow-[3.5px_3.5px_0_#000000] rounded-lg font-display text-xs font-black uppercase flex items-center gap-2">
          <span>🌱</span>
          <span>ZERO COGNITIVE FRICTION</span>
        </div>
      </div>

      {/* Main Elevated Neo-Brutalist Frame */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#161922] border-[3px] border-[#121212] dark:border-[#383F50] shadow-[10px_10px_0_#121212] dark:shadow-[10px_10px_0_#000000] rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center transform transition-all duration-300">
        
        {/* Top Header Badge Row with Audio Toggle */}
        <div className="w-full flex items-center justify-between mb-5 gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FEF08A] dark:bg-[#292312] text-[#121212] dark:text-[#FBBF24] border-2 border-[#121212] dark:border-[#FBBF24] rounded-full text-[11px] font-display font-extrabold uppercase shadow-[2.5px_2.5px_0_#121212] dark:shadow-[2.5px_2.5px_0_#000000] tracking-wider animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8455ef] dark:bg-[#A855F7] animate-ping" />
              <span>DUAL-LIFE ARCHITECTURE</span>
            </span>
            <span className="hidden sm:inline-flex px-2 py-0.5 bg-[#f6f3f2] dark:bg-[#1E232E] text-[#121212] dark:text-[#F3F4F6] border border-[#121212] dark:border-[#383F50] rounded text-[10px] font-mono font-bold">
              V2.4
            </span>
          </div>

          {/* Sound FX Toggle (Default Muted / Click to Enable Audio-Haptic Feedback) */}
          <button
            type="button"
            onClick={() => {
              setSoundEnabled((prev) => !prev);
              playTone(520, 'sine', 0.1);
            }}
            title={soundEnabled ? 'Disable Audio FX' : 'Enable Audio Haptic FX'}
            className={`px-2.5 py-1 text-[10px] font-display font-black border-2 rounded flex items-center gap-1 shadow-[2px_2px_0_#121212] dark:shadow-[2px_2px_0_#000000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer transition-colors ${
              soundEnabled
                ? 'bg-[#BBF7D0] dark:bg-[#122A21] text-[#121212] dark:text-[#34D399] border-[#121212] dark:border-[#34D399]'
                : 'bg-[#f6f3f2] dark:bg-[#1E232E] text-[#7b7486] dark:text-[#9CA3AF] border-[#121212] dark:border-[#383F50]'
            }`}
          >
            <span>{soundEnabled ? '🔊' : '🔇'}</span>
            <span className="hidden sm:inline">{soundEnabled ? 'FX ON' : 'FX OFF'}</span>
          </button>
        </div>

        {/* Wkly Kinetic Logo Centerpiece */}
        <div className="relative mb-5 flex items-center justify-center group cursor-pointer" onClick={() => playTone(660, 'square', 0.15)}>
          <div className="w-20 h-20 bg-[#8455ef] dark:bg-[#A855F7] border-[3px] border-[#121212] dark:border-white shadow-[5px_5px_0_#121212] dark:shadow-[5px_5px_0_#000000] rounded-2xl flex items-center justify-center transform -rotate-3 group-hover:rotate-6 group-hover:scale-110 transition-transform">
            <svg
              className="w-11 h-11 text-white dark:text-[#0B0D11] fill-current animate-pulse"
              viewBox="0 0 24 24"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          {/* Live Status Pip */}
          <div className="absolute -bottom-2 -right-3 px-2 py-0.5 bg-[#BBF7D0] dark:bg-[#122A21] text-[#121212] dark:text-[#34D399] border-2 border-[#121212] dark:border-[#34D399] text-[10px] font-display font-black rounded-md shadow-[2px_2px_0_#121212] dark:shadow-[2px_2px_0_#000000] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-[#34D399] animate-ping" />
            <span>SYNC</span>
          </div>
        </div>

        {/* Bold 4-Tile "W · k · l · y" Kinetic Interactive Typography */}
        <div className="flex items-center justify-center gap-2 mb-2">
          {LETTER_TILES.map((tile, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleTileClick(idx, tile.freq)}
              className={`w-12 h-14 sm:w-14 sm:h-16 ${tile.lightBg} ${tile.darkBg} ${tile.text} border-[3px] border-[#121212] dark:border-white shadow-[3.5px_3.5px_0_#121212] dark:shadow-[3.5px_3.5px_0_#000000] rounded-xl flex items-center justify-center font-display font-black text-3xl sm:text-4xl transform ${
                bouncedTile === idx ? 'scale-125 -translate-y-2 rotate-0 ring-2 ring-yellow-400' : tile.tilt
              } hover:scale-110 hover:rotate-0 cursor-pointer transition-all duration-150 active:translate-x-0.5 active:translate-y-0.5`}
            >
              {tile.char}
            </button>
          ))}
          {/* Animated Dopamine Dot */}
          <div className="w-4 h-4 rounded-full bg-[#fd56a7] dark:bg-[#F472B6] border-2 border-[#121212] dark:border-white shadow-[2px_2px_0_#121212] ml-1 mt-6 animate-bounce" />
        </div>

        <p className="text-xs font-display font-bold uppercase tracking-widest text-[#7b7486] dark:text-[#9CA3AF] mb-5">
          Weekly Performance & Academic Canvas
        </p>

        {/* 7-Day Scheduler Sequencer with Checkmarks & Live Highlight */}
        <div className="grid grid-cols-7 gap-1.5 w-full mb-4">
          {WEEK_DAYS.map((day, idx) => {
            const isPassed = idx < activeDayIdx;
            const isCurrent = idx === activeDayIdx;

            return (
              <div
                key={day.short}
                style={{
                  backgroundColor: isCurrent || isPassed
                    ? isDarkMode
                      ? day.darkBg
                      : day.color
                    : undefined,
                  color: isCurrent || isPassed
                    ? isDarkMode
                      ? day.darkText
                      : '#121212'
                    : undefined,
                }}
                className={`py-2 px-1 border-2 border-[#121212] dark:border-[#383F50] rounded-lg font-display text-[10px] font-black uppercase flex flex-col items-center justify-center transition-all duration-200 ${
                  isCurrent
                    ? 'scale-110 shadow-[3px_3px_0_#121212] dark:shadow-[3px_3px_0_#000000] ring-2 ring-[#8455ef] dark:ring-[#A855F7] z-10'
                    : isPassed
                    ? 'shadow-[1.5px_1.5px_0_#121212] dark:shadow-[1.5px_1.5px_0_#000000] opacity-90'
                    : 'bg-[#f6f3f2] dark:bg-[#10141C] text-[#7b7486] dark:text-[#64748B] opacity-45'
                }`}
              >
                <span>{day.short}</span>
                <span className="text-[8px] font-bold mt-0.5 leading-none">
                  {isPassed ? '✓' : isCurrent ? '●' : '—'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Live Dynamic Schedule Card Peek */}
        <div className="w-full mb-5 bg-[#FCF9F8] dark:bg-[#10141C] border-2 border-[#121212] dark:border-[#383F50] shadow-[3px_3px_0_#121212] dark:shadow-[3px_3px_0_#000000] rounded-xl p-3 flex items-center justify-between text-left gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              style={{
                backgroundColor: isDarkMode ? activeDay.darkBg : activeDay.color,
                color: isDarkMode ? activeDay.darkText : '#121212',
              }}
              className="w-9 h-9 border-2 border-[#121212] dark:border-[#383F50] rounded-lg flex items-center justify-center text-base shrink-0 shadow-[1.5px_1.5px_0_#121212] font-black"
            >
              {activeDay.sampleTask.icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-display text-[9px] font-black uppercase text-[#8455ef] dark:text-[#A855F7]">
                  {activeDay.name.toUpperCase()}
                </span>
                <span className="text-[#121212]/30 dark:text-[#383F50]">·</span>
                <span className="font-mono text-[9px] font-bold text-[#7b7486] dark:text-[#9CA3AF]">
                  {activeDay.sampleTask.time}
                </span>
              </div>
              <p className="font-display text-xs font-bold text-[#121212] dark:text-[#F3F4F6] truncate">
                {activeDay.sampleTask.title}
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-white dark:bg-[#1E232E] border border-[#121212] dark:border-[#383F50] rounded text-[9px] font-display font-black text-[#121212] dark:text-[#F3F4F6] uppercase shrink-0 shadow-[1px_1px_0_#121212]">
            {activeDay.sampleTask.tag}
          </span>
        </div>

        {/* Tactile Progress Bar & Status Text */}
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between text-[11px] font-display font-bold uppercase text-[#121212] dark:text-[#F3F4F6]">
            <span className="truncate pr-2 font-black">{statusMessage}</span>
            <span className="font-mono font-bold text-[#8455ef] dark:text-[#C084FC] shrink-0">
              {progress}%
            </span>
          </div>

          <div className="w-full h-4 bg-[#f6f3f2] dark:bg-[#10141C] border-[2.5px] border-[#121212] dark:border-[#383F50] rounded-full overflow-hidden shadow-[2.5px_2.5px_0_#121212] dark:shadow-[2.5px_2.5px_0_#000000] p-0.5 flex">
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-[#8455ef] via-[#38bdf8] to-[#34d399] rounded-full transition-all duration-75 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Live Metrics Footnote */}
        <div className="w-full mt-4 pt-3 border-t-2 border-[#121212]/10 dark:border-[#383F50] flex items-center justify-between text-[10px] font-display font-bold text-[#7b7486] dark:text-[#9CA3AF] uppercase">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>BOARD: ATHLETICS & STUDY</span>
          </div>
          <span>SLOTS: 7 DAYS ACTIVE</span>
        </div>

        {/* Skip button for instant access if desired */}
        <button
          type="button"
          onClick={() => {
            setIsExiting(true);
            setTimeout(onComplete, 160);
          }}
          className="mt-4 text-[10px] font-display font-bold text-[#7b7486] dark:text-[#64748B] hover:text-[#121212] dark:hover:text-[#F3F4F6] transition-colors uppercase tracking-wider cursor-pointer underline underline-offset-2"
        >
          Skip intro →
        </button>
      </div>
    </div>
  );
}

export default WklyTransition;
