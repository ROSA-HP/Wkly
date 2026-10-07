import { useState, useMemo, useEffect } from 'react';

interface ClockTimePickerProps {
  timeValue: string; // e.g. '08:00 AM' or '08:00' or '14:00 PM'
  durationValue: string; // e.g. '60 min'
  onChangeTime: (formattedTime: string) => void;
  onChangeDuration: (duration: string) => void;
}

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

function extractDigits(raw: string): string {
  if (!raw) return '60';
  const digits = String(raw).replace(/\D/g, '');
  return digits || '60';
}

function parseTimeString(raw: string): { hour: number; minute: number; period: 'AM' | 'PM' } {
  if (!raw) return { hour: 8, minute: 0, period: 'AM' };
  const cleaned = raw.trim().toUpperCase();
  const hasPM = cleaned.includes('PM');
  const hasAM = cleaned.includes('AM');

  const timePart = cleaned.replace(/[A-Z()\s]/g, '').split(' ')[0];
  const parts = timePart.split(':');
  let h = parseInt(parts[0], 10);
  let m = parseInt(parts[1], 10);

  if (isNaN(h)) h = 8;
  if (isNaN(m)) m = 0;

  let period: 'AM' | 'PM' = hasPM ? 'PM' : hasAM ? 'AM' : h >= 12 ? 'PM' : 'AM';

  if (h === 0) {
    h = 12;
    period = 'AM';
  } else if (h > 12) {
    h = h - 12;
    period = 'PM';
  } else if (h === 12 && !hasAM && !hasPM) {
    period = 'PM';
  }

  // Snap minute to nearest 5 for clean clock alignment
  m = Math.round(m / 5) * 5;
  if (m >= 60) m = 55;

  return { hour: h, minute: m, period };
}

function formatTime(hour: number, minute: number, period: 'AM' | 'PM'): string {
  const hh = hour.toString().padStart(2, '0');
  const mm = minute.toString().padStart(2, '0');
  return `${hh}:${mm} ${period}`;
}

