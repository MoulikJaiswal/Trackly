
import React, { useMemo, useState } from 'react';
import { Plus, Trash2, Activity, Zap, Atom, Calculator, CalendarClock, ArrowRight, CheckCircle2, Pencil, X, Brain, ChevronRight, History } from 'lucide-react';
import { Session, Target, MistakeCounts } from '../types';
import { Card } from './Card';
import { JEE_SYLLABUS, MISTAKE_TYPES } from '../constants';

interface DashboardProps {
  sessions: Session[];
  targets: Target[];
  quote: { text: string; author: string };
  onDelete: (id: string) => void;
  goals: { Physics: number; Chemistry: number; Maths: number };
  setGoals: (goals: { Physics: number; Chemistry: number; Maths: number }) => void;
  onSaveSession: (session: Omit<Session, 'id' | 'timestamp'>) => void;
}

const ActivityHeatmap = ({ sessions }: { sessions: Session[] }) => {
  const days = useMemo(() => {
    const d = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const str = date.toISOString().split('T')[0];
      const count = sessions.filter(s => new Date(s.timestamp).toISOString().split('T')[0] === str).length;
      d.push({ date: str, count, dayName: date.toLocaleDateString('en-US', { weekday: 'narrow' }) });
    }
    return d;
  }, [sessions]);

  return (
    <div className="flex gap-2 items-end">
      {days.map((day, i) => (
        <div key={day.date} className="flex flex-col items-center gap-1">
          <div 
            className={`w-3 md:w-4 rounded-sm transition-all duration-500 ${
              day.count === 0 ? 'h-3 md:h-4 bg-white/5' : 
              day.count < 3 ? 'h-6 md:h-8 bg-indigo-500/40' : 
              'h-10 md:h-12 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'
            }`} 
          />
          <span className="text-[8px] font-bold text-slate-600 uppercase">{day.dayName}</span>
        </div>
      ))}
    </div>
  );
};

