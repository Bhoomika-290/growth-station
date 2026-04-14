import { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { FocusTimerFAB } from '@/components/FocusTimer';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { removeToken } from '@/lib/auth';
import {
  Timer, User, Settings, LogOut, ChevronDown, Bell, Flame,
  Trophy, Play, Pause, RotateCcw, X
} from 'lucide-react';

export default function Dashboard() {
  return (
    <>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <DashboardHeader />
            <main className="flex-1 p-4 sm:p-6 overflow-auto bg-background">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
      <FocusTimerFAB />
    </>
  );
}

function DashboardHeader() {
  const { user, domain, streak, rank } = useStationStore();
  const config = domainConfig[domain];
  const [focusOpen, setFocusOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { logout } = useStationStore();

  const handleLogout = () => {
    removeToken();
    logout();
    navigate('/');
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'ST';

  const menuItems = [
    { icon: User, label: 'Profile', action: () => { navigate('/dashboard/profile'); setDropOpen(false); } },
    { icon: Settings, label: 'Settings', action: () => { navigate('/dashboard/settings'); setDropOpen(false); } },
    { icon: Timer, label: 'Focus Timer', action: () => { setFocusOpen(true); setDropOpen(false); } },
  ];

  return (
    <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-card/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        {/* Breadcrumb / domain badge */}
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          {config.label}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Streak pill */}
        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-semibold">
          <Flame className="w-3.5 h-3.5" />
          {streak}d
        </div>

        {/* Rank pill */}
        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold">
          <Trophy className="w-3.5 h-3.5" />
          #{rank}
        </div>

        {/* Focus timer button */}
        <button
          onClick={() => setFocusOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-medium hover:bg-accent/20 transition-colors border border-accent/20"
        >
          <Timer className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Focus</span>
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setDropOpen(v => !v)}
            data-testid="button-user-menu"
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl border border-border hover:bg-muted transition-colors"
          >
            {/* Avatar */}
            <div className="w-7 h-7 rounded-lg bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="hidden sm:flex flex-col items-start leading-none">
              <span className="text-xs font-semibold text-foreground max-w-[100px] truncate">{user?.name || 'Student'}</span>
              <span className="text-[10px] text-muted-foreground">{config.tag}</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {dropOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-2xl shadow-xl shadow-black/10 z-50 overflow-hidden animate-fade-in">
              {/* User info header */}
              <div className="px-4 py-3.5 border-b border-border bg-muted/40">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{user?.name || 'Student'}</p>
                    <p className="text-xs text-muted-foreground">{config.label} · Rank #{rank}</p>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="p-1.5">
                {menuItems.map(item => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-muted transition-colors text-left"
                  >
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Divider + logout */}
              <div className="p-1.5 border-t border-border">
                <button
                  onClick={handleLogout}
                  data-testid="button-logout"
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {focusOpen && <FocusTimerModal onClose={() => setFocusOpen(false)} />}
    </header>
  );
}

function FocusTimerModal({ onClose }: { onClose: () => void }) {
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const { boostRank, addFocusMinutes } = useStationStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) { setRunning(false); setCompleted(true); boostRank(15); addFocusMinutes(25); return 0; }
          return s - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } };
  }, [running, boostRank, addFocusMinutes]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = ((25 * 60 - seconds) / (25 * 60)) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-2xl p-8 shadow-2xl w-80 animate-fade-in border border-border" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Focus Timer</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="relative w-48 h-48 mx-auto mb-6">
          <svg className="w-full h-full -rotate-90">
            <circle cx="96" cy="96" r="88" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
            <circle cx="96" cy="96" r="88" fill="none" stroke="hsl(var(--accent))" strokeWidth="8"
              strokeDasharray={553} strokeDashoffset={553 - (553 * progress) / 100} strokeLinecap="round" className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold font-mono">{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
          </div>
        </div>
        <div className="flex justify-center gap-4">
          <button onClick={() => !completed && setRunning(!running)} disabled={completed}
            className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-40">
            {running ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <button onClick={() => { setRunning(false); setCompleted(false); setSeconds(25 * 60); if (intervalRef.current) clearInterval(intervalRef.current); }}
            className="w-12 h-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center hover:scale-110 transition-transform">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
        {completed && <p className="text-center mt-4 text-accent font-medium text-sm">Session complete! Rank boosted 🎉</p>}
      </div>
    </div>
  );
}
