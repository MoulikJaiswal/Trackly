
import React, { useMemo } from 'react';
import { Activity, Target, Trophy, Clock, Brain, TrendingUp } from 'lucide-react';
import { Session, TestResult } from '../types';
import { Card } from './Card';
import { MISTAKE_TYPES } from '../constants';

interface AnalyticsProps {
  sessions: Session[];
  tests: TestResult[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ sessions, tests }) => {
  const stats = useMemo(() => {
    const totalAttempted = sessions.reduce((acc, s) => acc + (s.attempted || 0), 0);
    const totalCorrect = sessions.reduce((acc, s) => acc + (s.correct || 0), 0);
    const avgAccuracy = totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;

    const mistakeDistribution = sessions.reduce((acc, s) => {
      Object.entries(s.mistakes).forEach(([key, val]) => {
        acc[key] = (acc[key] || 0) + (val || 0);
      });
      return acc;
    }, {} as Record<string, number>);

    return { totalAttempted, totalCorrect, avgAccuracy, mistakeDistribution };
  }, [sessions]);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="flex flex-col items-center py-8 md:py-10 group" delay={0.1}>
          <div className="p-4 bg-indigo-500/10 rounded-full mb-4 group-hover:scale-110 transition-transform duration-500">
            <TrendingUp size={32} className="text-indigo-400" />
          </div>
          <span className="text-4xl md:text-5xl font-light text-white mb-2 font-mono">
            {Math.round(stats.avgAccuracy)}%
          </span>
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em]">Overall Accuracy</span>
        </Card>
        
        <Card className="flex flex-col items-center py-8 md:py-10 group" delay={0.2}>
          <div className="p-4 bg-emerald-500/10 rounded-full mb-4 group-hover:scale-110 transition-transform duration-500">
            <Target size={32} className="text-emerald-400" />
          </div>
          <span className="text-4xl md:text-5xl font-light text-white mb-2 font-mono">
            {stats.totalAttempted}
          </span>
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em]">Questions Solved</span>
        </Card>

        <Card className="flex flex-col items-center py-8 md:py-10 group" delay={0.3}>
          <div className="p-4 bg-amber-500/10 rounded-full mb-4 group-hover:scale-110 transition-transform duration-500">
            <Trophy size={32} className="text-amber-400" />
          </div>
          <span className="text-4xl md:text-5xl font-light text-white mb-2 font-mono">
            {tests.length}
          </span>
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em]">Tests Taken</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <Card className="bg-slate-900/60 p-6 md:p-8">
          <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-6 md:mb-8 flex items-center gap-3">
            <Brain size={18} /> Error Distribution
          </h3>
          <div className="space-y-6">
            {MISTAKE_TYPES.map(type => {
              const count = stats.mistakeDistribution[type.id] || 0;
              const maxCount = Math.max(...(Object.values(stats.mistakeDistribution) as number[]), 1);
              const percent = (count / maxCount) * 100;

              return (
                <div key={type.id} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-slate-400">{type.label}</span>
                    <span className="text-white font-mono">{count}</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${type.color.replace('text', 'bg')} transition-all duration-1000 ease-out`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="bg-slate-900/60 p-6 md:p-8 flex flex-col justify-center">
          <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-400 mb-6 md:mb-8 flex items-center gap-3">
            <Activity size={18} /> Performance Tip
          </h3>
          <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
             <p className="text-sm text-slate-300 leading-relaxed italic">
                "Based on your recent logs, focusing on <strong>{MISTAKE_TYPES.find(m => (stats.mistakeDistribution[m.id] || 0) === Math.max(...(Object.values(stats.mistakeDistribution) as number[]), 0))?.label || 'Concept Gaps'}</strong> could yield the highest score improvements in your next mock test."
             </p>
             <div className="flex items-center gap-3 text-emerald-400/60">
                <Clock size={14} />
                <span className="text-[9px] uppercase font-bold tracking-widest">Auto-generated Insight</span>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
