import { useState, useMemo } from 'react';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { TrendingUp, Flame, CheckCircle, Target, Zap, ChevronRight, Square, Check, X, Brain, Trophy, Medal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { domain, user, rank, totalStudents, streak, tasksDone, weeklyGoalProgress, boostRank, completeTask } = useStationStore();
  const config = domainConfig[domain];
  const navigate = useNavigate();
  const [showOvertake, setShowOvertake] = useState(false);
  const [todoChecked, setTodoChecked] = useState<boolean[]>(Array(config.todoItems.length).fill(false));
  const [showStudyPopup, setShowStudyPopup] = useState(false);
  const [selectedStudyTopic, setSelectedStudyTopic] = useState('');
  const pct = Math.round(((totalStudents - rank) / totalStudents) * 100);

  const studentsToOvertake = useMemo(() => Math.floor(Math.random() * 40) + 20, []);

  // Leaderboard data — user-specific rank placement
  const leaderboard = useMemo(() => {
    const names = domain === 'engineering'
      ? ['Aarav S.', 'Priya M.', 'Rohit K.', 'Sneha J.', 'Vikram T.', 'Ananya R.', 'Karan P.', 'Neha G.']
      : domain === 'commerce'
      ? ['Deepak M.', 'Anjali S.', 'Mohit R.', 'Kavita P.', 'Suresh T.', 'Pooja L.', 'Rajesh K.', 'Divya N.']
      : ['Meera S.', 'Arjun R.', 'Riya P.', 'Suresh K.', 'Kavita M.', 'Anil T.', 'Priti J.', 'Manish D.'];

    const entries = names.map((name, i) => ({
      name,
      score: 950 - i * 47,
      locality: user?.city || 'Your Area',
    }));

    // Insert user at their approximate position
    const userPos = Math.min(Math.max(0, Math.floor((rank / totalStudents) * entries.length)), entries.length - 1);
    entries.splice(userPos, 0, {
      name: user?.name || 'You',
      score: 950 - userPos * 47,
      locality: user?.city || 'Your Area',
    });

    return entries.slice(0, 8);
  }, [domain, rank, totalStudents, user]);

  const handleBoost = () => {
    setShowOvertake(true);
    boostRank(studentsToOvertake);
    setTimeout(() => setShowOvertake(false), 2000);
  };

  const toggleTodo = (i: number) => {
    const n = [...todoChecked];
    if (!n[i]) {
      n[i] = true;
      completeTask();
    } else {
      n[i] = false;
    }
    setTodoChecked(n);
  };

  const handleStudySelect = (topic: string) => {
    setSelectedStudyTopic(topic);
    setShowStudyPopup(false);
    navigate('/dashboard/vault');
  };

  return (
    <div className="max-w-5xl space-y-6 animate-fade-in">
      {/* Greeting + Affirmation */}
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'Student'}</h1>
        <p className="text-sm text-muted-foreground italic mt-1">{config.affirmation}</p>
      </div>

      {/* Rank Widget */}
      <div className="bg-card rounded-2xl border border-border p-6 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Your Local Rank</p>
            <p className="text-3xl font-bold">Top {pct}%</p>
            <p className="text-xs text-muted-foreground mt-1">Rank #{rank} of {totalStudents} in {user?.city || 'your area'} for {config.label}</p>
          </div>
          <button onClick={handleBoost} className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover:scale-105 transition-transform flex items-center gap-1">
            <Zap className="w-4 h-4" /> Boost my rank
          </button>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">Complete 2 more tasks to overtake {studentsToOvertake} students</p>

        {showOvertake && (
          <div className="absolute inset-0 bg-accent/10 backdrop-blur-sm flex items-center justify-center animate-fade-in">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-accent mx-auto mb-2" />
              <p className="text-lg font-bold">You overtook {studentsToOvertake} students!</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Flame, label: 'Streak', value: `${streak} days` },
            { icon: CheckCircle, label: 'Tasks Done', value: String(tasksDone) },
            { icon: Target, label: 'Weekly Goal', value: `${weeklyGoalProgress}%` },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-xl border border-border p-4 text-center">
              <s.icon className="w-5 h-5 mx-auto mb-1 text-accent" />
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Weekly Goal Ring */}
        <div className="bg-card rounded-xl border border-border p-6 flex items-center gap-6">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
              <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--accent))" strokeWidth="6"
                strokeDasharray={213} strokeDashoffset={213 - (213 * weeklyGoalProgress) / 100} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{weeklyGoalProgress}%</span>
          </div>
          <div>
            <p className="font-semibold">Weekly Progress</p>
            <p className="text-xs text-muted-foreground">Keep going! You're {100 - weeklyGoalProgress}% away from your weekly target.</p>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Trophy className="w-4 h-4 text-accent" /> Leaderboard — {user?.city || 'Your Area'}</h3>
        <div className="space-y-2">
          {leaderboard.map((entry, i) => {
            const isUser = entry.name === (user?.name || 'You');
            return (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl text-sm transition-all ${isUser ? 'bg-accent/10 border border-accent/30' : 'bg-muted/30'}`}>
                <span className="w-6 text-center font-bold">
                  {i === 0 ? <Medal className="w-4 h-4 text-accent mx-auto" /> : i === 1 ? <Medal className="w-4 h-4 text-muted-foreground mx-auto" /> : `#${i + 1}`}
                </span>
                <span className="flex-1 font-medium">{entry.name} {isUser && <span className="text-accent text-xs">(You)</span>}</span>
                <span className="text-xs text-muted-foreground">{entry.score} pts</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* What are you studying today? */}
      <button onClick={() => setShowStudyPopup(true)}
        className="w-full bg-accent/5 border border-accent/20 rounded-2xl p-5 flex items-center gap-4 text-left hover:bg-accent/10 transition-all group">
        <div className="w-12 h-12 rounded-xl bg-accent/20 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
          <Brain className="w-6 h-6" />
        </div>
        <div>
          <p className="font-semibold">What are you studying today?</p>
          <p className="text-xs text-muted-foreground">{selectedStudyTopic || 'Click to pick a topic and we\'ll personalize your session'}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-accent ml-auto" />
      </button>

      {/* Today's To-Do */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-accent" /> Today's Tasks
        </h3>
        <div className="space-y-3">
          {config.todoItems.map((item, i) => (
            <button key={i} onClick={() => toggleTodo(i)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left text-sm ${
                todoChecked[i] ? 'bg-accent/5 border-accent/30 line-through text-muted-foreground' : 'border-border hover:border-accent/50'
              }`}>
              {todoChecked[i] ? <Check className="w-4 h-4 text-accent flex-shrink-0" /> : <Square className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
              {item}
              <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">{todoChecked.filter(Boolean).length}/{config.todoItems.length} tasks completed today</p>
      </div>

      {/* Study Topic Popup */}
      {showStudyPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setShowStudyPopup(false)}>
          <div className="bg-card rounded-2xl p-8 shadow-2xl w-full max-w-md animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">What are you studying today?</h3>
              <button onClick={() => setShowStudyPopup(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {config.quizPopupOptions.map((opt) => (
                <button key={opt} onClick={() => handleStudySelect(opt)}
                  className="p-4 rounded-xl border border-border text-sm font-medium text-left transition-all hover:border-accent hover:bg-accent/5 hover:-translate-y-1 hover:shadow-md">
                  <Brain className="w-4 h-4 text-accent mb-2" />
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
