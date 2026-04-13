import { useState } from 'react';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { TrendingUp, Flame, CheckCircle, Target, Zap, ChevronRight, Square, Check } from 'lucide-react';

export default function Home() {
  const { domain, user, rank, totalStudents, streak, tasksDone, weeklyGoalProgress, boostRank, completeTask } = useStationStore();
  const config = domainConfig[domain];
  const [showOvertake, setShowOvertake] = useState(false);
  const [todoChecked, setTodoChecked] = useState<boolean[]>(Array(config.todoItems.length).fill(false));
  const pct = Math.round(((totalStudents - rank) / totalStudents) * 100);

  const handleBoost = () => {
    setShowOvertake(true);
    boostRank(47);
    setTimeout(() => setShowOvertake(false), 2000);
  };

  const toggleTodo = (i: number) => {
    const n = [...todoChecked];
    n[i] = !n[i];
    setTodoChecked(n);
    if (!todoChecked[i]) completeTask();
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
          <button onClick={handleBoost} className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover-scale flex items-center gap-1">
            <Zap className="w-4 h-4" /> Boost my rank
          </button>
        </div>
        {/* Progress bar */}
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">Complete 2 more tasks to overtake 47 students</p>

        {showOvertake && (
          <div className="absolute inset-0 bg-accent/10 backdrop-blur-sm flex items-center justify-center animate-fade-in">
            <div className="text-center animate-overtake">
              <TrendingUp className="w-12 h-12 text-accent mx-auto mb-2" />
              <p className="text-lg font-bold">You overtook 47 students!</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Flame, label: 'Streak', value: `${streak} days`, color: 'text-accent' },
            { icon: CheckCircle, label: 'Tasks Done', value: String(tasksDone), color: 'text-accent' },
            { icon: Target, label: 'Weekly Goal', value: `${weeklyGoalProgress}%`, color: 'text-accent' },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-xl border border-border p-4 text-center">
              <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
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
      </div>
    </div>
  );
}
