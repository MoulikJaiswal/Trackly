import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Activity, 
  Calendar as CalendarIcon, 
  PenTool, 
  BarChart3, 
  LayoutDashboard,
  Timer,
  Settings
} from 'lucide-react';
import { ViewType, Session, TestResult, Target, ThemeId } from './types';
import { QUOTES, THEME_CONFIG } from './constants';
import { Dashboard } from './components/Dashboard';
import { FocusTimer } from './components/FocusTimer';
import { Planner } from './components/Planner';
import { TestLog } from './components/TestLog';
import { Analytics } from './components/Analytics';
import { SettingsModal } from './components/SettingsModal';

// Helper for local date string YYYY-MM-DD
const getLocalDate = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const TracklyLogo = React.memo(() => (
  <div className="flex items-center gap-3 select-none">
    {/* SVG Waveform Icon - Simplified shadow for performance */}
    <div className="relative w-8 h-5">
      <svg viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_5px_currentColor] text-indigo-500">
        <defs>
          <linearGradient id="logo-gradient" x1="0" y1="0" x2="48" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" className="stop-accent-light" stopColor="currentColor" /> 
            <stop offset="100%" className="stop-accent-dark" stopColor="currentColor" /> 
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
    <span className="text-xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
      Trackly
    </span>
  </div>
));

const AnimatedBackground = React.memo(({ enabled, themeId }: { enabled: boolean, themeId: ThemeId }) => {
  const config = THEME_CONFIG[themeId];
  
  // Custom formulas/elements based on theme vibe
  const items = useMemo(() => {
    let baseItems = [
        "E = mc²", "∇ · B = 0", "iℏ∂ψ/∂t = Ĥψ", "F = G(m₁m₂)/r²",
        "PV = nRT", "∫ eˣ dx = eˣ", "x = (-b±√Δ)/2a", "F = ma"
    ];

    if (themeId === 'forest') {
        baseItems = ["●", "●", "•", "◦", "○", "•", "●", "•"]; // Fireflies
    } else if (themeId === 'morning') {
        baseItems = ["☁", "☼", "☁", "○", "•", "☁", "•", "○"]; // Clouds/Mist
    } else if (themeId === 'void') {
        baseItems = ["0", "1", "0", "1", "0", "1", "<>", "{}"]; // Matrix style
    } else if (themeId === 'obsidian') {
        baseItems = ["⬡", "□", "△", "⬡", "○", "□", "⬡", "△"]; // Geometric
    } else if (themeId === 'earth') {
        baseItems = ["~", "≈", "•", "◦", "•", "~", "≈", "•"]; // Dust/Wind
    } else if (themeId === 'midnight') {
        baseItems = ["☾", "✦", "★", "•", "✦", "☾", "★", "•"]; // Night sky
    }

    return Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        top: `${(i * 17) % 95}%`,
        left: `${(i * 23) % 95}%`,
        duration: 40 + (i % 20),
        delay: -(i * 7),
        size: 0.7 + (i % 4) * 0.25,
        content: baseItems[i % baseItems.length],
        hiddenOnMobile: i % 2 === 0
    }));
  }, [themeId]);

  const stars = useMemo(() => Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      top: `${(i * 18) % 65}%`, 
      left: `${(i * 13) % 40}%`, 
      delay: `-${Math.abs((i * 5) % 15)}s`, 
      duration: `${7 + (i % 4)}s` 
  })), []);

  if (!enabled) return <div className="fixed inset-0 z-0 pointer-events-none" style={{ backgroundColor: config.colors.bg }} />;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none transition-colors duration-700" style={{ backgroundColor: config.colors.bg }}>
      
      {/* Dynamic Background Gradients */}
      {config.mode === 'light' ? (
        <div className="absolute inset-0 opacity-100 transition-opacity duration-500">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))]" style={{ backgroundImage: `radial-gradient(circle at top right, ${config.colors.accent}15, transparent)` }} />
             <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] opacity-40 animate-nebula-pulse mix-blend-multiply gpu-accelerated" 
                  style={{ background: `radial-gradient(circle, ${config.colors.accent}20 0%, transparent 70%)` }} />
             <div className="absolute bottom-[-15%] left-[-20%] w-[90%] h-[90%] opacity-40 animate-nebula-pulse mix-blend-multiply gpu-accelerated" 
                  style={{ animationDelay: '-5s', background: `radial-gradient(circle, ${config.colors.accentGlow}20 0%, transparent 70%)` }} />
        </div>
      ) : (
        <div className="absolute inset-0 opacity-100 transition-opacity duration-500">
             <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at top right, ${config.colors.accent}15, ${config.colors.bg}, #000000)` }} />
             <div className="absolute inset-0" style={{ background: `radial-gradient(circle at bottom left, ${config.colors.accentGlow}10, transparent)` }} />
             
             {/* Stars/Dust only for dark modes */}
             <div className="absolute inset-0 opacity-30 animate-star-drift-slow gpu-accelerated" 
                style={{ 
                    backgroundImage: `radial-gradient(1px 1px at 10px 10px, white, transparent), radial-gradient(1px 1px at 40px 60px, white, transparent)`, 
                    backgroundSize: '150px 150px' 
                }} />

            <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] opacity-30 animate-nebula-pulse mix-blend-screen gpu-accelerated"
                 style={{ background: `radial-gradient(circle, ${config.colors.accent}26 0%, transparent 65%)` }} />
            
             <div className="absolute inset-0">
                {themeId !== 'forest' && stars.map((star) => (
                    <div 
                        key={`shooting-star-${star.id}`}
                        className="absolute h-[1px] w-[150px] bg-gradient-to-r from-transparent to-white opacity-0 animate-shooting-star gpu-accelerated"
                        style={{
                            top: star.top,
                            left: star.left,
                            animationDelay: star.delay,
                            animationDuration: star.duration
                        }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-0.5 bg-white rounded-full shadow-[0_0_8px_2px_rgba(255,255,255,0.5)]" />
                    </div>
                ))}
             </div>
        </div>
      )}
      
      {/* Floating Elements (Math, Particles, etc) */}
      {items.map((item, i) => (
        <div 
          key={item.id}
          className={`absolute font-mono whitespace-nowrap animate-float-gentle mix-blend-screen gpu-accelerated ${item.hiddenOnMobile ? 'hidden md:block' : ''}`}
          style={{
            top: item.top,
            left: item.left,
            fontSize: `${item.size}rem`,
            animationDuration: `${item.duration}s`,
            animationDelay: `${item.delay}s`,
            color: config.mode === 'dark' ? `${config.colors.accent}30` : `${config.colors.accent}20`,
            textShadow: config.mode === 'dark' ? `0 0 8px ${config.colors.accent}20` : 'none'
          }}
        >
          {item.content}
        </div>
      ))}

      {/* Vignette - Extremely subtle in light mode to prevent muddy look */}
      <div 
        className="absolute inset-0 pointer-events-none transition-colors duration-500"
        style={{
            background: config.mode === 'dark' 
                ? 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.6) 100%)' 
                : 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.02) 100%)' 
        }}
      />
    </div>
  );
});

