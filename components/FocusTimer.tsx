
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Settings2, 
  X, 
  Timer, 
  Zap,
  Atom,
  Calculator,
  Plus,
  Minus
} from 'lucide-react';
import { Card } from './Card';
import { JEE_SYLLABUS } from '../constants';

export const FocusTimer: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<keyof typeof JEE_SYLLABUS>('Physics');
  const [focusDuration, setFocusDuration] = useState(60); 
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Stats state: Tracks seconds studied today per subject
  const [todayStats, setTodayStats] = useState({ Physics: 0, Chemistry: 0, Maths: 0 });
  
  const timerRef = useRef<any>(null);

  // Load stats from local storage on mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const savedStats = localStorage.getItem(`zenith_stats_${today}`);
    if (savedStats) {
      setTodayStats(JSON.parse(savedStats));
    }
  }, []);

  // Persist stats to local storage whenever they change
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`zenith_stats_${today}`, JSON.stringify(todayStats));
  }, [todayStats]);

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
        // Increment stats for the selected subject
        setTodayStats(prev => ({
          ...prev,
          [selectedSubject]: prev[selectedSubject] + 1
        }));
      }, 1000);
    } else if (timeLeft === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsActive(false);
      playBeep();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, selectedSubject]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(focusDuration * 60);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatStatsTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const updateFocusDuration = (val: number) => {
    const newVal = Math.min(480, Math.max(1, val));
    setFocusDuration(newVal);
    if (!isActive) {
      setTimeLeft(newVal * 60);
    }
  };

  // Circular Progress Calculation
  const radius = 85; 
  const circumference = 2 * Math.PI * radius;
  const totalSeconds = focusDuration * 60;
  const progressPercentage = timeLeft / totalSeconds;
  const strokeDashoffset = circumference * (1 - progressPercentage);

  const subjects = [
    { id: 'Physics', icon: Atom, color: 'text-blue-400', bg: 'bg-blue-500', border: 'border-blue-500' },
    { id: 'Chemistry', icon: Zap, color: 'text-orange-400', bg: 'bg-orange-500', border: 'border-orange-500' },
    { id: 'Maths', icon: Calculator, color: 'text-rose-400', bg: 'bg-rose-500', border: 'border-rose-500' },
  ] as const;

  const currentSubjectColor = subjects.find(s => s.id === selectedSubject)?.color || 'text-indigo-500';

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-2 px-1">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Focus Station</h2>
          <p className="text-xs text-indigo-400 uppercase tracking-widest mt-1 font-bold">Subject-wise Tracker</p>
        </div>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={`p-3 rounded-xl transition-all border ${showSettings ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-100'}`}
        >
          {showSettings ? <X size={20} /> : <Settings2 size={20} />}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {subjects.map(subj => (
          <div key={subj.id} className="bg-slate-900/40 border border-white/10 rounded-2xl p-3 md:p-4 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-2 opacity-10 ${subj.color}`}>
              <subj.icon size={32} />
            </div>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${subj.color}`}>{subj.id}</p>
            <p className="text-lg md:text-xl font-mono font-bold text-white">{formatStatsTime(todayStats[subj.id])}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start transition-all duration-300">
        
        {/* Main Timer Display */}
        <div className={`transition-all duration-500 ${showSettings ? 'lg:col-span-7' : 'lg:col-span-8 lg:col-start-3'}`}>
          <Card className="relative p-6 md:p-12 flex flex-col items-center justify-center bg-slate-900/40 border-indigo-500/10 shadow-[0_0_50px_rgba(0,0,0,0.3)] min-h-[400px]">
            {/* Background Glow */}
            <div className={`absolute inset-0 opacity-10 transition-all duration-1000 pointer-events-none rounded-3xl ${
              isActive 
                ? `bg-indigo-500 shadow-[inset_0_0_100px_rgba(79,70,229,0.3)]`
                : 'bg-transparent'
            }`} />

            <div className="relative z-10 w-full flex flex-col items-center">
              
              {/* Subject Selector Pills */}
              <div className="flex gap-2 mb-8 bg-black/30 p-1.5 rounded-2xl border border-white/5">
                {subjects.map(s => (
                  <button
                    key={s.id}
                    onClick={() => !isActive && setSelectedSubject(s.id as any)}
                    disabled={isActive}
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                      selectedSubject === s.id 
                        ? `${s.bg} text-white shadow-lg` 
                        : 'text-slate-400 hover:bg-white/5 disabled:opacity-50'
                    }`}
                  >
                    <s.icon size={12} />
                    {s.id}
                  </button>
                ))}
              </div>

              {/* Progress Circle */}
              <div className="relative mb-10">
                <svg viewBox="0 0 200 200" className="transform -rotate-90 w-64 h-64 md:w-72 md:h-72 block">
                  <circle cx="100" cy="100" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
                  <circle 
                    cx="100" cy="100" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" 
                    className={`transition-all duration-1000 ease-linear ${currentSubjectColor}`}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 8px currentColor)` }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-5xl md:text-6xl font-mono font-bold text-white tracking-tighter tabular-nums drop-shadow-xl">
                    {formatTime(timeLeft)}
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">
                    {isActive ? 'Tracking Time' : 'Ready'}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-8">
                <button onClick={() => setSoundEnabled(!soundEnabled)} className={`p-4 rounded-2xl transition-all border ${soundEnabled ? 'bg-white/5 border-white/5 text-slate-300' : 'bg-slate-800 border-white/5 text-slate-600'}`}>
                  {soundEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
                </button>

                <button onClick={toggleTimer} className={`w-20 h-20 md:w-24 md:h-24 rounded-[2.5rem] flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-2xl relative overflow-hidden group ${isActive ? 'bg-rose-600 text-white shadow-rose-600/30' : 'bg-indigo-600 text-white shadow-indigo-600/30'}`}>
                  {isActive ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" className="ml-1" />}
                </button>

                <button onClick={resetTimer} className="p-4 rounded-2xl bg-white/5 border border-white/5 text-slate-300 hover:text-white transition-all hover:bg-white/10">
                  <RotateCcw size={22} />
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="lg:col-span-5 space-y-6 animate-in slide-in-from-right-4 duration-300">
            <Card className="p-6 md:p-8 bg-slate-900/60 border-white/5">
                <div className="flex justify-between items-end mb-6">
                  <h4 className="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-2">
                    <Timer size={16} className="text-indigo-400" /> Target Duration
                  </h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-mono font-bold text-indigo-400">{focusDuration}</span>
                    <span className="text-[10px] font-bold text-indigo-400/50 uppercase">min</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mb-8">
                  <button onClick={() => updateFocusDuration(focusDuration - 5)} className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"><Minus size={18} /></button>
                  <input type="range" min="1" max="180" step="1" value={focusDuration} onChange={(e) => updateFocusDuration(parseInt(e.target.value))} className="flex-grow h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  <button onClick={() => updateFocusDuration(focusDuration + 5)} className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"><Plus size={18} /></button>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[25, 45, 60, 90, 120, 150, 180].map(mins => (
                    <button key={mins} onClick={() => updateFocusDuration(mins)} className={`py-2 px-1 rounded-lg text-[10px] font-bold transition-all border ${focusDuration === mins ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-transparent text-slate-500 hover:text-slate-300'}`}>
                      {mins}m
                    </button>
                  ))}
                </div>
            </Card>

            <div className="bg-indigo-900/10 border border-indigo-500/20 p-5 rounded-2xl">
              <div className="flex gap-3">
                 <Zap size={20} className="text-indigo-400" />
                 <div>
                   <h4 className="text-sm font-bold text-white mb-1">Pro Tip</h4>
                   <p className="text-xs text-indigo-200/70 leading-relaxed">
                     Switching subjects every 2 hours prevents cognitive fatigue. Use this timer to strictly enforce your subject blocks.
                   </p>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
