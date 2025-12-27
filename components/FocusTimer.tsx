
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Settings2, 
  X, 
  Zap,
  Atom,
  Calculator,
  Brain,
  Waves,
  CheckCircle2,
  ListTodo
} from 'lucide-react';
import { Card } from './Card';
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
  const [soundEnabled, setSoundEnabled] = useState(false); // Default to off for audio policy
  const [selectedTask, setSelectedTask] = useState<string>('');
  
  const [todayStats, setTodayStats] = useState({ Physics: 0, Chemistry: 0, Maths: 0 });
  const timerRef = useRef<any>(null);
  
  // Audio Context Refs
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

  // Audio Engine: Brown Noise Generator (Scientific Focus Sound)
  const toggleAudio = () => {
    const shouldEnable = !soundEnabled;
    setSoundEnabled(shouldEnable);

    if (shouldEnable) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      if (ctx?.state === 'suspended') ctx.resume();

      const bufferSize = 4096;
      const brownNoise = ctx!.createScriptProcessor(bufferSize, 1, 1);
      
      brownNoise.onaudioprocess = (e) => {
        const output = e.outputBuffer.getChannelData(0);
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5; // Gain compensation
        }
      };

      const gainNode = ctx!.createGain();
      gainNode.gain.value = 0.08; // Gentle volume
      
      brownNoise.connect(gainNode);
      gainNode.connect(ctx!.destination);
      
      brownNoiseNodeRef.current = brownNoise;
      gainNodeRef.current = gainNode;
    } else {
      // Cleanup
      if (brownNoiseNodeRef.current) brownNoiseNodeRef.current.disconnect();
      if (gainNodeRef.current) gainNodeRef.current.disconnect();
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (brownNoiseNodeRef.current) brownNoiseNodeRef.current.disconnect();
      if (gainNodeRef.current) gainNodeRef.current.disconnect();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => t - 1);
        setTodayStats(prev => ({
          ...prev,
          [selectedSubject]: prev[selectedSubject] + 1
        }));
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsActive(false);
      playBeep();
      if (soundEnabled) toggleAudio(); // Turn off noise when done
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, selectedSubject]);

  const toggleTimer = () => {
    const willBeActive = !isActive;
    setIsActive(willBeActive);
    
    // Auto-enable audio on start if user prefers (optional UX, keeping manual for now)
    // if (willBeActive && !soundEnabled) toggleAudio();
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(focusDuration * 60);
    if (soundEnabled) toggleAudio();
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
    if (!isActive) setTimeLeft(newVal * 60);
  };

  const subjects = useMemo(() => [
    { id: 'Physics', icon: Atom, color: 'text-blue-400', ringColor: 'stroke-blue-500', glow: 'shadow-blue-500/20', accent: '#60a5fa' },
    { id: 'Chemistry', icon: Zap, color: 'text-orange-400', ringColor: 'stroke-orange-500', glow: 'shadow-orange-500/20', accent: '#fb923c' },
    { id: 'Maths', icon: Calculator, color: 'text-rose-400', ringColor: 'stroke-rose-400', glow: 'shadow-rose-500/20', accent: '#fb7185' },
  ], []);

  const currentSubject = subjects.find(s => s.id === selectedSubject)!;
  const activeTaskObj = targets.find(t => t.id === selectedTask);
  const pendingTasks = targets.filter(t => !t.completed);

  // Circular Progress Metrics
  const radius = 88; 
  const circumference = 2 * Math.PI * radius;
  const progressPercentage = timeLeft / (focusDuration * 60);
  const strokeDashoffset = circumference * (1 - progressPercentage);

  // Tick Marks Generation
  const ticks = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => {
      const angle = (i * 6) * (Math.PI / 180);
      const isMajor = i % 5 === 0;
      const innerR = isMajor ? radius - 15 : radius - 10;
      const outerR = radius - 5;
      const x1 = 100 + innerR * Math.cos(angle);
      const y1 = 100 + innerR * Math.sin(angle);
      const x2 = 100 + outerR * Math.cos(angle);
      const y2 = 100 + outerR * Math.sin(angle);
      return (
        <line 
          key={i} 
          x1={x1} y1={y1} x2={x2} y2={y2} 
          stroke="currentColor" 
          strokeWidth={isMajor ? 2 : 1}
          className={isMajor ? "text-white/20" : "text-white/10"}
        />
      );
    });
  }, [radius]);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700">
      {/* Header Info */}
      <div className="flex justify-between items-end px-1">
        <div>
          <h2 className="text-2xl md:text-4xl font-display font-extrabold text-white tracking-tight">Focus Station</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></div>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.2em]">{isActive ? 'Quantum Flow Active' : 'System Ready'}</p>
          </div>
        </div>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={`p-3 rounded-2xl transition-all border ${showSettings ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'}`}
        >
          {showSettings ? <X size={20} /> : <Settings2 size={20} />}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        
        {/* Main Panel */}
        <div className={`transition-all duration-500 ${showSettings ? 'lg:col-span-7' : 'lg:col-span-8 lg:col-start-3'}`}>
          <Card className="relative overflow-hidden p-8 md:p-12 flex flex-col items-center bg-[#0B1121] border-white/5 shadow-2xl min-h-[500px]">
            {/* Background Glow Pulse */}
            <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full mix-blend-screen filter blur-[100px] animate-pulse"
                    style={{ backgroundColor: `${currentSubject.accent}15` }} />
            </div>

            {/* Subject Selector (Segmented) */}
            <div className="relative z-10 flex bg-white/5 p-1 rounded-2xl border border-white/5 mb-6 w-full max-w-sm">
              {subjects.map(s => {
                const isSelected = selectedSubject === s.id;
                return (
                  <button
                    key={s.id}
                    disabled={isActive}
                    onClick={() => setSelectedSubject(s.id as any)}
                    className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                      isSelected ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                    } disabled:opacity-50`}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 bg-white/10 rounded-xl shadow-sm border border-white/5" 
                           style={{ viewTransitionName: 'subject-highlight' }} />
                    )}
                    <span className="relative z-10"><s.icon size={14} className={isSelected ? s.color : ''} /></span>
                    <span className="relative z-10 hidden sm:inline">{s.id}</span>
                  </button>
                );
              })}
            </div>

            {/* Task Linking (New Feature) */}
            <div className="relative z-20 w-full max-w-xs mb-8">
               <div className={`relative flex items-center bg-[#050914] border rounded-xl px-3 py-2 transition-all ${activeTaskObj ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10'}`}>
                  <ListTodo size={14} className={activeTaskObj ? 'text-emerald-400' : 'text-slate-500'} />
                  <select 
                    value={selectedTask}
                    onChange={(e) => setSelectedTask(e.target.value)}
                    disabled={isActive}
                    className="w-full bg-transparent text-xs font-bold text-white outline-none ml-2 appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-slate-900 text-slate-400">Select Active Task (Optional)</option>
                    {pendingTasks.map(t => (
                      <option key={t.id} value={t.id} className="bg-slate-900 text-white truncate">
                         {t.text.substring(0, 30)}{t.text.length > 30 ? '...' : ''}
                      </option>
                    ))}
                  </select>
                  {activeTaskObj && <CheckCircle2 size={14} className="text-emerald-400 absolute right-3" />}
               </div>
            </div>

            {/* Advanced Timer Ring */}
            <div className="relative mb-12 group">
              <svg viewBox="0 0 200 200" className="transform -rotate-90 w-72 h-72 md:w-80 md:h-80 block">
                 {/* Tick Marks Ring */}
                 <g className="opacity-50">{ticks}</g>

                {/* Background Track */}
                <circle cx="100" cy="100" r={radius} stroke="currentColor" strokeWidth="2" fill="transparent" className="text-white/5" />
                
                {/* Active Progress Ring */}
                <circle 
                  cx="100" cy="100" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" 
                  className={`transition-all duration-300 ease-linear ${currentSubject.ringColor}`}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ 
                    filter: `drop-shadow(0 0 8px ${currentSubject.accent})`,
                    transition: isActive ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.4s ease'
                  }}
                />
              </svg>

              {/* Inner Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className={`mb-4 transition-all duration-500 ${isActive ? 'scale-110' : 'scale-100'}`}>
                   <div className={`p-3 rounded-full bg-white/5 border border-white/5 ${currentSubject.color} backdrop-blur-md`}>
                     <currentSubject.icon size={24} />
                   </div>
                </div>
                <div className={`text-6xl md:text-7xl font-mono font-bold text-white tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]`}
                     style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatTime(timeLeft)}
                </div>
                <div className="mt-3 flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                   {soundEnabled && <div className="flex gap-0.5 items-end h-3">
                      <div className="w-0.5 bg-emerald-400 animate-[bounce_0.5s_infinite] h-1.5"></div>
                      <div className="w-0.5 bg-emerald-400 animate-[bounce_0.7s_infinite] h-3"></div>
                      <div className="w-0.5 bg-emerald-400 animate-[bounce_0.6s_infinite] h-2"></div>
                   </div>}
                   <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                     {soundEnabled ? 'Neural Audio' : isActive ? 'Focus Mode' : 'Paused'}
                   </span>
                </div>
              </div>
            </div>

            {/* Primary Controls */}
            <div className="relative z-10 flex items-center gap-8">
              <button 
                onClick={toggleAudio}
                className={`p-4 rounded-full border transition-all active:scale-95 group relative ${soundEnabled ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-transparent border-transparent text-slate-600 hover:bg-white/5'}`}
              >
                {soundEnabled ? <Waves size={24} className="animate-pulse" /> : <Waves size={24} />}
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity text-slate-500">Brown Noise</span>
              </button>

              <button 
                onClick={toggleTimer}
                className={`w-24 h-24 rounded-[3rem] flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl relative overflow-hidden group ${
                  isActive ? 'bg-rose-500 hover:bg-rose-400' : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
                style={{
                   boxShadow: isActive ? '0 0 40px -10px rgba(244, 63, 94, 0.4)' : '0 0 40px -10px rgba(79, 70, 229, 0.4)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {isActive ? <Pause size={36} fill="white" className="drop-shadow-md" /> : <Play size={36} className="ml-1 drop-shadow-md" fill="white" />}
              </button>

              <button 
                onClick={resetTimer}
                className="p-4 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-all active:scale-95 active:rotate-180 duration-500"
              >
                <RotateCcw size={20} />
              </button>
            </div>
          </Card>
        </div>

        {/* Dynamic Sidebar */}
        <div className={`space-y-6 transition-all duration-500 ${showSettings ? 'lg:col-span-5 translate-x-0 opacity-100' : 'lg:col-span-4 lg:hidden translate-x-10 opacity-0 pointer-events-none'}`}>
          <Card className="bg-[#0B1121] p-6 border-white/5">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Settings2 size={14} /> Session Config
            </h4>
            
            <div className="space-y-8">
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-slate-200">Duration</span>
                <span className="text-2xl font-mono font-bold text-white">{focusDuration}<span className="text-xs text-slate-500 ml-1">min</span></span>
              </div>
              
              <div className="px-2">
                <input 
                  type="range" min="5" max="240" step="5"
                  value={focusDuration}
                  onChange={(e) => updateFocusDuration(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
                />
                <div className="flex justify-between mt-2 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                  <span>5m</span>
                  <span>120m</span>
                  <span>240m</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[25, 45, 60, 90].map(mins => (
                  <button 
                    key={mins}
                    onClick={() => updateFocusDuration(mins)}
                    className={`py-2 rounded-xl text-[10px] font-bold transition-all border ${
                      focusDuration === mins ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Subject Stats */}
          <div className="grid grid-cols-1 gap-4">
             {subjects.map(s => (
               <div key={s.id} className="bg-[#0B1121] border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-white/5 ${s.color}`}>
                      <s.icon size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.id}</p>
                      <p className="text-sm font-mono font-bold text-white mt-0.5">{formatStatsTime(todayStats[s.id as keyof typeof todayStats])}</p>
                    </div>
                  </div>
                  <div className={`w-1 h-8 rounded-full opacity-20 group-hover:opacity-100 transition-opacity ${s.color.replace('text', 'bg')}`} />
               </div>
             ))}
          </div>

          <div className="bg-indigo-500/5 border border-indigo-500/10 p-5 rounded-2xl flex gap-4">
             <Brain size={20} className="text-indigo-400 shrink-0" />
             <p className="text-[11px] text-indigo-200/70 leading-relaxed italic">
               Consistent study intervals of 45-60 minutes are optimal for retaining complex JEE concepts.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