export function ClockTimePicker({
  timeValue,
  durationValue,
  onChangeTime,
  onChangeDuration,
}: ClockTimePickerProps) {
  const parsed = useMemo(() => parseTimeString(timeValue), [timeValue]);
  const [hour, setHour] = useState<number>(parsed.hour);
  const [minute, setMinute] = useState<number>(parsed.minute);
  const [period, setPeriod] = useState<'AM' | 'PM'>(parsed.period);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [clockMode, setClockMode] = useState<'hour' | 'minute'>('hour');
  const [durationDigits, setDurationDigits] = useState<string>(() => extractDigits(durationValue));

  useEffect(() => {
    const incomingDigits = String(durationValue || '').replace(/\D/g, '');
    if (incomingDigits && incomingDigits !== durationDigits) {
      setDurationDigits(incomingDigits);
    }
  }, [durationValue]);

  const handleDurationInputChange = (rawInput: string) => {
    // Allow numbers only (strip any non-digit characters)
    const digitsOnly = rawInput.replace(/\D/g, '');
    setDurationDigits(digitsOnly);
    onChangeDuration(digitsOnly ? `${digitsOnly} min` : '');
  };

  const handleDurationBlur = () => {
    if (!durationDigits || parseInt(durationDigits, 10) <= 0) {
      setDurationDigits('60');
      onChangeDuration('60 min');
    } else {
      const normalized = String(parseInt(durationDigits, 10));
      setDurationDigits(normalized);
      onChangeDuration(`${normalized} min`);
    }
  };

  const updateAll = (newHour: number, newMinute: number, newPeriod: 'AM' | 'PM') => {
    setHour(newHour);
    setMinute(newMinute);
    setPeriod(newPeriod);
    onChangeTime(formatTime(newHour, newMinute, newPeriod));
  };

  const handleHourSelect = (h: number) => {
    updateAll(h, minute, period);
    setClockMode('minute');
  };

  const handleMinuteSelect = (m: number) => {
    updateAll(hour, m, period);
  };

  const stepHour = (delta: number) => {
    let next = hour + delta;
    if (next > 12) next = 1;
    if (next < 1) next = 12;
    updateAll(next, minute, period);
  };

  const stepMinute = (delta: number) => {
    let next = minute + delta;
    if (next >= 60) next = 0;
    if (next < 0) next = 55;
    updateAll(hour, next, period);
  };

  const applyPreset = (h: number, m: number, p: 'AM' | 'PM') => {
    updateAll(h, m, p);
  };

  // Calculate angle for clock hand (12 is at top = -90deg in standard polar, or 0deg from top)
  const handAngle = useMemo(() => {
    if (clockMode === 'hour') {
      return ((hour % 12) / 12) * 360;
    } else {
      return (minute / 60) * 360;
    }
  }, [clockMode, hour, minute]);

  return (
    <div className="space-y-2 font-display">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Read-only Clock Trigger Button */}
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-[#F3F4F6] mb-1">
            Start Time (Clock)
          </label>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full text-xs font-black px-3 py-2.5 bg-[#FCF9F8] dark:bg-[#10141C] text-slate-900 dark:text-[#F1F5F9] border-2 border-black dark:border-[#383F50] hover:border-[#8B5CF6] dark:hover:border-[#A855F7] rounded-lg neo-box-sm flex items-center justify-between transition-all cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-[#8B5CF6] dark:bg-[#A855F7] text-white dark:text-[#0B0D11] border border-black flex items-center justify-center text-[11px]">
                <span className="material-symbols-outlined text-[13px] leading-none">schedule</span>
              </span>
              <span className="tracking-wide font-mono text-sm font-black">
                {formatTime(hour, minute, period)}
              </span>
            </span>
            <span className="flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded bg-yellow-300 dark:bg-[#2E1850] text-black dark:text-[#A855F7] border border-black dark:border-[#A855F7]">
              <span>{isOpen ? 'CLOSE' : 'SET TIME'}</span>
              <span className="material-symbols-outlined text-[14px] leading-none">
                {isOpen ? 'expand_less' : 'expand_more'}
              </span>
            </span>
          </button>
        </div>

        {/* Duration Input (Numbers Only) */}
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-[#F3F4F6] mb-1">
            Session Duration (Mins)
          </label>
          <div className="w-full px-3 py-2 bg-[#FCF9F8] dark:bg-[#10141C] text-slate-900 dark:text-[#F1F5F9] border-2 border-black dark:border-[#383F50] focus-within:border-[#8B5CF6] dark:focus-within:border-[#A855F7] rounded-lg neo-box-sm flex items-center justify-between gap-2 transition-all">
            <span className="material-symbols-outlined text-[16px] text-slate-600 dark:text-[#9CA3AF] select-none leading-none">
              timer
            </span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={durationDigits}
              onChange={(e) => handleDurationInputChange(e.target.value)}
              onBlur={handleDurationBlur}
              onKeyDown={(e) => {
                // Allow control/navigation keys and digits 0-9 only
                const allowedKeys = [
                  'Backspace',
                  'Delete',
                  'ArrowLeft',
                  'ArrowRight',
                  'Tab',
                  'Enter',
                  'Home',
                  'End',
                ];
                if (
                  !allowedKeys.includes(e.key) &&
                  !e.ctrlKey &&
                  !e.metaKey &&
                  !/^[0-9]$/.test(e.key)
                ) {
                  e.preventDefault();
                }
              }}
              placeholder="60"
              className="w-full text-xs font-mono font-black text-slate-900 dark:text-[#F1F5F9] bg-transparent focus:outline-none"
            />
            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-[#1E232E] text-slate-700 dark:text-[#9CA3AF] border border-black/30 dark:border-[#383F50] select-none">
              MIN
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Clock Face & Digital Stepper Popover */}
      {isOpen && (
        <div className="p-4 bg-white dark:bg-[#1E232E] border-2 border-black dark:border-[#383F50] rounded-xl neo-box space-y-4 animate-in fade-in zoom-in-95 duration-150">
          {/* Top Digital Readout & Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-black dark:border-[#383F50]">
            <div className="flex items-center gap-1.5">
              {/* Hour Box */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => stepHour(1)}
                  className="w-full py-0.5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-[#161922] rounded text-slate-600 dark:text-slate-300 cursor-pointer"
                  title="Increase hour"
                >
                  <span className="material-symbols-outlined text-[14px] leading-none">keyboard_arrow_up</span>
                </button>
                <button
                  type="button"
                  onClick={() => setClockMode('hour')}
                  className={`px-3 py-1.5 rounded-lg border-2 font-mono text-lg font-black transition-all ${
                    clockMode === 'hour'
                      ? 'bg-[#8B5CF6] dark:bg-[#A855F7] text-white dark:text-[#0B0D11] border-black dark:border-white shadow-[2px_2px_0px_#000]'
                      : 'bg-[#F6F3F2] dark:bg-[#10141C] text-slate-800 dark:text-[#F3F4F6] border-black dark:border-[#383F50]'
                  }`}
                >
                  {hour.toString().padStart(2, '0')}
                </button>
                <button
                  type="button"
                  onClick={() => stepHour(-1)}
                  className="w-full py-0.5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-[#161922] rounded text-slate-600 dark:text-slate-300 cursor-pointer"
                  title="Decrease hour"
                >
                  <span className="material-symbols-outlined text-[14px] leading-none">keyboard_arrow_down</span>
                </button>
              </div>

              <span className="text-xl font-black text-slate-900 dark:text-[#F3F4F6]">:</span>

              {/* Minute Box */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => stepMinute(5)}
                  className="w-full py-0.5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-[#161922] rounded text-slate-600 dark:text-slate-300 cursor-pointer"
                  title="Increase minutes"
                >
                  <span className="material-symbols-outlined text-[14px] leading-none">keyboard_arrow_up</span>
                </button>
                <button
                  type="button"
                  onClick={() => setClockMode('minute')}
                  className={`px-3 py-1.5 rounded-lg border-2 font-mono text-lg font-black transition-all ${
                    clockMode === 'minute'
                      ? 'bg-[#8B5CF6] dark:bg-[#A855F7] text-white dark:text-[#0B0D11] border-black dark:border-white shadow-[2px_2px_0px_#000]'
                      : 'bg-[#F6F3F2] dark:bg-[#10141C] text-slate-800 dark:text-[#F3F4F6] border-black dark:border-[#383F50]'
                  }`}
                >
                  {minute.toString().padStart(2, '0')}
                </button>
                <button
                  type="button"
                  onClick={() => stepMinute(-5)}
                  className="w-full py-0.5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-[#161922] rounded text-slate-600 dark:text-slate-300 cursor-pointer"
                  title="Decrease minutes"
                >
                  <span className="material-symbols-outlined text-[14px] leading-none">keyboard_arrow_down</span>
                </button>
              </div>

              {/* AM / PM Toggle */}
              <div className="flex flex-col gap-1 ml-1">
                <button
                  type="button"
                  onClick={() => updateAll(hour, minute, 'AM')}
                  className={`px-2.5 py-1 text-[11px] font-black border-2 rounded transition-all ${
                    period === 'AM'
                      ? 'bg-yellow-300 dark:bg-[#34D399] text-black dark:text-[#062E1E] border-black shadow-[2px_2px_0px_#000]'
                      : 'bg-[#F6F3F2] dark:bg-[#10141C] text-slate-500 dark:text-slate-400 border-black dark:border-[#383F50]'
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => updateAll(hour, minute, 'PM')}
                  className={`px-2.5 py-1 text-[11px] font-black border-2 rounded transition-all ${
                    period === 'PM'
                      ? 'bg-yellow-300 dark:bg-[#34D399] text-black dark:text-[#062E1E] border-black shadow-[2px_2px_0px_#000]'
                      : 'bg-[#F6F3F2] dark:bg-[#10141C] text-slate-500 dark:text-slate-400 border-black dark:border-[#383F50]'
                  }`}
                >
                  PM
                </button>
              </div>
            </div>

            {/* Mode Helper & Done */}
            <div className="flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setClockMode('hour')}
                  className={`px-2 py-0.5 text-[10px] font-black rounded border border-black dark:border-[#383F50] ${
                    clockMode === 'hour'
                      ? 'bg-black text-white dark:bg-[#A855F7] dark:text-[#0B0D11]'
                      : 'bg-slate-100 dark:bg-[#10141C] text-slate-600 dark:text-slate-400'
                  }`}
                >
                  1. HOUR
                </button>
                <button
                  type="button"
                  onClick={() => setClockMode('minute')}
                  className={`px-2 py-0.5 text-[10px] font-black rounded border border-black dark:border-[#383F50] ${
                    clockMode === 'minute'
                      ? 'bg-black text-white dark:bg-[#A855F7] dark:text-[#0B0D11]'
                      : 'bg-slate-100 dark:bg-[#10141C] text-slate-600 dark:text-slate-400'
                  }`}
                >
                  2. MIN
                </button>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 bg-[#34D399] text-[#062E1E] border-2 border-black rounded-lg text-xs font-black shadow-[2px_2px_0px_#000] neo-btn flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px] leading-none">check</span>
                <span>Lock Time</span>
              </button>
            </div>
          </div>

          {/* Analog Clock Dial */}
          <div className="flex flex-col sm:flex-row items-center justify-around gap-4">
            <div className="relative w-48 h-48 rounded-full bg-[#FCF9F8] dark:bg-[#10141C] border-3 border-black dark:border-[#383F50] shadow-[4px_4px_0px_#000] flex items-center justify-center select-none">
              {/* Clock Hand */}
              <div
                className="absolute w-1 bg-[#8B5CF6] dark:bg-[#A855F7] origin-bottom rounded-full transition-transform duration-200 pointer-events-none"
                style={{
                  height: '62px',
                  bottom: '50%',
                  left: 'calc(50% - 2px)',
                  transform: `rotate(${handAngle}deg)`,
                }}
              />
              {/* Center Pin */}
              <div className="w-3.5 h-3.5 rounded-full bg-black dark:bg-white border-2 border-[#8B5CF6] dark:border-[#A855F7] z-10" />

              {/* Dial Numbers */}
              {(clockMode === 'hour' ? HOURS : MINUTES).map((val, idx) => {
                const angleDeg = idx * 30 - 90;
                const angleRad = (angleDeg * Math.PI) / 180;
                const radius = 72; // px from center
                const x = Math.cos(angleRad) * radius;
                const y = Math.sin(angleRad) * radius;

                const isSelected =
                  clockMode === 'hour' ? hour === val : minute === val;

                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      clockMode === 'hour'
                        ? handleHourSelect(val)
                        : handleMinuteSelect(val)
                    }
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                    }}
                    className={`absolute w-7 h-7 rounded-full text-[11px] font-mono font-black flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#8B5CF6] dark:bg-[#A855F7] text-white dark:text-[#0B0D11] border-2 border-black dark:border-white scale-110 z-20 shadow-[2px_2px_0px_#000]'
                        : 'text-slate-800 dark:text-[#F3F4F6] hover:bg-yellow-200 dark:hover:bg-[#2E1850] hover:text-black dark:hover:text-[#A855F7]'
                    }`}
                  >
                    {clockMode === 'hour' ? val : val.toString().padStart(2, '0')}
                  </button>
                );
              })}
            </div>

            {/* Quick Presets Column */}
            <div className="w-full sm:w-auto flex-1 space-y-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Quick Athlete Slots
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { icon: 'wb_twilight', text: '07:00 AM', h: 7, m: 0, p: 'AM' as const },
                  { icon: 'fitness_center', text: '08:30 AM', h: 8, m: 30, p: 'AM' as const },
                  { icon: 'menu_book', text: '10:00 AM', h: 10, m: 0, p: 'AM' as const },
                  { icon: 'light_mode', text: '12:00 PM', h: 12, m: 0, p: 'PM' as const },
                  { icon: 'biotech', text: '02:00 PM', h: 2, m: 0, p: 'PM' as const },
                  { icon: 'bolt', text: '04:30 PM', h: 4, m: 30, p: 'PM' as const },
                  { icon: 'restaurant', text: '06:00 PM', h: 6, m: 0, p: 'PM' as const },
                  { icon: 'dark_mode', text: '08:00 PM', h: 8, m: 0, p: 'PM' as const },
                ].map((slot) => {
                  const active =
                    hour === slot.h && minute === slot.m && period === slot.p;
                  return (
                    <button
                      key={slot.text}
                      type="button"
                      onClick={() => applyPreset(slot.h, slot.m, slot.p)}
                      className={`px-2 py-1.5 text-[11px] font-bold rounded-lg border-2 text-left transition-all flex items-center gap-1.5 cursor-pointer ${
                        active
                          ? 'bg-yellow-300 dark:bg-[#2E1850] text-black dark:text-[#A855F7] border-black dark:border-[#A855F7] shadow-[2px_2px_0px_#000]'
                          : 'bg-[#FCF9F8] dark:bg-[#10141C] text-slate-800 dark:text-[#F3F4F6] border-black dark:border-[#383F50] hover:bg-slate-100 dark:hover:bg-[#161922]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px] leading-none shrink-0">
                        {slot.icon}
                      </span>
                      <span>{slot.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
