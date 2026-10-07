import { useState, useEffect, useRef, useCallback } from 'react';
import { WklyIcon } from './WklyLogo';

export interface ServerSyncInfo {
  stage: 'connecting' | 'authenticating' | 'fetching' | 'ready';
  taskCount: number;
  durationMs: number;
}

interface WklyTransitionProps {
  onComplete: () => void;
  isDarkMode?: boolean;
  syncInfo?: ServerSyncInfo;
}

type TransitionPhase = 'loading' | 'collecting' | 'flying' | 'docked';

export function WklyTransition({
  onComplete,
  isDarkMode = false,
  syncInfo = { stage: 'connecting', taskCount: 0, durationMs: 0 },
}: WklyTransitionProps) {
  const [progress, setProgress] = useState(15);
  const [phase, setPhase] = useState<TransitionPhase>('loading');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [flyVector, setFlyVector] = useState({ dx: 0, dy: 0, scaleX: 1, scaleY: 1 });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const hasTriggeredEndRef = useRef(false);

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

  // Smoothly collect itself and fly to the header WKLY logo
  const triggerCollectAndFly = useCallback(() => {
    if (hasTriggeredEndRef.current) return;
    hasTriggeredEndRef.current = true;

    setProgress(100);
    playTone(784, 'triangle', 0.15);

    // Step 1: Smoothly collect inward
    setPhase('collecting');

    setTimeout(() => {
      // Step 2: Measure target coordinates of #header-wkly-logo
      const headerLogo = document.getElementById('header-wkly-logo');
      const targetRect = headerLogo?.getBoundingClientRect();

      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      const originX = screenW / 2;
      const originY = screenH / 2;

      const targetCenterX = targetRect
        ? targetRect.left + targetRect.width / 2
        : 64;
      const targetCenterY = targetRect
        ? targetRect.top + targetRect.height / 2
        : 24;

      const targetWidth = targetRect?.width || 88;
      const targetHeight = targetRect?.height || 32;

      const baseW = 110;
      const baseH = 36;

      const dx = targetCenterX - originX;
      const dy = targetCenterY - originY;
      const scaleX = targetWidth / baseW;
      const scaleY = targetHeight / baseH;

      setFlyVector({ dx, dy, scaleX, scaleY });
      setPhase('flying');

      // Step 3: Dock smoothly into header
      setTimeout(() => {
        setPhase('docked');
        playTone(987.77, 'sine', 0.1);

        if (headerLogo) {
          headerLogo.animate(
            [
              { transform: 'scale(1.22)', boxShadow: '0 0 16px rgba(168, 85, 247, 0.6)' },
              { transform: 'scale(0.96)' },
              { transform: 'scale(1)', boxShadow: '2.5px 2.5px 0px #000' },
            ],
            { duration: 340, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' }
          );
        }

        setTimeout(() => {
          onComplete();
        }, 120);
      }, 540);
    }, 320);
  }, [onComplete, playTone]);

  // Monitor live server sync lifecycle
  useEffect(() => {
    if (syncInfo.stage === 'connecting') {
      setProgress((p) => Math.max(p, 25));
    } else if (syncInfo.stage === 'authenticating') {
      setProgress((p) => Math.max(p, 50));
    } else if (syncInfo.stage === 'fetching') {
      setProgress((p) => Math.max(p, 75));
    } else if (syncInfo.stage === 'ready') {
      setProgress(100);
      // As soon as data returns from the server, smoothly finish
      const timer = setTimeout(() => {
        triggerCollectAndFly();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [syncInfo.stage, triggerCollectAndFly]);

  // Micro-progress timer while server is working
  useEffect(() => {
    if (hasTriggeredEndRef.current) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 85 && syncInfo.stage !== 'ready') {
          return prev + 3;
        }
        return prev;
      });
    }, 60);

    // Fallback safety timeout so user is never blocked
    const fallbackTimer = setTimeout(() => {
      if (!hasTriggeredEndRef.current) {
        triggerCollectAndFly();
      }
    }, 2800);

    return () => {
      clearInterval(interval);
      clearTimeout(fallbackTimer);
    };
  }, [syncInfo.stage, triggerCollectAndFly]);

  // Telemetry status label and Material icon
  const getStatusDisplay = () => {
    if (syncInfo.stage === 'connecting') {
      return {
        icon: 'dns',
        title: 'Connecting to Backend Server...',
        subtitle: 'Establishing secure TLS handshake with MongoDB & REST API',
      };
    }
    if (syncInfo.stage === 'authenticating') {
      return {
        icon: 'verified_user',
        title: 'Verifying Session Credentials...',
        subtitle: 'Validating JWT token authorization headers',
      };
    }
    if (syncInfo.stage === 'fetching') {
      return {
        icon: 'cloud_sync',
        title: 'Loading User Schedule & Canvases...',
        subtitle: 'Fetching periodized athletic & academic sessions',
      };
    }
    return {
      icon: 'check_circle',
      title: 'User Data Synchronized',
      subtitle: `${syncInfo.taskCount} sessions loaded in ${syncInfo.durationMs || 180}ms`,
    };
  };

  const status = getStatusDisplay();
  const isCollecting = phase === 'collecting' || phase === 'flying' || phase === 'docked';
  const isFlying = phase === 'flying';
  const isDocked = phase === 'docked';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden transition-all duration-500 ease-out ${
        isFlying || isDocked
          ? 'opacity-0 backdrop-blur-none pointer-events-none'
          : 'opacity-100 bg-black/35 dark:bg-black/60 backdrop-blur-[2.5px]'
      }`}
      id="wkly-transition-overlay"
      aria-label="Synchronizing Wkly User Data"
    >
      {/* Non-Intrusive Server Loading Capsule Card */}
      <div
        className={`relative w-full max-w-sm bg-white dark:bg-[#161922] border-2 border-black dark:border-[#383F50] shadow-[6px_6px_0px_#000] dark:shadow-[6px_6px_0px_#000000] rounded-xl p-5 flex flex-col items-center text-center font-display transition-all duration-300 ease-in-out ${
          isCollecting ? 'scale-75 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
        }`}
      >
        {/* Top Bar: Brand, Live Server Badge & Audio Toggle */}
        <div className="w-full flex items-center justify-between pb-3 mb-3 border-b-2 border-black/10 dark:border-[#383F50]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#0E1017] dark:bg-[#1A142A] text-white border border-black dark:border-[#C084FC] rounded flex items-center justify-center">
              <WklyIcon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-black text-xs tracking-wider uppercase text-slate-900 dark:text-[#F3F4F6]">
              WKLY SYNC
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-[#0A291E] text-emerald-900 dark:text-[#10B981] border border-black dark:border-[#10B981] rounded text-[9px] font-mono font-black uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#10B981] animate-ping" />
              <span>LIVE API</span>
            </span>

            <button
              type="button"
              onClick={() => {
                setSoundEnabled((prev) => !prev);
                playTone(520, 'sine', 0.1);
              }}
              title={soundEnabled ? 'Disable Audio FX' : 'Enable Audio FX'}
              className="p-1 text-slate-600 dark:text-[#9CA3AF] hover:text-black dark:hover:text-white rounded border border-transparent hover:border-black dark:hover:border-[#383F50] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px] leading-none">
                {soundEnabled ? 'volume_up' : 'volume_off'}
              </span>
            </button>
          </div>
        </div>

        {/* Animated Central Sync Glyph */}
        <div className="my-2 relative flex items-center justify-center">
          <div className="w-14 h-14 rounded-xl bg-[#FCF9F8] dark:bg-[#1E232E] border-2 border-black dark:border-[#383F50] shadow-[2px_2px_0px_#000] flex items-center justify-center">
            <span
              className={`material-symbols-outlined text-2xl text-[#8455ef] dark:text-[#A855F7] ${
                syncInfo.stage === 'ready' ? '' : 'animate-spin'
              }`}
            >
              {syncInfo.stage === 'ready' ? 'check_circle' : status.icon}
            </span>
          </div>
        </div>

        {/* Real Server Telemetry Message */}
        <div className="w-full space-y-1 mb-4">
          <h4 className="text-xs font-black uppercase text-slate-900 dark:text-[#F3F4F6] tracking-tight">
            {status.title}
          </h4>
          <p className="text-[10px] text-slate-500 dark:text-[#9CA3AF] font-medium leading-tight">
            {status.subtitle}
          </p>
        </div>

        {/* Tactile Progress Bar */}
        <div className="w-full space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-600 dark:text-[#9CA3AF]">
            <span className="uppercase text-[9px] font-display font-black text-slate-700 dark:text-[#F3F4F6]">
              {syncInfo.stage === 'ready' ? 'Data Ready' : 'Syncing Data'}
            </span>
            <span className="text-[#8455ef] dark:text-[#C084FC]">{progress}%</span>
          </div>

          <div className="w-full h-2.5 bg-[#f6f3f2] dark:bg-[#10141C] border-2 border-black dark:border-[#383F50] rounded-full overflow-hidden shadow-[1.5px_1.5px_0_#000] p-0.5 flex">
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-[#8455ef] via-[#38bdf8] to-[#10b981] rounded-full transition-all duration-150 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/25 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Minimal Bottom Bar with Instant Skip */}
        <div className="w-full mt-3 pt-2.5 border-t border-black/10 dark:border-[#383F50] flex items-center justify-between text-[9px] font-mono text-slate-500 dark:text-[#9CA3AF]">
          <span className="truncate">GET /api/tasks</span>
          <button
            type="button"
            onClick={triggerCollectAndFly}
            className="flex items-center gap-1 font-display font-bold hover:text-black dark:hover:text-white uppercase cursor-pointer transition-colors"
          >
            <span>Skip</span>
            <span className="material-symbols-outlined text-[13px] leading-none">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* COLLECTED HIGH-FASHION WKLY LOGO THAT FLIES BUTTERY-SMOOTH TO HEADER */}
      {isCollecting && (
        <div
          style={{
            transform: isFlying || isDocked
              ? `translate3d(${flyVector.dx}px, ${flyVector.dy}px, 0px) scale(${flyVector.scaleX}, ${flyVector.scaleY}) rotate(0deg)`
              : 'translate3d(0px, 0px, 0px) scale(1) rotate(-1.5deg)',
            opacity: isDocked ? 0 : 1,
            transition: isFlying
              ? 'transform 540ms cubic-bezier(0.19, 1, 0.22, 1), opacity 150ms ease 400ms'
              : 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 180ms ease',
            willChange: 'transform, opacity',
          }}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] pointer-events-none flex items-center justify-center font-display"
        >
          <div className="flex items-center gap-2 bg-[#0E1017] dark:bg-[#1A142A] text-white dark:text-[#F3F4F6] border-2 border-black dark:border-[#C084FC]/80 px-2.5 py-1 rounded-lg font-black text-xs tracking-[0.18em] shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#000000] whitespace-nowrap">
            <WklyIcon className="w-4 h-4 text-white dark:text-[#F3F4F6]" />
            <div className="flex items-center gap-1.5 uppercase">
              <span>WKLY</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7] dark:bg-[#C084FC] animate-pulse" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WklyTransition;