const TABS = [
  { id: 'daily', label: 'Home', icon: LayoutDashboard },
  { id: 'planner', label: 'Plan', icon: CalendarIcon },
  { id: 'focus', label: 'Focus', icon: Timer },
  { id: 'tests', label: 'Tests', icon: PenTool },
  { id: 'analytics', label: 'Stats', icon: BarChart3 },
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('daily');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tests, setTests] = useState<TestResult[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [goals, setGoals] = useState({ Physics: 30, Chemistry: 30, Maths: 30 });
  const [quoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [theme, setTheme] = useState<ThemeId>('default-dark');

  // Load Settings
  useEffect(() => {
    const savedAnim = localStorage.getItem('zenith_animations');
    const savedTheme = localStorage.getItem('zenith_theme_id');
    
    if (savedAnim !== null) setAnimationsEnabled(JSON.parse(savedAnim));
    if (savedTheme && THEME_CONFIG[savedTheme as ThemeId]) setTheme(savedTheme as ThemeId);
  }, []);

  // Persist & Apply Settings
  useEffect(() => {
    localStorage.setItem('zenith_animations', JSON.stringify(animationsEnabled));
    if (!animationsEnabled) document.body.classList.add('disable-animations');
    else document.body.classList.remove('disable-animations');
  }, [animationsEnabled]);

  useEffect(() => {
    localStorage.setItem('zenith_theme_id', theme);
  }, [theme]);

  // Load Data
  useEffect(() => {
    const savedSessions = localStorage.getItem('zenith_sessions');
    const savedTests = localStorage.getItem('zenith_tests');
    const savedTargets = localStorage.getItem('zenith_targets');
    const savedGoals = localStorage.getItem('zenith_goals');

    if (savedSessions) setSessions(JSON.parse(savedSessions));
    if (savedTests) setTests(JSON.parse(savedTests));
    if (savedTargets) setTargets(JSON.parse(savedTargets));
    if (savedGoals) setGoals(JSON.parse(savedGoals));
  }, []);

  // Persistence Effects
  useEffect(() => { setTimeout(() => localStorage.setItem('zenith_sessions', JSON.stringify(sessions)), 500) }, [sessions]);
  useEffect(() => { setTimeout(() => localStorage.setItem('zenith_tests', JSON.stringify(tests)), 500) }, [tests]);
  useEffect(() => { setTimeout(() => localStorage.setItem('zenith_targets', JSON.stringify(targets)), 500) }, [targets]);
  useEffect(() => { setTimeout(() => localStorage.setItem('zenith_goals', JSON.stringify(goals)), 500) }, [goals]);

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

  const themeConfig = THEME_CONFIG[theme];

  return (
    <div className={`min-h-screen font-sans overflow-x-hidden relative flex flex-col transition-colors duration-500 ${themeConfig.mode === 'dark' ? 'dark text-slate-100' : 'text-slate-900'}`}>
      
      {/* Dynamic Theme Styles Injection - The "Skinning" Engine */}
      <style>{`
        :root {
          --theme-accent: ${themeConfig.colors.accent};
          --theme-accent-glow: ${themeConfig.colors.accentGlow};
          --theme-card-bg: ${themeConfig.colors.card};
          --theme-text-main: ${themeConfig.colors.text};
          /* Stronger contrast for subtext in light mode */
          --theme-text-sub: ${themeConfig.mode === 'dark' ? 'rgba(255,255,255,0.5)' : '#334155'}; /* Slate-700 in light mode */
        }
        
        /* --- GLOBAL COLOR MAPPING --- */

        /* 1. Map all Indigo Utility Classes to Theme Accent */
        .text-indigo-50, .text-indigo-100, .text-indigo-200, .text-indigo-300, .text-indigo-400, .text-indigo-500, .text-indigo-600, .text-indigo-700, .text-indigo-800, .text-indigo-900 {
            color: var(--theme-accent) !important;
        }
        .bg-indigo-400, .bg-indigo-500, .bg-indigo-600, .bg-indigo-700 {
            background-color: var(--theme-accent) !important;
        }
        .border-indigo-100, .border-indigo-200, .border-indigo-300, .border-indigo-400, .border-indigo-500, .border-indigo-600 {
            border-color: var(--theme-accent) !important;
        }
        .ring-indigo-500, .ring-indigo-600 {
            --tw-ring-color: var(--theme-accent) !important;
        }
        .shadow-indigo-500\\/20, .shadow-indigo-600\\/20, .shadow-indigo-500\\/40, .shadow-indigo-600\\/30 {
            box-shadow: 0 10px 15px -3px ${themeConfig.colors.accent}40 !important;
        }

        /* 2. TEXT NORMALIZATION (Crucial for visibility) */
        /* Forces standard Tailwind text classes to use theme-aware colors */
        .text-slate-900, .text-gray-900, .text-zinc-900, .text-neutral-900 {
            color: var(--theme-text-main) !important;
        }
        /* Mapped Subtext */
        .text-slate-500, .text-gray-500, .text-zinc-500, .text-neutral-500 {
            color: var(--theme-text-sub) !important;
        }
        /* In light mode, ensure 'slate-400' is darker for readability */
        ${themeConfig.mode === 'light' ? `
            .text-slate-300 { color: #94a3b8 !important; } /* Becomes Slate 400 */
            .text-slate-400, .text-gray-400 { color: #475569 !important; } /* Becomes Slate 600 */
            .text-slate-600 { color: #1e293b !important; } /* Becomes Slate 800 */
            .placeholder\\:text-slate-400::placeholder { color: #64748b !important; }
        ` : ''}

        /* 3. Card & Glass Effect Overrides */
        
        /* Light Mode Cards: Higher Opacity White + Border */
        .bg-white\\/60, .bg-white\\/70, .bg-white\\/80, .bg-white\\/50 {
             background-color: ${themeConfig.mode === 'light' ? 'rgba(255,255,255,0.95)' : themeConfig.colors.card + '99'} !important;
             border-color: ${themeConfig.mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)'} !important;
             box-shadow: ${themeConfig.mode === 'light' ? '0 8px 16px -4px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)' : 'none'} !important;
        }
        
        /* Dark Mode Cards */
        .dark .bg-slate-900\\/40, .dark .bg-slate-900\\/50, .dark .bg-slate-900\\/60, .dark .bg-slate-900\\/80 {
            background-color: ${themeConfig.colors.card}99 !important;
        }

        /* 4. Gradient Overrides */
        .from-indigo-400, .from-indigo-500, .from-indigo-600 { --tw-gradient-from: var(--theme-accent) !important; }
        .to-indigo-400, .to-indigo-500, .to-indigo-600 { --tw-gradient-to: var(--theme-accent) !important; }

        /* 5. Input Field Visibility */
        input, select, textarea {
            background-color: ${themeConfig.mode === 'dark' ? 'rgba(0,0,0,0.2)' : '#ffffff'} !important;
            border-color: ${themeConfig.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#cbd5e1'} !important;
            color: ${themeConfig.colors.text} !important;
        }
        /* Fix focus ring color */
        input:focus, select:focus, textarea:focus {
            border-color: var(--theme-accent) !important;
            box-shadow: 0 0 0 1px var(--theme-accent) !important;
        }

        .bg-black\\/20, .dark .bg-black\\/20 {
            background-color: ${themeConfig.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'} !important;
        }

        /* 6. Planner Toggle & Button Specifics */
        .dark .dark\\:bg-indigo-600 { background-color: var(--theme-accent) !important; }
        .dark .dark\\:text-white { color: #ffffff !important; }
        
        /* 7. Scrollbars */
        ::-webkit-scrollbar-thumb {
            background-color: ${themeConfig.colors.accent}66 !important;
            border-radius: 10px;
        }
        ::-webkit-scrollbar-track { background: transparent; }

        /* 8. Selection Color */
        ::selection {
          background-color: ${themeConfig.colors.accent}4d; 
          color: white;
        }
      `}</style>

      <AnimatedBackground enabled={animationsEnabled} themeId={theme} />
      
      {/* Header */}
      <div className="relative z-10 p-6 flex justify-between items-center">
        <TracklyLogo />
        <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
          <Settings size={24} className="text-slate-600 dark:text-slate-300" />
        </button>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-grow p-4 md:p-6 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
        {view === 'daily' && (
            <Dashboard 
                sessions={sessions}
                targets={targets}
                quote={QUOTES[quoteIdx]}
                onDelete={handleDeleteSession}
                goals={goals}
                setGoals={setGoals}
                onSaveSession={handleSaveSession}
            />
        )}
        {view === 'planner' && (
            <Planner 
                targets={targets}
                onAdd={handleSaveTarget}
                onToggle={handleUpdateTarget}
                onDelete={handleDeleteTarget}
            />
        )}
        {view === 'focus' && (
            <FocusTimer targets={targets} />
        )}
        {view === 'tests' && (
            <TestLog 
                tests={tests}
                targets={targets} 
                onSave={handleSaveTest}
                onDelete={handleDeleteTest}
            />
        )}
        {view === 'analytics' && (
            <Analytics sessions={sessions} tests={tests} />
        )}
      </main>

      {/* Navigation Tabs */}
      <nav 
        className="fixed bottom-0 left-0 w-full z-50 bg-white/95 dark:bg-[#020617]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 px-6 py-3 md:hidden transition-colors duration-500 shadow-[0_-5px_10px_rgba(0,0,0,0.03)] dark:shadow-none"
        style={{ 
            paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
            backgroundColor: themeConfig.mode === 'dark' ? themeConfig.colors.bg + 'ee' : 'rgba(255,255,255,0.95)'
        }}
      >
          <div className="flex justify-around items-center">
            {TABS.map(tab => {
              const isActive = view === tab.id;
              return (
                <button
                    key={tab.id}
                    onClick={() => setView(tab.id as ViewType)}
                    className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-indigo-600 dark:text-indigo-400 scale-105' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                    <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-indigo-100 dark:bg-indigo-500/20' : 'bg-transparent'}`}>
                        <tab.icon size={22} strokeWidth={isActive ? 2.5 : 2} className="transition-all" />
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider transition-opacity ${isActive ? 'opacity-100' : 'opacity-70'}`}>{tab.label}</span>
                </button>
            )})}
          </div>
      </nav>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        animationsEnabled={animationsEnabled}
        toggleAnimations={() => setAnimationsEnabled(!animationsEnabled)}
        theme={theme}
        setTheme={setTheme}
      />
    </div>
  );
};

export default App;