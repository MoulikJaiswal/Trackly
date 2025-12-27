
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Activity, 
  Calendar as CalendarIcon, 
  PenTool, 
  BarChart3, 
  LayoutDashboard,
  Flame,
  Timer
} from 'lucide-react';
import { ViewType, Session, TestResult, Target } from './types';
import { QUOTES } from './constants';
import { Dashboard } from './components/Dashboard';
import { FocusTimer } from './components/FocusTimer';
import { Planner } from './components/Planner';
import { TestLog } from './components/TestLog';
import { Analytics } from './components/Analytics';

const TracklyLogo = React.memo(() => (
  <div className="flex items-center gap-3 select-none">
    {/* SVG Waveform Icon */}
    <div className="relative w-8 h-5">
      <svg viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]">
        <defs>
          <linearGradient id="logo-gradient" x1="0" y1="0" x2="48" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fb923c" /> {/* orange-400 */}
            <stop offset="50%" stopColor="#f87171" /> {/* red-400 */}
            <stop offset="100%" stopColor="#e11d48" /> {/* rose-600 */}
          </linearGradient>
        </defs>
        <path 
          d="M2 18 C 6 18, 8 10, 12 14 C 15 17, 17 6, 20 2 C 23 -2, 26 18, 28 22 C 30 26, 32 10, 36 12 C 40 14, 42 18, 46 18" 
          stroke="url(#logo-gradient)" 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </div>
    {/* Text */}
    <span className="text-xl font-display font-extrabold text-white tracking-tight">
      Trackly
    </span>
  </div>
));

