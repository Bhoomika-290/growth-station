import { useState } from 'react';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { CalendarDays, Clock, FileText, X, TrendingUp, AlertTriangle, Award, CheckCircle, Square, Check } from 'lucide-react';

export default function WeeklyPlan() {
  const { domain, user, completeTask } = useStationStore();
  const config = domainConfig[domain];
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [completedQuestions, setCompletedQuestions] = useState<Record<number, Set<number>>>({});

  const days = config.weeklyTopics.map((topic, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    topic,
    questions: [
      `Understand fundamentals of ${topic}`,
      `Practice 5 basic problems on ${topic}`,
      `Watch video lecture on ${topic}`,
      `Solve 3 advanced problems on ${topic}`,
      `Review and summarize ${topic} notes`,
    ],
    time: `${30 + i * 5} min`,
  }));

  const toggleQuestion = (dayIdx: number, qIdx: number) => {
    setCompletedQuestions(prev => {
      const daySet = new Set(prev[dayIdx] || []);
      if (daySet.has(qIdx)) {
        daySet.delete(qIdx);
      } else {
        daySet.add(qIdx);
        completeTask();
      }
      const next = { ...prev, [dayIdx]: daySet };
      // Check if all questions for this day are completed
      if (daySet.size === days[dayIdx].questions.length) {
        setCompletedDays(p => new Set([...p, dayIdx]));
      } else {
        setCompletedDays(p => { const n = new Set(p); n.delete(dayIdx); return n; });
      }
      return next;
    });
  };

  const totalCompleted = completedDays.size;
  const overallProgress = Math.round((totalCompleted / 7) * 100);

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

      {/* Progress */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">Weekly Progress</p>
          <p className="text-sm font-bold text-accent">{totalCompleted}/7 days</p>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }} />
        </div>
      </div>

      <div className="grid gap-3">
        {days.map((d, i) => {
          const dayCompleted = completedDays.has(i);
          const dayQuestions = completedQuestions[i] || new Set<number>();
          const dayProgress = dayQuestions.size;
          return (
            <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
              <button onClick={() => setExpandedDay(expandedDay === i ? null : i)}
                className={`w-full flex items-center gap-4 p-4 text-left transition-colors ${dayCompleted ? 'opacity-70' : ''}`}>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${dayCompleted ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'}`}>
                  {d.day}
                </span>
                <span className="flex-1 font-medium text-sm">{d.topic}</span>
                {dayCompleted && <CheckCircle className="w-4 h-4 text-accent" />}
                <span className="text-xs text-muted-foreground">{dayProgress}/{d.questions.length}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{d.time}</span>
              </button>
              {expandedDay === i && (
                <div className="px-4 pb-4 border-t border-border pt-3 animate-fade-in">
                  <p className="text-sm font-medium mb-3">Tasks for {d.topic}:</p>
                  <div className="space-y-2">
                    {d.questions.map((q, qi) => {
                      const done = dayQuestions.has(qi);
                      return (
                        <button key={qi} onClick={() => toggleQuestion(i, qi)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left text-sm transition-all ${
                            done ? 'bg-accent/5 border-accent/30 line-through text-muted-foreground' : 'border-border hover:border-accent/50'
                          }`}>
                          {done ? <Check className="w-4 h-4 text-accent flex-shrink-0" /> : <Square className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                          <span>{q}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
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
              <div className="p-4 rounded-xl bg-accent/10 text-center">
                <p className="text-3xl font-bold text-accent">{overallProgress}%</p>
                <p className="text-xs text-muted-foreground">Weekly completion</p>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                <Award className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-medium">Current Level: {totalCompleted >= 5 ? 'Advanced' : totalCompleted >= 3 ? 'Intermediate' : 'Beginner'}</p>
                  <p className="text-xs text-muted-foreground">234 competitors at this level in {user?.city || 'your area'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                <TrendingUp className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-medium">Interview-ready for: {totalCompleted >= 3 ? '3' : '1'} companies</p>
                  <p className="text-xs text-muted-foreground">Expected package: {totalCompleted >= 3 ? '5-8' : '3-5'} LPA</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <div>
                  <p className="font-medium">Needs improvement: {config.weeklyTopics.find((_, i) => !completedDays.has(i)) || config.weeklyTopics[4]}</p>
                  <p className="text-xs text-muted-foreground">Recommend extra focus next week</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                Strongest topic: {completedDays.size > 0 ? config.weeklyTopics[[...completedDays][0]] : 'Complete tasks to see'}. Keep pushing!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
