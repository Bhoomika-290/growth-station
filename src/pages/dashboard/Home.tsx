import { useState, useMemo } from 'react';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { TrendingUp, Flame, CheckCircle, Target, Zap, ChevronRight, Square, Check, X, Brain, Trophy, Medal, PieChart, Plus, Trash2, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function Home() {
  const { domain, user, rank, totalStudents, streak, tasksDone, weeklyGoalProgress, boostRank, completeTask, quizScores, addWeakPoint, removeWeakPoint, language } = useStationStore();
  const config = domainConfig[domain];
  const navigate = useNavigate();
  const isHi = language === 'hi';
  const [showOvertake, setShowOvertake] = useState(false);
  const [todoChecked, setTodoChecked] = useState<boolean[]>(Array(config.todoItems.length).fill(false));
  const [showStudyPopup, setShowStudyPopup] = useState(false);
  const [selectedStudyTopic, setSelectedStudyTopic] = useState('');
  const [weakInput, setWeakInput] = useState('');
  const [quickQuizIdx, setQuickQuizIdx] = useState(0);
  const [quickQuizAnswer, setQuickQuizAnswer] = useState<number | null>(null);
  const [quickQuizDone, setQuickQuizDone] = useState(false);
  const pct = Math.round(((totalStudents - rank) / totalStudents) * 100);

  const studentsToOvertake = useMemo(() => Math.floor(Math.random() * 40) + 20, []);

  // Quick quiz questions for home
  const quickQuestions = useMemo(() => {
    const qs = domain === 'engineering' ? [
      { q: 'What is the time complexity of binary search?', opts: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correct: 1 },
      { q: 'Which data structure uses FIFO?', opts: ['Stack', 'Queue', 'Tree', 'Graph'], correct: 1 },
      { q: 'What is 2^10?', opts: ['512', '1024', '2048', '256'], correct: 1 },
    ] : domain === 'commerce' ? [
      { q: 'If cost is ₹400, sell for ₹500, profit %?', opts: ['20%', '25%', '30%', '15%'], correct: 1 },
      { q: 'What is NPA in banking?', opts: ['New Profit Account', 'Non-Performing Asset', 'National Payment Authority', 'Net Payable Amount'], correct: 1 },
      { q: 'RTGS minimum transfer amount?', opts: ['₹1 lakh', '₹2 lakh', '₹50,000', 'No minimum'], correct: 1 },
    ] : [
      { q: 'How many schedules in Indian Constitution?', opts: ['8', '10', '12', '14'], correct: 2 },
      { q: 'Article 21 deals with?', opts: ['Right to Education', 'Right to Life', 'Right to Equality', 'Right to Speech'], correct: 1 },
      { q: 'Battle of Plassey year?', opts: ['1757', '1764', '1857', '1947'], correct: 0 },
    ];
    return qs;
  }, [domain]);

  // Job probability calculations
  const currentProbability = useMemo(() => {
    const base = 15;
    const quizBonus = (quizScores.iq + quizScores.eq + quizScores.rq) * 2;
    const taskBonus = tasksDone * 0.5;
    const focusBonus = Math.min(20, weeklyGoalProgress * 0.2);
    return Math.min(95, Math.round(base + quizBonus + taskBonus + focusBonus));
  }, [quizScores, tasksDone, weeklyGoalProgress]);

  const futureProbability = useMemo(() => {
    return Math.min(95, currentProbability + 25);
  }, [currentProbability]);

  const pieData = [
    { name: isHi ? 'वर्तमान संभावना' : 'Current Probability', value: currentProbability, color: 'hsl(var(--accent))' },
    { name: isHi ? 'शेष' : 'Remaining', value: 100 - currentProbability, color: 'hsl(var(--muted))' },
  ];

  const futurePieData = [
    { name: isHi ? 'अध्ययन के बाद' : 'After Study Plan', value: futureProbability, color: 'hsl(var(--accent))' },
    { name: isHi ? 'शेष' : 'Remaining', value: 100 - futureProbability, color: 'hsl(var(--muted))' },
  ];

  // Leaderboard — updates with rank
  const leaderboard = useMemo(() => {
    const names = domain === 'engineering'
      ? ['Aarav S.', 'Priya M.', 'Rohit K.', 'Sneha J.', 'Vikram T.', 'Ananya R.', 'Karan P.', 'Neha G.']
      : domain === 'commerce'
      ? ['Deepak M.', 'Anjali S.', 'Mohit R.', 'Kavita P.', 'Suresh T.', 'Pooja L.', 'Rajesh K.', 'Divya N.']
      : ['Meera S.', 'Arjun R.', 'Riya P.', 'Suresh K.', 'Kavita M.', 'Anil T.', 'Priti J.', 'Manish D.'];

    const baseScore = 950;
    const entries = names.map((name, i) => ({
      name,
      score: baseScore - i * 47,
      locality: user?.city || 'Your Area',
    }));

    const userScore = baseScore - Math.floor((rank / totalStudents) * entries.length) * 47 + tasksDone * 3;
    entries.push({
      name: user?.name || 'You',
      score: userScore,
      locality: user?.city || 'Your Area',
    });

    entries.sort((a, b) => b.score - a.score);
    return entries.slice(0, 8);
  }, [domain, rank, totalStudents, user, tasksDone]);

  const handleBoost = () => {
    setShowOvertake(true);
    boostRank(studentsToOvertake);
    setTimeout(() => setShowOvertake(false), 2000);
  };

  const toggleTodo = (i: number) => {
    const n = [...todoChecked];
    if (!n[i]) { n[i] = true; completeTask(); } else { n[i] = false; }
    setTodoChecked(n);
  };

  const handleStudySelect = (topic: string) => {
    setSelectedStudyTopic(topic);
    setShowStudyPopup(false);
    navigate('/dashboard/vault');
  };

  const handleQuickAnswer = (idx: number) => {
    setQuickQuizAnswer(idx);
    const q = quickQuestions[quickQuizIdx];
    if (idx !== q.correct) {
      // Wrong — add as weak point
      const topic = domain === 'engineering' ? 'DSA' : domain === 'commerce' ? 'Quantitative Aptitude' : 'Indian Polity';
      addWeakPoint(topic);
    }
    setTimeout(() => {
      if (quickQuizIdx < quickQuestions.length - 1) {
        setQuickQuizIdx(quickQuizIdx + 1);
        setQuickQuizAnswer(null);
      } else {
        setQuickQuizDone(true);
      }
    }, 1000);
  };

  const handleAddWeakPoint = () => {
    if (weakInput.trim()) {
      addWeakPoint(weakInput.trim());
      setWeakInput('');
    }
  };

  const dreamTarget = user?.dreamJob || user?.dreamCompany || config.companies[0];
  const companyInfo = (config.companyData as Record<string, any>)?.[user?.dreamCompany || config.companies[0]];

  return (
    <div className="max-w-5xl space-y-6 animate-fade-in">
      {/* Greeting + Affirmation */}
      <div>
        <h1 className="text-2xl font-bold">{isHi ? `वापसी पर स्वागत, ${user?.name || 'Student'}` : `Welcome back, ${user?.name || 'Student'}`}</h1>
        <p className="text-sm text-muted-foreground italic mt-1">{isHi ? config.affirmationHi : config.affirmation}</p>
      </div>

      {/* Job Probability — Before & After with Pie Charts */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-accent" />
          {isHi ? `${dreamTarget} पाने की संभावना` : `Probability of Getting ${dreamTarget}`}
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2">{isHi ? 'अभी' : 'Current'}</p>
            <ResponsiveContainer width="100%" height={150}>
              <RechartsPie>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" startAngle={90} endAngle={-270}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
            <p className="text-2xl font-bold text-accent">{currentProbability}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2">{isHi ? 'पूरी तैयारी के बाद' : 'After Completing Study Plan'}</p>
            <ResponsiveContainer width="100%" height={150}>
              <RechartsPie>
                <Pie data={futurePieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" startAngle={90} endAngle={-270}>
                  {futurePieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
            <p className="text-2xl font-bold text-accent">{futureProbability}%</p>
          </div>
        </div>
        {companyInfo && (
          <div className="mt-4 p-3 rounded-xl bg-muted/50 text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">{user?.dreamCompany || config.companies[0]} — {isHi ? 'भर्ती जानकारी' : 'Hiring Info'}</p>
            <p>{isHi ? 'सीटें' : 'Seats'}: {companyInfo.seats} · {isHi ? 'वेतन' : 'Salary'}: {companyInfo.avgSalary}</p>
            <p>{isHi ? 'शहर' : 'Cities'}: {companyInfo.cities?.join(', ')}</p>
            <p>{isHi ? 'प्रक्रिया' : 'Process'}: {companyInfo.process}</p>
          </div>
        )}
      </div>

      {/* Quick Quiz */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Brain className="w-4 h-4 text-accent" />
          {isHi ? 'त्वरित परीक्षा — कमजोर बिंदु पहचानें' : 'Quick Test — Find Your Weak Points'}
        </h3>
        {!quickQuizDone ? (
          <div className="space-y-3">
            <p className="text-sm font-medium">{quickQuizIdx + 1}. {quickQuestions[quickQuizIdx].q}</p>
            <div className="grid grid-cols-2 gap-2">
              {quickQuestions[quickQuizIdx].opts.map((opt, oi) => {
                let cls = 'border-border hover:border-accent/50';
                if (quickQuizAnswer !== null) {
                  if (oi === quickQuestions[quickQuizIdx].correct) cls = 'border-accent bg-accent/10 text-accent';
                  else if (oi === quickQuizAnswer) cls = 'border-destructive bg-destructive/10 text-destructive';
                }
                return (
                  <button key={oi} onClick={() => quickQuizAnswer === null && handleQuickAnswer(oi)}
                    className={`text-xs py-2.5 px-3 rounded-xl border transition-all text-left ${cls}`}>
                    {opt}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground">{quickQuizIdx + 1}/{quickQuestions.length}</p>
          </div>
        ) : (
          <div className="text-center py-4">
            <CheckCircle className="w-8 h-8 text-accent mx-auto mb-2" />
            <p className="text-sm font-medium">{isHi ? 'पूर्ण! कमजोर बिंदु नीचे देखें' : 'Done! Check weak points below'}</p>
            <button onClick={() => { setQuickQuizDone(false); setQuickQuizIdx(0); setQuickQuizAnswer(null); }}
              className="mt-2 text-xs text-accent hover:underline">{isHi ? 'फिर से' : 'Try Again'}</button>
          </div>
        )}
      </div>

      {/* Weak Points Manager */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-accent" />
          {isHi ? 'कमजोर बिंदु — अपनी योजना अनुकूलित करें' : 'Weak Points — Adapt Your Plan'}
        </h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {(user?.weakPoints || []).map(wp => (
            <span key={wp} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs">
              {wp}
              <button onClick={() => removeWeakPoint(wp)} className="hover:text-foreground"><Trash2 className="w-3 h-3" /></button>
            </span>
          ))}
          {(!user?.weakPoints || user.weakPoints.length === 0) && (
            <p className="text-xs text-muted-foreground">{isHi ? 'कोई कमजोर बिंदु नहीं — क्विज़ लें या मैन्युअल रूप से जोड़ें' : 'No weak points yet — take the quiz above or add manually'}</p>
          )}
        </div>
        <div className="flex gap-2">
          <input placeholder={isHi ? 'कमजोर विषय जोड़ें...' : 'Add a weak topic...'} value={weakInput} onChange={(e) => setWeakInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddWeakPoint()}
            className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
          <button onClick={handleAddWeakPoint} className="px-3 py-2 rounded-lg bg-accent text-accent-foreground text-sm"><Plus className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Rank Widget */}
      <div className="bg-card rounded-2xl border border-border p-6 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">{isHi ? 'आपकी स्थानीय रैंक' : 'Your Local Rank'}</p>
            <p className="text-3xl font-bold">Top {pct}%</p>
            <p className="text-xs text-muted-foreground mt-1">{isHi ? `रैंक #${rank} / ${totalStudents}` : `Rank #${rank} of ${totalStudents}`} {isHi ? 'में' : 'in'} {user?.city || 'your area'}</p>
          </div>
          <button onClick={handleBoost} className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover:scale-105 transition-transform flex items-center gap-1">
            <Zap className="w-4 h-4" /> {isHi ? 'रैंक बढ़ाएं' : 'Boost my rank'}
          </button>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
        </div>
        {showOvertake && (
          <div className="absolute inset-0 bg-accent/10 backdrop-blur-sm flex items-center justify-center animate-fade-in">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-accent mx-auto mb-2" />
              <p className="text-lg font-bold">{isHi ? `आपने ${studentsToOvertake} छात्रों को पीछे छोड़ा!` : `You overtook ${studentsToOvertake} students!`}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Flame, label: isHi ? 'स्ट्रीक' : 'Streak', value: `${streak} ${isHi ? 'दिन' : 'days'}` },
            { icon: CheckCircle, label: isHi ? 'टास्क पूर्ण' : 'Tasks Done', value: String(tasksDone) },
            { icon: Target, label: isHi ? 'साप्ताहिक लक्ष्य' : 'Weekly Goal', value: `${weeklyGoalProgress}%` },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-xl border border-border p-4 text-center">
              <s.icon className="w-5 h-5 mx-auto mb-1 text-accent" />
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

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
            <p className="font-semibold">{isHi ? 'साप्ताहिक प्रगति' : 'Weekly Progress'}</p>
            <p className="text-xs text-muted-foreground">{isHi ? `${100 - weeklyGoalProgress}% शेष है` : `${100 - weeklyGoalProgress}% away from target`}</p>
          </div>
        </div>
      </div>

      {/* Leaderboard — real-time */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Trophy className="w-4 h-4 text-accent" /> {isHi ? 'लीडरबोर्ड' : 'Leaderboard'} — {user?.city || 'Your Area'}</h3>
        <div className="space-y-2">
          {leaderboard.map((entry, i) => {
            const isUser = entry.name === (user?.name || 'You');
            return (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl text-sm transition-all ${isUser ? 'bg-accent/10 border border-accent/30' : 'bg-muted/30'}`}>
                <span className="w-6 text-center font-bold">
                  {i === 0 ? <Medal className="w-4 h-4 text-accent mx-auto" /> : i === 1 ? <Medal className="w-4 h-4 text-muted-foreground mx-auto" /> : `#${i + 1}`}
                </span>
                <span className="flex-1 font-medium">{entry.name} {isUser && <span className="text-accent text-xs">({isHi ? 'आप' : 'You'})</span>}</span>
                <span className="text-xs text-muted-foreground">{entry.score} pts</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Study topic */}
      <button onClick={() => setShowStudyPopup(true)}
        className="w-full bg-accent/5 border border-accent/20 rounded-2xl p-5 flex items-center gap-4 text-left hover:bg-accent/10 transition-all group">
        <div className="w-12 h-12 rounded-xl bg-accent/20 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
          <Brain className="w-6 h-6" />
        </div>
        <div>
          <p className="font-semibold">{isHi ? 'आज आप क्या पढ़ रहे हैं?' : 'What are you studying today?'}</p>
          <p className="text-xs text-muted-foreground">{selectedStudyTopic || (isHi ? 'टॉपिक चुनें' : 'Click to pick a topic')}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-accent ml-auto" />
      </button>

      {/* Today's To-Do */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-accent" /> {isHi ? 'आज के कार्य' : "Today's Tasks"}
        </h3>
        <div className="space-y-3">
          {config.todoItems.map((item, i) => (
            <button key={i} onClick={() => toggleTodo(i)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left text-sm ${
                todoChecked[i] ? 'bg-accent/5 border-accent/30 line-through text-muted-foreground' : 'border-border hover:border-accent/50'
              }`}>
              {todoChecked[i] ? <Check className="w-4 h-4 text-accent flex-shrink-0" /> : <Square className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
              {item}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">{todoChecked.filter(Boolean).length}/{config.todoItems.length} {isHi ? 'कार्य पूर्ण' : 'tasks completed'}</p>
      </div>

      {/* Study Topic Popup */}
      {showStudyPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setShowStudyPopup(false)}>
          <div className="bg-card rounded-2xl p-8 shadow-2xl w-full max-w-md animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">{isHi ? 'आज का विषय' : 'What are you studying today?'}</h3>
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