const SubjectPod = ({ 
  subject, 
  icon: Icon, 
  count, 
  target, 
  onGoalChange,
  colorClass,
  bgClass,
  onClick
}: { 
  subject: string, 
  icon: any, 
  count: number, 
  target: number, 
  onGoalChange: (newGoal: number) => void;
  colorClass: string,
  bgClass: string,
  onClick: () => void
}) => {
  const percent = Math.min(100, (count / target) * 100);
  const [isEditing, setIsEditing] = useState(false);
  const [tempGoal, setTempGoal] = useState(target.toString());
  const isCompleted = count >= target;

  return (
    <div 
      onClick={(e) => {
        // Don't trigger modal if clicking the goal input
        if ((e.target as HTMLElement).closest('.goal-input')) return;
        onClick();
      }}
      className={`relative overflow-hidden rounded-2xl border border-white/5 p-5 flex flex-col justify-between h-36 md:h-40 group cursor-pointer hover:border-white/20 transition-all duration-300 ${bgClass}`}
    >
      <div className="flex justify-between items-start z-10">
        <div className={`p-2.5 rounded-xl bg-white/10 text-white shadow-lg`}>
          <Icon size={20} />
        </div>
        <div className="text-right goal-input z-20">
          {isEditing ? (
            <input 
              type="number" 
              autoFocus
              className="w-16 bg-black/40 text-white text-[10px] font-bold p-1 rounded border border-white/20 outline-none text-right"
              value={tempGoal}
              onChange={(e) => setTempGoal(e.target.value)}
              onBlur={() => {
                onGoalChange(parseInt(tempGoal) || target);
                setIsEditing(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onGoalChange(parseInt(tempGoal) || target);
                  setIsEditing(false);
                }
              }}
            />
          ) : (
            <div 
              onClick={(e) => {
                e.stopPropagation(); 
                setIsEditing(true);
              }}
              className="flex items-center gap-1.5 group/edit p-1 rounded-lg hover:bg-black/20 transition-colors"
            >
              {isCompleted && (
                <div className="bg-emerald-500/20 p-0.5 rounded-full animate-in zoom-in duration-300">
                  <CheckCircle2 size={12} className="text-emerald-400" />
                </div>
              )}
              <p className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isCompleted ? 'text-emerald-400' : 'opacity-60 group-hover/edit:text-white'}`}>
                Goal: {target}
              </p>
              <Pencil size={10} className="opacity-0 group-hover/edit:opacity-100 text-white" />
            </div>
          )}
        </div>
      </div>
      
      <div className="z-10">
        <h4 className={`text-sm font-bold uppercase tracking-wider mb-1.5 ${colorClass}`}>{subject}</h4>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-mono font-bold text-white tracking-tight">{count}</span>
          <span className="text-[10px] font-bold opacity-50 mb-1 uppercase tracking-wider">Solved</span>
        </div>
      </div>

      {/* Progress Bar Background */}
      <div className="absolute bottom-0 left-0 h-1.5 w-full bg-black/20">
        <div 
          className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : colorClass.replace('text', 'bg')}`} 
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

const SubjectDetailModal = ({ 
  subject, 
  sessions, 
  onClose,
  onSaveSession,
  onDeleteSession
}: { 
  subject: string, 
  sessions: Session[], 
  onClose: () => void,
  onSaveSession: (data: Omit<Session, 'id' | 'timestamp'>) => void,
  onDeleteSession: (id: string) => void
}) => {
  const [activeTab, setActiveTab] = useState<'log' | 'history'>('log');
  
  // Logging State
  const [step, setStep] = useState(1);
  const [logData, setLogData] = useState({ 
    topic: '', 
    attempted: 0, 
    correct: 0, 
    mistakes: {} as MistakeCounts 
  });
  
  const incorrectCount = logData.attempted - logData.correct;
  const allocatedMistakes = (Object.values(logData.mistakes) as number[]).reduce((a, b) => a + (b || 0), 0);

  const updateMistake = (type: keyof MistakeCounts, val: number) => {
    const current = logData.mistakes[type] || 0;
    const next = Math.max(0, current + val);
    if (val > 0 && allocatedMistakes >= incorrectCount) return;
    setLogData({ ...logData, mistakes: { ...logData.mistakes, [type]: next } });
  };

  const handleSave = () => {
    onSaveSession({ subject, ...logData });
    // Reset and show history/success
    setLogData({ topic: '', attempted: 0, correct: 0, mistakes: {} });
    setStep(1);
    setActiveTab('history');
  };

  const mistakesSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    sessions.forEach(s => {
      Object.entries(s.mistakes).forEach(([k, v]) => {
        counts[k] = (counts[k] || 0) + (v || 0);
      });
    });
    return counts;
  }, [sessions]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-indigo-500/10 to-transparent rounded-t-3xl shrink-0">
          <div className="flex items-center gap-4">
             {subject === 'Physics' && <Atom className="text-blue-400" size={28} />}
             {subject === 'Chemistry' && <Zap className="text-orange-400" size={28} />}
             {subject === 'Maths' && <Calculator className="text-rose-400" size={28} />}
             <div>
               <h2 className="text-2xl font-bold text-white uppercase tracking-wider">{subject} Command</h2>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Module Control</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 gap-2 border-b border-white/5 bg-black/20 shrink-0">
          <button 
            onClick={() => setActiveTab('log')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'log' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}
          >
            Log Session
          </button>
          <button 
             onClick={() => setActiveTab('history')}
             className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}
          >
            History & Errors
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          {activeTab === 'log' ? (
            <div className="space-y-6">
              {step === 1 ? (
                <>
                  <div className="space-y-5">
                     <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-indigo-400 ml-1 tracking-widest">Topic / Chapter</label>
                        <select 
                          className="w-full bg-black/30 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-indigo-500 transition-all text-sm"
                          value={logData.topic}
                          onChange={e => setLogData({...logData, topic: e.target.value})}
                        >
                          <option value="">Select Chapter...</option>
                          {JEE_SYLLABUS[subject as keyof typeof JEE_SYLLABUS].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-indigo-400 ml-1 tracking-widest">Attempted</label>
                          <input 
                            type="number" min="0" 
                            className="w-full bg-black/30 border border-white/10 p-4 rounded-2xl text-white font-mono text-xl outline-none focus:border-indigo-500"
                            value={logData.attempted || ''}
                            onChange={e => setLogData({...logData, attempted: parseInt(e.target.value) || 0})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-indigo-400 ml-1 tracking-widest">Correct</label>
                          <input 
                            type="number" min="0" 
                            className="w-full bg-black/30 border border-white/10 p-4 rounded-2xl text-white font-mono text-xl outline-none focus:border-indigo-500"
                            value={logData.correct || ''}
                            onChange={e => setLogData({...logData, correct: Math.min(logData.attempted, parseInt(e.target.value) || 0)})}
                          />
                        </div>
                     </div>
                  </div>
                  <button 
                    disabled={!logData.topic || logData.attempted < 1} 
                    onClick={() => {
                      if (incorrectCount > 0) setStep(2);
                      else handleSave();
                    }}
                    className="w-full bg-indigo-600 py-4 rounded-2xl text-white font-bold uppercase tracking-widest hover:bg-indigo-500 disabled:opacity-50 shadow-lg shadow-indigo-600/20 transition-all mt-6"
                  >
                    {incorrectCount > 0 ? 'Next: Analyze Mistakes' : 'Save Session'}
                  </button>
                </>
              ) : (
                <>
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex justify-between items-center mb-4">
                     <div>
                       <span className="text-xs font-bold text-rose-300 uppercase block">Incorrect Answers</span>
                       <span className="text-[10px] text-rose-500/60 font-bold uppercase">{allocatedMistakes} / {incorrectCount} Categorized</span>
                     </div>
                     <span className="text-2xl font-mono text-rose-400">{incorrectCount - allocatedMistakes} Left</span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2">
                    {MISTAKE_TYPES.map(type => (
                      <div key={type.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3 overflow-hidden">
                           <span className={`${type.color} shrink-0`}>{type.icon}</span>
                           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 truncate">{type.label}</span>
                        </div>
                        <div className="flex items-center gap-3 bg-black/40 rounded-lg p-1 shrink-0">
                          <button onClick={() => updateMistake(type.id as any, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-md text-slate-400 transition-colors text-lg">-</button>
                          <span className="w-6 text-center text-base font-mono text-white">{logData.mistakes[type.id as any] || 0}</span>
                          <button onClick={() => updateMistake(type.id as any, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-md text-slate-400 transition-colors text-lg">+</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl bg-white/5 text-slate-400 font-bold uppercase text-xs tracking-wider hover:bg-white/10">Back</button>
                    <button 
                      onClick={handleSave} 
                      disabled={allocatedMistakes !== incorrectCount}
                      className="flex-[2] py-3 rounded-xl bg-emerald-600 text-white font-bold uppercase text-xs tracking-wider hover:bg-emerald-500 disabled:opacity-50 shadow-lg shadow-emerald-600/20"
                    >
                      Confirm Log
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* History Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl">
                   <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Total Qs</p>
                   <p className="text-2xl font-mono font-bold text-white mt-1">
                     {sessions.reduce((a,b) => a + b.attempted, 0)}
                   </p>
                </div>
                <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl">
                   <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Accuracy</p>
                   <p className="text-2xl font-mono font-bold text-white mt-1">
                     {sessions.length > 0 ? Math.round((sessions.reduce((a,b) => a + b.correct, 0) / sessions.reduce((a,b) => a + b.attempted, 0)) * 100) : 0}%
                   </p>
                </div>
              </div>

              {/* Mistake Breakdown */}
              <div className="space-y-3">
                 <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2"><Brain size={14} /> Cumulative Errors</h4>
                 {Object.keys(mistakesSummary).length === 0 ? (
                   <p className="text-xs text-slate-600 italic">No mistakes recorded yet.</p>
                 ) : (
                   MISTAKE_TYPES.map(type => {
                     const count = mistakesSummary[type.id] || 0;
                     if(count === 0) return null;
                     const max = Math.max(...Object.values(mistakesSummary));
                     return (
                       <div key={type.id} className="flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full shrink-0 ${type.color.replace('text', 'bg')}`} />
                         <span className="text-[10px] uppercase font-bold text-slate-400 w-32 shrink-0 truncate">{type.label}</span>
                         <div className="flex-grow h-1.5 bg-white/5 rounded-full overflow-hidden">
                           <div className={`h-full ${type.color.replace('text', 'bg')}`} style={{ width: `${(count/max)*100}%` }} />
                         </div>
                         <span className="text-xs font-mono text-white shrink-0 w-6 text-right">{count}</span>
                       </div>
                     )
                   })
                 )}
              </div>

              {/* Session List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mt-2"><History size={14} /> Recent Logs</h4>
                {sessions.length === 0 ? (
                  <div className="text-center py-8 opacity-30 border border-dashed border-white/10 rounded-xl">
                    <p className="text-[10px] uppercase font-bold tracking-widest">No history</p>
                  </div>
                ) : (
                  sessions.map(s => (
                    <div key={s.id} className="bg-white/5 p-4 rounded-xl flex justify-between items-center group">
                      <div className="min-w-0 pr-4">
                        <p className="text-xs font-bold text-white truncate">{s.topic}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-0.5">{new Date(s.timestamp).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <span className="text-sm font-mono font-bold text-indigo-300">{s.correct}/{s.attempted}</span>
                        </div>
                        <button onClick={() => onDeleteSession(s.id)} className="text-rose-500/50 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ 
  sessions, 
  targets, 
  quote, 
  onDelete, 
  goals, 
  setGoals, 
  onSaveSession 
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysSessions = sessions.filter(s => new Date(s.timestamp).toISOString().split('T')[0] === todayStr);
  
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      Physics: todaysSessions.filter(s => s.subject === 'Physics').reduce((a, b) => a + b.attempted, 0),
      Chemistry: todaysSessions.filter(s => s.subject === 'Chemistry').reduce((a, b) => a + b.attempted, 0),
      Maths: todaysSessions.filter(s => s.subject === 'Maths').reduce((a, b) => a + b.attempted, 0),
    };
  }, [todaysSessions]);

  const pendingTargets = targets.filter(t => t.date === todayStr && !t.completed).slice(0, 2);

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight flex items-center gap-3">
              Mission Control
            </h2>
            <p className="text-xs text-indigo-300 uppercase tracking-widest font-bold opacity-70">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
             <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">7-Day Activity</span>
             <ActivityHeatmap sessions={sessions} />
          </div>
        </div>

        {/* Quote Section */}
        <Card className="bg-indigo-600/5 border-indigo-500/10 p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50"></div>
            <p className="text-lg md:text-xl font-serif italic text-indigo-100 leading-relaxed max-w-2xl mx-auto relative z-10 drop-shadow-lg">"{quote.text}"</p>
            <div className="mt-4 flex items-center justify-center gap-3 opacity-60">
                <div className="h-[1px] w-8 bg-indigo-400"></div>
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-indigo-300">{quote.author}</span>
                <div className="h-[1px] w-8 bg-indigo-400"></div>
            </div>
        </Card>

        {/* Subject Mastery Pods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SubjectPod 
            subject="Physics" 
            icon={Atom} 
            count={stats.Physics} 
            target={goals.Physics}
            onGoalChange={(val) => setGoals({...goals, Physics: val})}
            colorClass="text-blue-400" 
            bgClass="bg-gradient-to-br from-blue-500/10 to-transparent hover:from-blue-500/20 transition-all"
            onClick={() => setSelectedSubject('Physics')}
          />
          <SubjectPod 
            subject="Chemistry" 
            icon={Zap} 
            count={stats.Chemistry} 
            target={goals.Chemistry} 
            onGoalChange={(val) => setGoals({...goals, Chemistry: val})}
            colorClass="text-orange-400" 
            bgClass="bg-gradient-to-br from-orange-500/10 to-transparent hover:from-orange-500/20 transition-all"
            onClick={() => setSelectedSubject('Chemistry')}
          />
          <SubjectPod 
            subject="Maths" 
            icon={Calculator} 
            count={stats.Maths} 
            target={goals.Maths} 
            onGoalChange={(val) => setGoals({...goals, Maths: val})}
            colorClass="text-rose-400" 
            bgClass="bg-gradient-to-br from-rose-500/10 to-transparent hover:from-rose-500/20 transition-all"
            onClick={() => setSelectedSubject('Maths')}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column: Next Objectives */}
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <CalendarClock size={16} className="text-indigo-400" /> Next Objectives
                  </h3>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    {pendingTargets.length} Pending
                  </span>
                </div>
                
                {pendingTargets.length > 0 ? (
                  <div className="space-y-3">
                    {pendingTargets.map(t => (
                      <div key={t.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                        <span className="text-sm text-slate-200 flex-grow truncate">{t.text}</span>
                        <ArrowRight size={14} className="text-slate-500" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center opacity-40">
                    <CheckCircle2 size={24} className="mx-auto mb-2 text-emerald-400" />
                    <p className="text-[10px] uppercase font-bold tracking-widest">All caught up for today</p>
                  </div>
                )}
             </div>
          </div>

          {/* Right Column: Recent Activity Feed */}
          <div className="lg:col-span-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Activity size={14} /> Today's Logs
            </h3>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar mask-gradient-bottom">
              {todaysSessions.length === 0 ? (
                <div className="text-center py-10 opacity-30 border border-dashed border-white/10 rounded-2xl">
                   <p className="text-[10px] uppercase font-bold tracking-widest">No activity yet</p>
                </div>
              ) : (
                todaysSessions.slice(0, 5).map((s, idx) => (
                  <div 
                    key={s.id} 
                    className="bg-slate-900/60 border border-white/5 p-4 rounded-2xl flex justify-between items-center group hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] shrink-0 ${
                        s.subject === 'Physics' ? 'text-blue-400 bg-blue-400' : 
                        s.subject === 'Chemistry' ? 'text-orange-400 bg-orange-400' : 
                        'text-rose-400 bg-rose-400'
                      }`} />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-200 truncate">{s.topic}</p>
                        <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mt-0.5">{s.attempted} Qs</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-mono font-bold text-indigo-300">
                        {s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : 0}%
                      </span>
                      <button 
                        onClick={() => onDelete(s.id)} 
                        className="opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-500/10 p-1.5 rounded-lg transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSubject && (
        <SubjectDetailModal 
          subject={selectedSubject}
          sessions={sessions.filter(s => s.subject === selectedSubject)}
          onClose={() => setSelectedSubject(null)}
          onSaveSession={onSaveSession}
          onDeleteSession={onDelete}
        />
      )}
    </>
  );
};
