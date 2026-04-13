import { useState } from 'react';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { CalendarDays, Clock, FileText, X, TrendingUp, AlertTriangle, Award, CheckCircle, Square, Check, BarChart3, MapPin, Building } from 'lucide-react';

export default function WeeklyPlan() {
  const { domain, user, completeTask, rank, totalStudents } = useStationStore();
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
      if (daySet.size === days[dayIdx].questions.length) {
        setCompletedDays(p => new Set([...p, dayIdx]));
      } else {
        setCompletedDays(p => { const n = new Set(p); n.delete(dayIdx); return n; });
      }
      return next;
    });
  };

  const totalCompleted = completedDays.size;
  const totalTasksDone = Object.values(completedQuestions).reduce((sum, s) => sum + s.size, 0);
  const totalTasks = days.length * 5;
  const overallProgress = Math.round((totalTasksDone / totalTasks) * 100);

  // User-specific report data
  const currentLevel = totalCompleted >= 5 ? 'Advanced' : totalCompleted >= 3 ? 'Intermediate' : 'Beginner';
  const pct = Math.round(((totalStudents - rank) / totalStudents) * 100);
  const strongestDay = [...completedDays].length > 0 ? config.weeklyTopics[[...completedDays][0]] : null;
  const weakestTopic = config.weeklyTopics.find((_, i) => !completedDays.has(i)) || config.weeklyTopics[4];
  const interviewReady = totalCompleted >= 3 ? Math.min(config.companies.length, totalCompleted) : 1;
  const expectedPkg = domain === 'engineering'
    ? totalCompleted >= 5 ? '8-14 LPA' : totalCompleted >= 3 ? '5-8 LPA' : '3-5 LPA'
    : domain === 'commerce'
    ? totalCompleted >= 5 ? '6-10 LPA' : totalCompleted >= 3 ? '4-7 LPA' : '2.5-4 LPA'
    : totalCompleted >= 5 ? 'Group A Services' : totalCompleted >= 3 ? 'Group B Services' : 'State PCS';

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Weekly Plan</h1>
          <p className="text-sm text-muted-foreground">{user?.name ? `${user.name}'s` : 'Your'} personalized {config.label} preparation for this week</p>
        </div>
        <button onClick={() => setShowReport(true)} className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover:scale-105 transition-transform flex items-center gap-2">
          <FileText className="w-4 h-4" /> Weekly Report
        </button>
      </div>

      {/* Progress */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">Weekly Progress — {totalTasksDone}/{totalTasks} tasks</p>
          <p className="text-sm font-bold text-accent">{overallProgress}%</p>
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
          <div className="bg-card rounded-2xl p-6 shadow-2xl w-full max-w-lg animate-fade-in max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold">Weekly Performance Report</h3>
              <button onClick={() => setShowReport(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>

            {/* User header */}
            <div className="p-4 rounded-xl bg-muted/50 mb-4">
              <p className="font-semibold">{user?.name || 'Student'}</p>
              <p className="text-xs text-muted-foreground">{user?.college || 'College'} · {user?.specialization || config.label} · {user?.city || 'City'}</p>
            </div>

            {/* Completion */}
            <div className="text-center p-4 rounded-xl border border-border mb-4">
              <p className="text-4xl font-bold text-accent">{overallProgress}%</p>
              <p className="text-xs text-muted-foreground mt-1">{totalTasksDone} of {totalTasks} tasks completed this week</p>
              <div className="h-2 bg-muted rounded-full overflow-hidden mt-3">
                <div className="h-full bg-accent rounded-full" style={{ width: `${overallProgress}%` }} />
              </div>
            </div>

            <div className="space-y-3 text-sm">
              {/* Current Level */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                <BarChart3 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Current Level: {currentLevel}</p>
                  <p className="text-xs text-muted-foreground">You are in Top {pct}% among {config.label} students in {user?.city || 'your area'}</p>
                </div>
              </div>

              {/* Companies ready */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                <Building className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Interview-ready for {interviewReady} {domain === 'arts' ? 'services' : 'companies'}</p>
                  <p className="text-xs text-muted-foreground">
                    {config.companies.slice(0, interviewReady).join(', ')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Expected: {expectedPkg}</p>
                </div>
              </div>

              {/* Strongest */}
              {strongestDay && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/5 border border-accent/20">
                  <Award className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Strongest this week: {strongestDay}</p>
                    <p className="text-xs text-muted-foreground">You completed all tasks for this topic. Keep building on it.</p>
                  </div>
                </div>
              )}

              {/* Weakest */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Needs work: {weakestTopic}</p>
                  <p className="text-xs text-muted-foreground">Dedicate extra time to this topic next week. Focus on fundamentals first.</p>
                </div>
              </div>

              {/* Location context */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Competition in {user?.city || 'your area'}</p>
                  <p className="text-xs text-muted-foreground">
                    {totalCompleted >= 5
                      ? `Only 3% of students in your area have completed this much. You are ahead.`
                      : totalCompleted >= 3
                      ? `You are in the top 25% of active learners in your area. Push harder.`
                      : `Most students in your area are at this level. Consistency will set you apart.`}
                  </p>
                </div>
              </div>

              {/* Next week */}
              <div className="p-3 rounded-xl bg-muted/30">
                <p className="font-medium">Recommended focus next week:</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Double down on <span className="text-accent font-medium">{weakestTopic}</span> and continue practicing{' '}
                  <span className="text-accent font-medium">{strongestDay || config.weeklyTopics[0]}</span> to maintain momentum.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
