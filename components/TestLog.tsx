
import React, { useState } from 'react';
import { Plus, X, Trash2, Trophy, Clock, AlertCircle } from 'lucide-react';
import { TestResult } from '../types';
import { Card } from './Card';

interface TestLogProps {
  tests: TestResult[];
  onSave: (test: Omit<TestResult, 'id' | 'timestamp'>) => void;
  onDelete: (id: string) => void;
}

export const TestLog: React.FC<TestLogProps> = ({ tests, onSave, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Omit<TestResult, 'id' | 'timestamp'>>({
    name: '',
    date: new Date().toISOString().split('T')[0],
    marks: 0,
    total: 300,
    temperament: 'Calm',
    analysis: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    onSave(formData);
    setIsAdding(false);
    setFormData({
      name: '',
      date: new Date().toISOString().split('T')[0],
      marks: 0,
      total: 300,
      temperament: 'Calm',
      analysis: ''
    });
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Test Log</h2>
          <p className="text-xs text-indigo-400 uppercase tracking-widest mt-1 font-bold">Track performance curves</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)} 
          className="bg-indigo-600 hover:bg-indigo-500 px-4 md:px-5 py-2.5 md:py-3 rounded-2xl text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
        >
          {isAdding ? <X size={16} /> : <Plus size={16} />}
          {isAdding ? 'Cancel' : 'Add Record'}
        </button>
      </div>

      {isAdding && (
        <Card className="border-indigo-500/30 bg-indigo-500/5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-indigo-300/60 ml-1">Test Name</label>
                <input 
                  type="text" required placeholder="e.g., JEE Mains Mock 12"
                  className="w-full bg-black/20 border border-white/10 p-3 md:p-4 rounded-2xl text-sm text-white focus:border-indigo-500 outline-none transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-indigo-300/60 ml-1">Date</label>
                <input 
                  type="date" required
                  className="w-full bg-black/20 border border-white/10 p-3 md:p-4 rounded-2xl text-sm text-white focus:border-indigo-500 outline-none transition-all"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div className="flex gap-4">
                <div className="w-1/2 space-y-2">
                  <label className="text-[10px] uppercase font-bold text-indigo-300/60 ml-1">Marks</label>
                  <input 
                    type="number" required placeholder="0"
                    className="w-full bg-black/20 border border-white/10 p-3 md:p-4 rounded-2xl text-sm text-white focus:border-indigo-500 outline-none transition-all font-mono"
                    value={formData.marks}
                    onChange={e => setFormData({...formData, marks: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="w-1/2 space-y-2">
                  <label className="text-[10px] uppercase font-bold text-indigo-300/60 ml-1">Total</label>
                  <input 
                    type="number" required placeholder="300"
                    className="w-full bg-black/20 border border-white/10 p-3 md:p-4 rounded-2xl text-sm text-white focus:border-indigo-500 outline-none transition-all font-mono"
                    value={formData.total}
                    onChange={e => setFormData({...formData, total: parseInt(e.target.value) || 300})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-indigo-300/60 ml-1">Temperament</label>
                <select 
                  className="w-full bg-slate-900 border border-white/10 p-3 md:p-4 rounded-2xl text-sm text-white focus:border-indigo-500 outline-none transition-all"
                  value={formData.temperament}
                  onChange={e => setFormData({...formData, temperament: e.target.value as any})}
                >
                  {['Calm', 'Anxious', 'Focused', 'Fatigued'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-indigo-300/60 ml-1">Quick Analysis</label>
              <textarea 
                placeholder="What went wrong? Any syllabus gaps?"
                className="w-full bg-black/20 border border-white/10 p-3 md:p-4 rounded-2xl text-sm text-white min-h-[100px] outline-none focus:border-indigo-500 transition-all"
                value={formData.analysis}
                onChange={e => setFormData({...formData, analysis: e.target.value})}
              />
            </div>
            <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-400 py-3 md:py-4 rounded-2xl text-white font-bold uppercase text-xs tracking-widest shadow-lg transition-colors">Save Performance</button>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {tests.length === 0 ? (
          <div className="text-center py-20 opacity-20 border-2 border-dashed border-white/5 rounded-3xl">
            <Trophy size={48} className="mx-auto mb-4" />
            <p className="text-xs uppercase font-bold tracking-[0.3em]">No test records found</p>
          </div>
        ) : (
          tests.map((t, i) => (
            <Card key={t.id} className="group" delay={i * 0.1}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-white/5 rounded-2xl text-indigo-300"><Trophy size={20} /></div>
                   <div>
                     <h3 className="text-white font-bold text-base md:text-lg">{t.name}</h3>
                     <div className="flex items-center gap-2 mt-1">
                       <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t.date}</span>
                       <span className="w-1 h-1 bg-indigo-500/50 rounded-full"></span>
                       <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t.temperament}</span>
                     </div>
                   </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl md:text-3xl font-light text-white font-mono">{t.marks}</span>
                  <span className="text-xs text-slate-500 font-bold ml-1">/{t.total}</span>
                </div>
              </div>
              {t.analysis && (
                <div className="bg-white/5 p-4 rounded-2xl border-l-4 border-indigo-500/40 mb-4">
                  <p className="text-xs text-slate-300 leading-relaxed italic">{t.analysis}</p>
                </div>
              )}
              <div className="flex justify-between items-center pt-2">
                <div className="flex gap-2">
                   <div className="px-2 py-1 bg-indigo-500/10 rounded-lg text-[9px] font-bold text-indigo-400 uppercase tracking-tighter">
                     {Math.round((t.marks / t.total) * 100)}% Accuracy
                   </div>
                </div>
                <button 
                  onClick={() => onDelete(t.id)} 
                  className="opacity-0 group-hover:opacity-100 text-xs text-rose-500/40 hover:text-rose-500 transition-all p-2 rounded-lg"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
