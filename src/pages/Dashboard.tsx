import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { FocusTimerFAB } from '@/components/FocusTimer';
import { Timer } from 'lucide-react';

export default function Dashboard() {
  const [showTimer, setShowTimer] = useState(false);

  return (
    <>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-card">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="flex items-center gap-3">
                <button onClick={() => setShowTimer(true)} className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent/10 text-accent font-medium hover:bg-accent/20 transition-colors">
                  <Timer className="w-3 h-3" /> Focus
                </button>
              </div>
            </header>
            <main className="flex-1 p-6 overflow-auto bg-background">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
      <FocusTimerFAB />
      {showTimer && (
        <FocusTimerModal onClose={() => setShowTimer(false)} />
      )}
    </>
  );
}

// Inline modal for header button
function FocusTimerModal({ onClose }: { onClose: () => void }) {
  // Re-use the same component from FocusTimer
  const { FocusTimerFAB: _, ...rest } = require('@/components/FocusTimer');
  // Actually, let's just import and render inline
  return null;
}
