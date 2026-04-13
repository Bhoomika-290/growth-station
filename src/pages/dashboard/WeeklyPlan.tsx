import { useState } from 'react';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { CalendarDays, Clock, FileText, X, TrendingUp, AlertTriangle, Award, CheckCircle, Square, Check, BarChart3, MapPin, Building, Video, ExternalLink, BookOpen } from 'lucide-react';

export default function WeeklyPlan() {
  const { domain, user, completeTask, rank, totalStudents, language } = useStationStore();
  const config = domainConfig[domain];
  const isHi = language === 'hi';
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [completedQuestions, setCompletedQuestions] = useState<Record<number, Set<number>>>({});

  const resources = config.weeklyResources as Record<string, { videos: string[]; pdfs: string[] }>;

  const days = config.weeklyTopics.map((topic, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    dayHi: ['सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'रवि'][i],
    topic,
    questions: [
      `Understand fundamentals of ${topic}`,
      `Practice 5 basic problems on ${topic}`,
      `Watch video lecture on ${topic}`,
      `Solve 3 advanced problems on ${topic}`,
      `Review and summarize ${topic} notes`,
    ],
    time: `${30 + i * 5} min`,
    videos: resources[topic]?.videos || [],
    pdfs: resources[topic]?.pdfs || [],
  }));

  const toggleQuestion = (dayIdx: number, qIdx: number) => {
    setCompletedQuestions(prev => {
      const daySet = new Set(prev[dayIdx] || []);
      if (daySet.has(qIdx)) { daySet.delete(qIdx); } else { daySet.add(qIdx); completeTask(); }
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
  const pct = Math.round(((totalStudents - rank) / totalStudents) * 100);
  const strongestDay = [...completedDays].length > 0 ? config.weeklyTopics[[...completedDays][0]] : null;
  const weakestTopic = config.weeklyTopics.find((_, i) => !completedDays.has(i)) || config.weeklyTopics[4];

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isHi ? 'साप्ताहिक योजना' : 'Weekly Plan'}</h1>
          <p className="text-sm text-muted-foreground">{user?.name ? `${user.name}'s` : 'Your'} {isHi ? config.labelHi : config.label} {isHi ? 'तैयारी' : 'preparation'}</p>
        </div>
        <button onClick={() => setShowReport(true)} className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover:scale-105 transition-transform flex items-center gap-2">
          <FileText className="w-4 h-4" /> {isHi ? 'रिपोर्ट' : 'Report'}
        </button>
      </div>

      {/* Progress */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">{totalTasksDone}/{totalTasks} {isHi ? 'कार्य' : 'tasks'}</p>
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
                  {isHi ? d.dayHi : d.day}
                </span>
                <span className="flex-1 font-medium text-sm">{d.topic}</span>
                {dayCompleted && <CheckCircle className="w-4 h-4 text-accent" />}
                <span className="text-xs text-muted-foreground">{dayProgress}/{d.questions.length}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{d.time}</span>
              </button>
              {expandedDay === i && (
                <div className="px-4 pb-4 border-t border-border pt-3 animate-fade-in space-y-4">
                  <p className="text-sm font-medium">{isHi ? `${d.topic} के कार्य:` : `Tasks for ${d.topic}:`}</p>
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

                  {/* Study Materials */}
                  {(d.videos.length > 0 || d.pdfs.length > 0) && (
                    <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-accent" />
                        {isHi ? 'अध्ययन सामग्री' : 'Study Materials'}
                      </p>
                      {d.videos.map((url, vi) => (
                        <a key={vi} href={url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-accent/50 transition-all">
                          <div className="w-8 h-8 rounded-lg bg-accent/20 text-accent flex items-center justify-center">
                            <Video className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium">{isHi ? 'वीडियो लेक्चर' : 'Video Lecture'} {vi + 1}</p>
                            <p className="text-[10px] text-muted-foreground">YouTube</p>
                          </div>
                          <ExternalLink className="w-3 h-3 text-muted-foreground" />
                        </a>
                      ))}
                      {d.pdfs.map((pdf, pi) => (
                        <div key={pi} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                          <div className="w-8 h-8 rounded-lg bg-accent/20 text-accent flex items-center justify-center">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium">{pdf}</p>
                            <p className="text-[10px] text-muted-foreground">{isHi ? 'अध्ययन नोट्स' : 'Study Notes'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
              <h3 className="text-lg font-bold">{isHi ? 'साप्ताहिक प्रदर्शन' : 'Weekly Performance'}</h3>
              <button onClick={() => setShowReport(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-4 rounded-xl bg-muted/50 mb-4">
              <p className="font-semibold">{user?.name || 'Student'}</p>
              <p className="text-xs text-muted-foreground">{user?.college || ''} · {user?.specialization || config.label} · {user?.city || ''}</p>
            </div>

            <div className="text-center p-4 rounded-xl border border-border mb-4">
              <p className="text-4xl font-bold text-accent">{overallProgress}%</p>
              <p className="text-xs text-muted-foreground mt-1">{totalTasksDone}/{totalTasks} {isHi ? 'कार्य पूर्ण' : 'tasks completed'}</p>
              <div className="h-2 bg-muted rounded-full overflow-hidden mt-3">
                <div className="h-full bg-accent rounded-full" style={{ width: `${overallProgress}%` }} />
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                <BarChart3 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Top {pct}% in {user?.city || 'your area'}</p>
                  <p className="text-xs text-muted-foreground">{isHi ? `${config.labelHi} छात्रों में` : `Among ${config.label} students`}</p>
                </div>
              </div>

              {strongestDay && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/5 border border-accent/20">
                  <Award className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{isHi ? 'सबसे मजबूत' : 'Strongest'}: {strongestDay}</p>
                    <p className="text-xs text-muted-foreground">{isHi ? 'इस विषय के सभी कार्य पूर्ण' : 'All tasks completed for this topic'}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{isHi ? 'सुधार की ज़रूरत' : 'Needs work'}: {weakestTopic}</p>
                  <p className="text-xs text-muted-foreground">{isHi ? 'अगले हफ्ते इस पर ध्यान दें' : 'Focus on this next week'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{user?.city || 'Your area'}</p>
                  <p className="text-xs text-muted-foreground">
                    {totalCompleted >= 5 ? (isHi ? 'केवल 3% छात्रों ने इतना पूरा किया है' : 'Only 3% have completed this much') :
                     totalCompleted >= 3 ? (isHi ? 'शीर्ष 25% में' : 'You are in top 25%') :
                     (isHi ? 'निरंतरता आपको अलग करेगी' : 'Consistency will set you apart')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
