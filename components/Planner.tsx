
import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { Target as TargetType } from '../types';
import { Card } from './Card';

interface PlannerProps {
  targets: TargetType[];
  onAdd: (target: TargetType) => void;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

export const Planner: React.FC<PlannerProps> = ({ targets, onAdd, onToggle, onDelete }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTargetText, setNewTargetText] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const getWeekDays = () => {
    const days = [];
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const weekDays = getWeekDays();

  const handleAdd = () => {
    if (!newTargetText.trim()) return;
    onAdd({
      id: crypto.randomUUID(),
      date: selectedDate,
      text: newTargetText,
      completed: false,
      timestamp: Date.now()
    });
    setNewTargetText('');
  };

  const dayTargets = targets.filter(t => t.date === selectedDate);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-4 shadow-xl select-none">
        <div className="flex justify-between items-center mb-6 px-2">
           <div className="flex items-center gap-2">
             <CalendarIcon size={18} className="text-indigo-400" />
             <h3 className="text-sm font-bold text-white uppercase tracking-widest">
               {new Date(weekDays[0]).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
             </h3>
           </div>
           <button 
             onClick={() => setSelectedDate(todayStr)} 
             className="px-3 py-1 bg-indigo-600/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-indigo-600 hover:text-white transition-colors"
           >
             Today
           </button>
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {weekDays.map((dateStr) => {
            const d = new Date(dateStr);
            const isSelected = selectedDate === dateStr;
            const isToday = dateStr === todayStr;
            const dayTargetsCount = targets.filter(t => t.date === dateStr).length;
            const allDone = dayTargetsCount > 0 && targets.filter(t => t.date === dateStr).every(t => t.completed);

            return (
              <button 
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`
                  relative flex flex-col items-center justify-center py-3 md:py-4 rounded-2xl transition-all duration-300 group
                  ${isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105 z-10' : 'bg-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'}
                  ${isToday && !isSelected ? 'ring-1 ring-indigo-500/50' : ''}
                `}
              >
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-1">{d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1)}</span>
                <span className={`text-base md:text-lg font-mono font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>{d.getDate()}</span>
                
                {dayTargetsCount > 0 && (
                  <div className={`mt-2 w-1.5 h-1.5 rounded-full ${allDone ? 'bg-emerald-400' : isSelected ? 'bg-indigo-300' : 'bg-indigo-500/50'}`} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <Card className="min-h-[400px]">
        <div className="flex gap-3 mb-6 md:mb-8">
          <input 
            type="text" 
            placeholder="Add a task for this day..." 
            className="flex-grow bg-black/20 border border-white/5 p-3 md:p-4 rounded-2xl text-sm text-white outline-none focus:border-indigo-500/40 transition-all placeholder:text-slate-500" 
            value={newTargetText} 
            onChange={e => setNewTargetText(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && handleAdd()} 
          />
          <button 
            onClick={handleAdd} 
            className="bg-indigo-600 p-3 md:p-4 rounded-2xl text-white hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/20"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <h4 className="text-[10px] uppercase font-bold text-indigo-400/50 tracking-[0.2em] mb-4 flex items-center gap-3">
            Tasks for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            <div className="h-[1px] flex-grow bg-white/5"></div>
          </h4>

          {dayTargets.length === 0 ? (
             <div className="text-center py-16 opacity-30">
               <Target size={40} className="mx-auto mb-4 text-indigo-400/60"/>
               <p className="text-xs uppercase font-bold tracking-widest">No goals set for today</p>
             </div>
          ) : (
            dayTargets.map(t => (
              <div key={t.id} className="flex items-center gap-4 bg-white/[0.03] p-3 md:p-4 rounded-2xl group border border-transparent hover:border-white/10 transition-all">
                <button 
                  onClick={() => onToggle(t.id, !t.completed)} 
                  className={`transition-all duration-300 ${t.completed ? 'text-emerald-400' : 'text-slate-600 hover:text-indigo-400'}`}
                >
                  {t.completed ? <CheckCircle2 size={24} /> : <div className="w-6 h-6 border-2 border-current rounded-full"></div>}
                </button>
                <span className={`flex-grow text-sm transition-all duration-300 ${t.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                  {t.text}
                </span>
                <button 
                  onClick={() => onDelete(t.id)} 
                  className="opacity-0 group-hover:opacity-100 p-2 text-rose-500/40 hover:text-rose-500 transition-all hover:bg-rose-500/10 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
