import { useState } from 'react';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { CalendarDays, Clock, FileText, X, TrendingUp, AlertTriangle, Award } from 'lucide-react';

export default function WeeklyPlan() {
  const { domain, user } = useStationStore();
  const config = domainConfig[domain];
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [showReport, setShowReport] = useState(false);

  const days = config.weeklyTopics.map((topic, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    topic,
    questions: Math.floor(Math.random() * 15) + 5,
    time: `${Math.floor(Math.random() * 30) + 20} min`,
    done: i < 3,
  }));

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Weekly Plan</h1>
          <p className="text-sm text-muted-foreground">Your personalized {config.label} preparation for this week</p>
        </div>
        <button onClick={() => setShowReport(true)} className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover-scale flex items-center gap-2">
          <FileText className="w-4 h-4" /> Generate Report
        </button>
      </div>

      <div className="grid gap-3">
        {days.map((d, i) => (
          <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
            <button onClick={() => setExpandedDay(expandedDay === i ? null : i)}
              className={`w-full flex items-center gap-4 p-4 text-left transition-colors ${d.done ? 'opacity-60' : ''}`}>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${d.done ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'}`}>{d.day}</span>
              <span className="flex-1 font-medium text-sm">{d.topic}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{d.time}</span>
              <span className="text-xs text-muted-foreground">{d.questions} Qs</span>
            </button>
            {expandedDay === i && (
              <div className="px-4 pb-4 border-t border-border pt-3 text-sm text-muted-foreground animate-fade-in">
                <p className="mb-2">Questions for {d.topic}:</p>
                {Array.from({ length: Math.min(d.questions, 5) }).map((_, qi) => (
                  <div key={qi} className="flex items-center gap-2 py-1">
                    <CalendarDays className="w-3 h-3 text-accent" />
                    <span>Practice Question {qi + 1} — {d.topic}</span>
                  </div>
                ))}
                {d.questions > 5 && <p className="text-xs text-accent mt-2">+{d.questions - 5} more questions</p>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setShowReport(false)}>
          <div className="bg-card rounded-2xl p-8 shadow-2xl w-full max-w-md animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Weekly Report</h3>
              <button onClick={() => setShowReport(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/10"><Award className="w-5 h-5 text-accent" /><div><p className="font-medium">Current Level: Intermediate</p><p className="text-xs text-muted-foreground">234 competitors at this level in {user?.city || 'your area'}</p></div></div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted"><TrendingUp className="w-5 h-5 text-accent" /><div><p className="font-medium">Interview-ready for: 3 companies</p><p className="text-xs text-muted-foreground">Expected package: 5-8 LPA</p></div></div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted"><AlertTriangle className="w-5 h-5 text-destructive" /><div><p className="font-medium">Needs improvement: {config.weeklyTopics[4]}</p><p className="text-xs text-muted-foreground">Recommend extra focus next week</p></div></div>
              <p className="text-xs text-muted-foreground pt-2">Strongest topic: {config.weeklyTopics[0]}. Keep pushing!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
