import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { FocusTimerFAB } from '@/components/FocusTimer';
import { Timer } from 'lucide-react';

export default function Dashboard() {
  return (
    <>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-card">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="flex items-center gap-3">
                <button className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent/10 text-accent font-medium hover-scale">
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
    </>
  );
}
