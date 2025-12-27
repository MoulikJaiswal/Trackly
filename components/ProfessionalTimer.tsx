
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Settings2, 
  X, 
  Timer as TimerIcon, 
  Coffee, 
  BrainCircuit,
  Plus,
  Minus
} from 'lucide-react';
import { Card } from './Card';

export const ProfessionalTimer: React.FC = () => {
  const [mode, setMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [focusDuration, setFocusDuration] = useState(60); 
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const timerRef = useRef<any>(null);

  const SHORT_BREAK = 5;
  const LONG_BREAK = 10;

  const getCurrentTotalSeconds = () => {
    if (mode === 'short') return SHORT_BREAK * 60;
    if (mode === 'long') return LONG_BREAK * 60;
    return focusDuration * 60;
  };

  const totalSeconds = getCurrentTotalSeconds();
  
  const radius = 85; 
  const circumference = 2 * Math.PI * radius;
  
  const progressPercentage = timeLeft / totalSeconds;
  const strokeDashoffset = circumference * (1 - progressPercentage);

  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("Audio play failed", e);
    }
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsActive(false);
      playBeep();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(getCurrentTotalSeconds());
  };

  const switchMode = (newMode: 'focus' | 'short' | 'long') => {
    setMode(newMode);
    setIsActive(false);
    if (newMode === 'short') setTimeLeft(SHORT_BREAK * 60);
    else if (newMode === 'long') setTimeLeft(LONG_BREAK * 60);
    else setTimeLeft(focusDuration * 60);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const updateFocusDuration = (val: number) => {
    const newVal = Math.min(480, Math.max(1, val));
    setFocusDuration(newVal);
    if (mode === 'focus' && !isActive) {
      setTimeLeft(newVal * 60);
    }
  };

  return (
    <div className="pt-8 md:pt-10 border-t border-white/5 space-y-6 md:space-y-8">
      <div className="flex justify-between items-center mb-2 px-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <TimerIcon size={20} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 uppercase tracking-[0.1em]">Focus Station</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Efficiency Engine</p>
          </div>
        </div>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2.5 rounded-xl transition-all border ${showSettings ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-100'}`}
        >
          {showSettings ? <X size={20} /> : <Settings2 size={20} />}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        
        {/* Main Timer Display */}
        <div className="lg:col-span-7">
          <Card className="relative p-6 md:p-12 flex flex-col items-center justify-center bg-slate-900/40 border-indigo-500/10 hover:border-indigo-500/20 shadow-[0_0_50px_rgba(0,0,0,0.3)] min-h-[380px] md:min-h-[440px]">
            {/* Background Glow */}
            <div className={`absolute inset-0 opacity-20 transition-all duration-1000 pointer-events-none rounded-3xl ${
              isActive 
                ? mode === 'focus' ? 'bg-indigo-500 shadow-[inset_0_0_100px_rgba(79,70,229,0.3)]' : 'bg-emerald-500 shadow-[inset_0_0_100px_rgba(16,185,129,0.3)]'
                : 'bg-transparent'
            }`} />

            <div className="relative z-10 w-full flex flex-col items-center">
              {/* Progress Circle - Fixed Geometry */}
              <div className="relative mb-8 md:mb-12">
                <svg 
                  viewBox="0 0 200 200" 
                  className="transform -rotate-90 w-60 h-60 md:w-72 md:h-72 block"
                >
                  <circle 
                    cx="100" 
                    cy="100" 
                    r={radius} 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    fill="transparent" 
                    className="text-white/5" 
                  />
                  <circle 
                    cx="100" 
                    cy="100" 
                    r={radius} 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    fill="transparent" 
                    className={`transition-all duration-300 ease-linear ${
                      mode === 'focus' ? 'text-indigo-500' : 'text-emerald-500'
                    }`}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ 
                      filter: `drop-shadow(0 0 12px ${mode === 'focus' ? 'rgba(79,70,229,0.6)' : 'rgba(16,185,129,0.6)'})`,
                      transition: isActive ? 'stroke-dashoffset 1s linear, color 0.3s ease' : 'stroke-dashoffset 0.3s ease'
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className={`text-[10px] font-bold uppercase tracking-[0.3em] mb-2 ${mode === 'focus' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                    {mode === 'focus' ? 'Deep Work' : 'Recovery'}
                  </span>
                  <div className="text-5xl md:text-6xl font-mono font-bold text-white tracking-tighter tabular-nums drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                    {formatTime(timeLeft)}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-6 md:gap-8">
                <button 
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-3 md:p-3.5 rounded-2xl transition-all border ${soundEnabled ? 'bg-white/5 border-white/5 text-slate-300' : 'bg-slate-800 border-white/5 text-slate-600'}`}
                >
                  {soundEnabled ? <Volume2 size={20} className="md:w-6 md:h-6" /> : <VolumeX size={20} className="md:w-6 md:h-6" />}
                </button>

                <button 
                  onClick={toggleTimer}
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-[2rem] flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-2xl relative overflow-hidden group ${
                    isActive 
                      ? 'bg-rose-600 text-white shadow-rose-600/30' 
                      : 'bg-indigo-600 text-white shadow-indigo-600/30'
                  }`}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {isActive ? <Pause size={32} className="md:w-9 md:h-9" fill="white" /> : <Play size={32} className="ml-2 md:w-9 md:h-9" fill="white" />}
                </button>

                <button 
                  onClick={resetTimer}
                  className="p-3 md:p-3.5 rounded-2xl bg-white/5 border border-white/5 text-slate-300 hover:text-white transition-all hover:bg-white/10"
                >
                  <RotateCcw size={20} className="md:w-6 md:h-6" />
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Settings & Mode Selector */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-5 md:p-6 bg-slate-900/60 border-white/5">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <BrainCircuit size={14} /> Session Mode
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'focus', label: 'Deep Focus', sub: `${focusDuration} min`, icon: BrainCircuit, color: 'indigo' },
                { id: 'short', label: 'Quick Break', sub: '5 min', icon: Coffee, color: 'emerald' },
                { id: 'long', label: 'Long Break', sub: '10 min', icon: Coffee, color: 'emerald' }
              ].map(m => (
                <button 
                  key={m.id}
                  onClick={() => switchMode(m.id as any)}
                  className={`flex items-center justify-between p-3 md:p-4 rounded-2xl transition-all border group ${
                    mode === m.id 
                      ? `bg-${m.color}-600/10 border-${m.color}-500/50 text-${m.color}-400` 
                      : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/[0.08] hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 md:p-2.5 rounded-xl transition-all ${
                      mode === m.id ? `bg-${m.color}-500 text-white` : 'bg-slate-800 text-slate-500'
                    }`}>
                      <m.icon size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold">{m.label}</p>
                      <p className="text-[10px] font-bold opacity-50 uppercase tracking-wider">{m.sub}</p>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full transition-all ${
                    mode === m.id ? 'bg-current opacity-100 animate-pulse' : 'opacity-0'
                  }`} />
                </button>
              ))}
            </div>
          </Card>

          {showSettings && (
            <Card className="p-6 md:p-8 bg-indigo-600/5 border-indigo-500/20 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-end mb-4">
                    <h4 className="text-sm font-bold text-slate-100 tracking-tight">Focus Duration</h4>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-mono font-bold text-indigo-400">{focusDuration}</span>
                      <span className="text-[10px] font-bold text-indigo-400/50 uppercase">min</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <button 
                      onClick={() => updateFocusDuration(focusDuration - 5)}
                      className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                    >
                      <Minus size={18} />
                    </button>
                    <input 
                      type="range" min="1" max="480" step="1"
                      value={focusDuration} 
                      onChange={(e) => updateFocusDuration(parseInt(e.target.value))}
                      className="flex-grow h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
                    />
                    <button 
                      onClick={() => updateFocusDuration(focusDuration + 5)}
                      className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[25, 45, 60, 90, 120, 180, 240, 480].map(mins => (
                      <button 
                        key={mins}
                        onClick={() => updateFocusDuration(mins)}
                        className={`py-2 px-1 rounded-lg text-[10px] font-bold transition-all border ${
                          focusDuration === mins 
                            ? 'bg-indigo-600 border-indigo-500 text-white' 
                            : 'bg-white/5 border-transparent text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <span>Break Durations</span>
                    <span className="text-indigo-400/50 italic">Fixed</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Short</p>
                      <p className="text-sm font-mono font-bold text-emerald-400">05:00</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Long</p>
                      <p className="text-sm font-mono font-bold text-emerald-400">10:00</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