const AnimatedBackground = React.memo(() => {
  const formulas = [
    "E = mc²", "∇ · B = 0", "iℏ∂ψ/∂t = Ĥψ", "F = G(m₁m₂)/r²",
    "PV = nRT", "∫ eˣ dx = eˣ", "x = (-b±√Δ)/2a", "F = ma",
    "ΔU = Q - W", "λ = h/p", "V = IR", "sin²θ + cos²θ = 1",
    "eⁱπ + 1 = 0", "L = Iω", "E = hν", "∮ B·dl = μ₀I"
  ];

  // Memoize random values so they don't re-generate on re-renders,
  // effectively making the background static once mounted.
  const items = useMemo(() => Array.from({ length: formulas.length }).map((_, i) => ({
    id: i,
    top: `${(i * 17) % 95}%`,
    left: `${(i * 23) % 95}%`,
    duration: 40 + (i % 20),
    delay: -(i * 7),
    size: 0.7 + (i % 4) * 0.25,
    // Hide half the items on mobile for performance
    hiddenOnMobile: i % 2 === 0
  })), []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none bg-[#020205]">
      {/* Layer 1: Deep Galactic Voids */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-950/30 via-[#020208] to-[#000000]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-purple-950/15 via-transparent to-transparent" />
      
      {/* Layer 2: Distant Star Field (Slow Parallax) */}
      <div className="absolute inset-0 opacity-30 animate-star-drift-slow gpu-accelerated" 
           style={{ 
             backgroundImage: `radial-gradient(1px 1px at 10px 10px, white, transparent), radial-gradient(1px 1px at 40px 60px, white, transparent), radial-gradient(1px 1px at 80px 30px, white, transparent)`, 
             backgroundSize: '150px 150px' 
           }} />

      {/* Layer 3: Medium Star Field (Medium Parallax) */}
      <div className="absolute inset-0 opacity-40 animate-star-drift-medium gpu-accelerated hidden md:block" 
           style={{ 
             backgroundImage: `radial-gradient(1.5px 1.5px at 15px 15px, white, transparent), radial-gradient(1.5px 1.5px at 100px 50px, white, transparent)`, 
             backgroundSize: '200px 200px' 
           }} />

      {/* Layer 4: Close Stars (Fast Parallax + Twinkle) */}
      <div className="absolute inset-0 opacity-50 animate-star-drift-fast gpu-accelerated" 
           style={{ 
             backgroundImage: `radial-gradient(2px 2px at 50px 50px, white, transparent), radial-gradient(2px 2px at 150px 120px, white, transparent)`, 
             backgroundSize: '300px 300px' 
           }} />
      
      {/* Layer 5: Galactic Nebulae (Dynamic Glows) */}
      <div className="absolute top-[-20%] right-[-10%] w-[100%] h-[100%] opacity-20 md:opacity-25 blur-[120px] animate-nebula-pulse bg-indigo-600/20 rounded-full mix-blend-screen gpu-accelerated" />
      <div className="absolute bottom-[-15%] left-[-20%] w-[100%] h-[100%] opacity-15 blur-[150px] animate-nebula-pulse-alt bg-purple-600/20 rounded-full mix-blend-screen gpu-accelerated" />
      
      {/* Layer 6: Shooting Stars - Reduced count */}
      <div className="absolute inset-0">
         {[...Array(4)].map((_, i) => (
           <div 
             key={`shooting-star-${i}`}
             className="absolute h-[1px] w-[180px] bg-gradient-to-r from-transparent to-white opacity-0 animate-shooting-star"
             style={{
               top: `${(i * 15) % 60}%`,
               left: `${(i * 10) % 40}%`,
               animationDelay: `${i * 10}s`,
               animationDuration: '6s'
             }}
           >
             <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full blur-[0.5px] shadow-[0_0_15px_3px_rgba(99,102,241,0.6)]" />
           </div>
         ))}
      </div>
      
      {/* Layer 7: Cosmic Formulas */}
      {items.map((item, i) => (
        <div 
          key={item.id}
          className={`absolute font-mono text-indigo-300/15 whitespace-nowrap animate-float-gentle mix-blend-screen gpu-accelerated ${item.hiddenOnMobile ? 'hidden md:block' : ''}`}
          style={{
            top: item.top,
            left: item.left,
            fontSize: `${item.size}rem`,
            animationDuration: `${item.duration}s`,
            animationDelay: `${item.delay}s`,
            textShadow: '0 0 8px rgba(129, 140, 248, 0.2)'
          }}
        >
          {formulas[i % formulas.length]}
        </div>
      ))}

      {/* Layer 8: Final Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] pointer-events-none" />
    </div>
  );
});

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('daily');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tests, setTests] = useState<TestResult[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [goals, setGoals] = useState({ Physics: 30, Chemistry: 30, Maths: 30 });
  const [quoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const savedSessions = localStorage.getItem('zenith_sessions');
    const savedTests = localStorage.getItem('zenith_tests');
    const savedTargets = localStorage.getItem('zenith_targets');
    const savedGoals = localStorage.getItem('zenith_goals');

    if (savedSessions) setSessions(JSON.parse(savedSessions));
    if (savedTests) setTests(JSON.parse(savedTests));
    if (savedTargets) setTargets(JSON.parse(savedTargets));
    if (savedGoals) setGoals(JSON.parse(savedGoals));

    // Streak Logic
    const today = new Date().toISOString().split('T')[0];
    const lastVisit = localStorage.getItem('zenith_last_visit');
    const savedStreak = parseInt(localStorage.getItem('zenith_streak') || '0');
    
    let newStreak = savedStreak;

    // Check if we need to update the streak
    if (lastVisit !== today) {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      const yesterday = d.toISOString().split('T')[0];
      
      if (lastVisit === yesterday) {
        newStreak++;
      } else {
        // Reset streak if last visit was not today or yesterday
        newStreak = 1;
      }
      localStorage.setItem('zenith_streak', newStreak.toString());
      localStorage.setItem('zenith_last_visit', today);
    }
    
    setStreak(newStreak);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
        localStorage.setItem('zenith_sessions', JSON.stringify(sessions));
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [sessions]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
        localStorage.setItem('zenith_tests', JSON.stringify(tests));
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [tests]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
        localStorage.setItem('zenith_targets', JSON.stringify(targets));
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [targets]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
        localStorage.setItem('zenith_goals', JSON.stringify(goals));
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [goals]);

  const handleSaveSession = useCallback((newSession: Omit<Session, 'id' | 'timestamp'>) => {
    const session: Session = { ...newSession, id: crypto.randomUUID(), timestamp: Date.now() };
    setSessions(prev => [session, ...prev]);
  }, []);

  const handleDeleteSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  }, []);

  const handleSaveTest = useCallback((newTest: Omit<TestResult, 'id' | 'timestamp'>) => {
    const test: TestResult = { ...newTest, id: crypto.randomUUID(), timestamp: Date.now() };
    setTests(prev => [test, ...prev]);
  }, []);

  const handleDeleteTest = useCallback((id: string) => {
    setTests(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleSaveTarget = useCallback((target: Target) => {
    setTargets(prev => [...prev, target]);
  }, []);

  const handleUpdateTarget = useCallback((id: string, completed: boolean) => {
    setTargets(prev => prev.map(t => t.id === id ? { ...t, completed } : t));
  }, []);

  const handleDeleteTarget = useCallback((id: string) => {
    setTargets(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <div className="min-h-screen text-slate-100 font-sans pb-32 selection:bg-indigo-500/30 selection:text-white overflow-x-hidden relative">
      <AnimatedBackground />

      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 min-h-screen flex flex-col relative z-10">
        
        {/* Revamped Header */}
        <header className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-10 pt-4 relative z-20">
          
          {/* Left Group: Logo */}
          <div className="flex items-center gap-6 bg-slate-900/60 backdrop-blur-xl p-2 rounded-full border border-white/5 shadow-2xl">
              <div className="bg-white/5 rounded-full px-6 py-2">
                 <TracklyLogo />
              </div>
          </div>

          {/* Right Group: Nav + Streak */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
             
             {/* Navigation */}
             <nav className="flex gap-1 bg-slate-950/40 backdrop-blur-xl p-1.5 rounded-full w-full sm:w-auto overflow-x-auto no-scrollbar border border-white/10 shadow-xl">
              {[
                { id: 'daily', label: 'Home', icon: LayoutDashboard },
                { id: 'planner', label: 'Planner', icon: CalendarIcon },
                { id: 'focus', label: 'Timer', icon: Timer },
                { id: 'tests', label: 'Tests', icon: PenTool },
                { id: 'analytics', label: 'Stats', icon: BarChart3 },
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setView(tab.id as ViewType)} 
                  className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap relative overflow-hidden tracking-widest shrink-0 ${view === tab.id ? 'text-white shadow-lg bg-indigo-600' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                >
                  <tab.icon size={14} className="relative z-10" /> 
                  <span className="relative z-10 hidden md:inline">{tab.label}</span>
                  <span className="relative z-10 md:hidden">{view === tab.id ? tab.label : ''}</span>
                </button>
              ))}
            </nav>

             {/* Streak Pill */}
             <div className="flex items-center gap-2 px-4 py-2.5 bg-orange-500/10 border border-orange-500/20 rounded-full shrink-0">
                <Flame size={14} className="text-orange-500 fill-orange-500 animate-pulse" />
                <span className="text-[10px] font-bold text-orange-200 uppercase tracking-wider">{streak} Day Streak</span>
             </div>

          </div>

        </header>

        <main className="flex-grow space-y-8 md:space-y-12">
          {view === 'daily' && (
            <Dashboard 
              sessions={sessions} 
              quote={QUOTES[quoteIdx]} 
              onDelete={handleDeleteSession} 
              targets={targets} 
              goals={goals}
              setGoals={setGoals}
              onSaveSession={handleSaveSession}
            />
          )}
          {view === 'planner' && <Planner targets={targets} onAdd={handleSaveTarget} onToggle={handleUpdateTarget} onDelete={handleDeleteTarget} />}
          {view === 'focus' && <FocusTimer targets={targets} />}
          {view === 'tests' && <TestLog tests={tests} onSave={handleSaveTest} onDelete={handleDeleteTest} />}
          {view === 'analytics' && <Analytics sessions={sessions} tests={tests} />}
        </main>
      </div>
    </div>
  );
};

export default App;
