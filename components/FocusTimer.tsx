
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings2, 
  X, 
  Zap,
  Atom,
  Calculator,
  Waves,
  CheckCircle2,
  ListTodo,
  ChevronDown
} from 'lucide-react';
import { JEE_SYLLABUS } from '../constants';
import { Target } from '../types';

interface FocusTimerProps {
  targets?: Target[];
}

export const FocusTimer: React.FC<FocusTimerProps> = ({ targets = [] }) => {
  const [selectedSubject, setSelectedSubject] = useState<keyof typeof JEE_SYLLABUS>('Physics');
  const [focusDuration, setFocusDuration] = useState(60); 
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string>('');
  
  const [todayStats, setTodayStats] = useState({ Physics: 0, Chemistry: 0, Maths: 0 });
  const timerRef = useRef<any>(null);
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const brownNoiseNodeRef = useRef<ScriptProcessorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const savedStats = localStorage.getItem(`zenith_stats_${today}`);
    if (savedStats) setTodayStats(JSON.parse(savedStats));
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`zenith_stats_${today}`, JSON.stringify(todayStats));
  }, [todayStats]);

  const toggleAudio = () => {
    const shouldEnable = !soundEnabled;
    setSoundEnabled(shouldEnable);

    if (shouldEnable) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx?.state === 'suspended') ctx.resume();
      
      // Create Brown Noise buffer
      const bufferSize = 4096;
      const brownNoise = ctx!.createScriptProcessor(bufferSize, 1, 1);
      brownNoise.onaudioprocess = (e) => {
        const output = e.outputBuffer.getChannelData(0);
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5;
        }
      };

      const gainNode = ctx!.createGain();
      gainNode.gain.value = 0.05;
      
      brownNoise.connect(gainNode);
      gainNode.connect(ctx!.destination);
      
      brownNoiseNodeRef.current = brownNoise;
      gainNodeRef.current = gainNode;
    } else {
      brownNoiseNodeRef.current?.disconnect();
      gainNodeRef.current?.disconnect();
    }
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => t - 1);
        setTodayStats(prev => ({ ...prev, [selectedSubject]: prev[selectedSubject] + 1 }));
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      clearInterval(timerRef.current);
      setIsActive(false);
      if (soundEnabled) toggleAudio();
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft, selectedSubject]);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(focusDuration * 60);
    if (soundEnabled) toggleAudio();
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0 
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const subjects = useMemo(() => [
    { id: 'Physics', icon: Atom, color: 'text-cyan-400', border: 'border-cyan-500/50', shadow: 'shadow-cyan-500/20', bg: 'bg-cyan-500', gradient: 'from-cyan-500 to-blue-600' },
    { id: 'Chemistry', icon: Zap, color: 'text-amber-400', border: 'border-amber-500/50', shadow: 'shadow-amber-500/20', bg: 'bg-amber-500', gradient: 'from-amber-500 to-orange-600' },
    { id: 'Maths', icon: Calculator, color: 'text-rose-400', border: 'border-rose-500/50', shadow: 'shadow-rose-500/20', bg: 'bg-rose-500', gradient: 'from-rose-500 to-pink-600' },
  ], []);

  const currentSubject = subjects.find(s => s.id === selectedSubject)!;
  const activeTaskObj = targets.find(t => t.id === selectedTask);
  const pendingTasks = targets.filter(t => !t.completed);

  // SVG Config
  const radius = 120; 
  const circumference = 2 * Math.PI * radius;
  const progressPercentage = timeLeft / (focusDuration * 60);
  const strokeDashoffset = circumference * (1 - progressPercentage);

  return (
    <div className="w-full max-w-xl mx-auto min-h-[600px] flex flex-col items-center justify-center relative animate-in fade-in duration-700">
      
      {/* 1. Top Section: Subject & Task Selectors */}
      <div className="w-full flex flex-col items-center gap-6 mb-10 z-10">
        
        {/* Subject Tabs */}
        <div className="p-1.5 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center shadow-xl">
          {subjects.map(s => {
            const isSelected = selectedSubject === s.id;
            return (
              <button
                key={s.id}
                onClick={() => !isActive && setSelectedSubject(s.id as any)}
                className={`
                  relative flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300
                  ${isSelected ? 'text-white' : 'text-slate-500 hover:text-slate-300'}
                  ${isActive && !isSelected ? 'opacity-30 cursor-not-allowed' : ''}
                `}
              >
                {isSelected && (
                  <div className={`absolute inset-0 ${s.bg} rounded-full opacity-20 animate-in zoom-in-90 duration-300`} />
                )}
                {isSelected && (
                  <div className={`absolute inset-0 border ${s.border} rounded-full opacity-100 animate-in zoom-in-95 duration-300`} />
                )}
                <s.icon size={14} className={isSelected ? s.color : 'text-slate-500'} />
                <span>{s.id}</span>
              </button>
            )
          })}
        </div>

        {/* Task Dropdown Pill */}
        <div className="relative group w-64 z-20">
            <div className={`absolute inset-0 bg-gradient-to-r ${currentSubject.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
            <div className={`
                flex items-center justify-between px-4 py-3 bg-slate-900/60 border border-white/10 rounded-2xl cursor-pointer transition-all duration-300
                ${activeTaskObj ? 'border-white/20 bg-slate-800/80' : 'hover:bg-slate-800/60'}
            `}>
                <div className="flex items-center gap-3 overflow-hidden">
                    {activeTaskObj ? (
                        <div className={`p-1 rounded-full ${currentSubject.bg} bg-opacity-20`}>
                            <CheckCircle2 size={12} className={currentSubject.color} />
                        </div>
                    ) : (
                        <ListTodo size={14} className="text-slate-500 shrink-0" />
                    )}
                    
                    <select 
                        value={selectedTask}
                        onChange={(e) => setSelectedTask(e.target.value)}
                        disabled={isActive}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    >
                        <option value="">Select a Goal...</option>
                        {pendingTasks.map(t => <option key={t.id} value={t.id}>{t.text}</option>)}
                    </select>

                    <span className={`text-xs font-medium truncate ${activeTaskObj ? 'text-white' : 'text-slate-500'}`}>
                        {activeTaskObj ? activeTaskObj.text : 'Select Focus Goal...'}
                    </span>
                </div>
                <ChevronDown size={14} className="text-slate-600" />
            </div>
        </div>
      </div>

      {/* 2. Middle Section: The Timer Ring */}
      <div className="relative mb-12">
        {/* Back glow */}
        <div className={`
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full blur-[100px] transition-all duration-1000
          ${isActive ? `${currentSubject.bg} opacity-20` : 'bg-indigo-500 opacity-5'}
        `} />

        <div className="relative w-80 h-80 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl">
                {/* Defs for gradients */}
                <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={selectedSubject === 'Physics' ? '#22d3ee' : selectedSubject === 'Chemistry' ? '#fbbf24' : '#fb7185'} />
                        <stop offset="100%" stopColor={selectedSubject === 'Physics' ? '#3b82f6' : selectedSubject === 'Chemistry' ? '#f97316' : '#db2777'} />
                    </linearGradient>
                </defs>

                {/* Background Track */}
                <circle 
                    cx="50%" cy="50%" r={radius} 
                    className="stroke-slate-800/50 fill-none" 
                    strokeWidth="4" 
                />

                {/* Progress Arc */}
                <circle 
                    cx="50%" cy="50%" r={radius} 
                    stroke="url(#progressGradient)"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-linear"
                    style={{ 
                        filter: `drop-shadow(0 0 8px ${currentSubject.color})`,
                        transition: isActive ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                />
            </svg>

            {/* Content Inside Ring */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`
                    text-7xl font-display font-medium tracking-tight tabular-nums transition-colors duration-300 select-none
                    ${isActive ? 'text-white' : 'text-slate-400'}
                `}>
                    {formatTime(timeLeft)}
                </span>
                
                <div className={`
                    mt-4 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border transition-all duration-500
                    ${isActive 
                        ? `bg-slate-900 border-${currentSubject.color.split('-')[1]}-500/30 ${currentSubject.color}` 
                        : 'bg-transparent border-transparent text-slate-600'}
                `}>
                    {isActive ? 'Flow State' : 'Paused'}
                </div>
            </div>
        </div>
      </div>

      {/* 3. Bottom Section: Controls Dock */}
      <div className="flex items-center gap-6 p-2 bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-[2rem] shadow-2xl transition-all duration-300 hover:bg-slate-900/70 hover:border-white/10 hover:shadow-indigo-500/5">
        
        {/* Sound Toggle */}
        <button 
          onClick={toggleAudio}
          className={`
            w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
            ${soundEnabled ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}
          `}
          title="Brown Noise"
        >
           <Waves size={18} className={soundEnabled ? 'animate-pulse' : ''} />
        </button>

        {/* Main Play/Pause */}
        <button 
          onClick={() => setIsActive(!isActive)}
          className={`
            w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg active:scale-95
            ${isActive 
                ? 'bg-slate-100 text-slate-900 hover:bg-white shadow-white/10' 
                : `bg-gradient-to-br ${currentSubject.gradient} text-white shadow-${currentSubject.color.split('-')[1]}-500/30`}
          `}
        >
          {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
        </button>

        {/* Settings Toggle */}
        <div className="relative">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`
                w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                ${showSettings ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}
            `}
          >
            {showSettings ? <X size={18} /> : <Settings2 size={18} />}
          </button>

          {/* Settings Popup */}
          {showSettings && (
             <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-64 p-4 bg-slate-900 border border-white/10 rounded-2xl shadow-xl animate-in slide-in-from-bottom-2 fade-in duration-200">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Duration</span>
                    <span className="text-sm font-mono font-bold text-white">{focusDuration}m</span>
                </div>
                <input 
                  type="range" min="5" max="180" step="5"
                  value={focusDuration}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setFocusDuration(val);
                    if(!isActive) setTimeLeft(val * 60);
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-white"
                />
                <div className="flex justify-between mt-4">
                     <button onClick={resetTimer} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300 transition-colors">
                        <RotateCcw size={10} /> Reset
                     </button>
                </div>
             </div>
          )}
        </div>

      </div>

    </div>
  );
};
