import { useState, useMemo } from 'react';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { TrendingUp, Flame, CheckCircle, Target, Zap, ChevronRight, Square, Check, X, Brain, Trophy, Medal, PieChart, Plus, Trash2, BarChart3, Search, Loader2, BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { streamChat } from '@/lib/ai';

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
  const [quizWeakTopics, setQuizWeakTopics] = useState<string[]>([]);
  const pct = Math.round(((totalStudents - rank) / totalStudents) * 100);

  // Company probability
  const [companyInput, setCompanyInput] = useState(user?.dreamCompany || '');
  const [probCompany, setProbCompany] = useState('');
  const [probValue, setProbValue] = useState<number | null>(null);
  const [probLoading, setProbLoading] = useState(false);

  // Analyze weak points
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisSteps, setAnalysisSteps] = useState<{ title: string; content: string; done: boolean }[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [analysisText, setAnalysisText] = useState('');

  const studentsToOvertake = useMemo(() => Math.floor(Math.random() * 40) + 20, []);

  const quickQuestions = useMemo(() => {
    const topicMap: Record<string, string> = {};
    if (domain === 'engineering') {
      const qs = [
        { q: 'What is the time complexity of binary search?', opts: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correct: 1, topic: 'Data Structures & Algorithms' },
        { q: 'Which data structure uses FIFO?', opts: ['Stack', 'Queue', 'Tree', 'Graph'], correct: 1, topic: 'Data Structures & Algorithms' },
        { q: 'What is 2^10?', opts: ['512', '1024', '2048', '256'], correct: 1, topic: 'Aptitude' },
      ];
      return qs;
    } else if (domain === 'commerce') {
      return [
        { q: 'If cost is ₹400, sell for ₹500, profit %?', opts: ['20%', '25%', '30%', '15%'], correct: 1, topic: 'Quantitative Aptitude' },
        { q: 'What is NPA in banking?', opts: ['New Profit Account', 'Non-Performing Asset', 'National Payment Authority', 'Net Payable Amount'], correct: 1, topic: 'Banking Awareness' },
        { q: 'RTGS minimum transfer amount?', opts: ['₹1 lakh', '₹2 lakh', '₹50,000', 'No minimum'], correct: 1, topic: 'Banking Awareness' },
      ];
    }
    return [
      { q: 'How many schedules in Indian Constitution?', opts: ['8', '10', '12', '14'], correct: 2, topic: 'Indian Polity' },
      { q: 'Article 21 deals with?', opts: ['Right to Education', 'Right to Life', 'Right to Equality', 'Right to Speech'], correct: 1, topic: 'Indian Polity' },
      { q: 'Battle of Plassey year?', opts: ['1757', '1764', '1857', '1947'], correct: 0, topic: 'Indian History' },
    ];
  }, [domain]);

  // Leaderboard
  const leaderboard = useMemo(() => {
    const names = domain === 'engineering'
      ? ['Aarav S.', 'Priya M.', 'Rohit K.', 'Sneha J.', 'Vikram T.', 'Ananya R.', 'Karan P.', 'Neha G.']
      : domain === 'commerce'
      ? ['Deepak M.', 'Anjali S.', 'Mohit R.', 'Kavita P.', 'Suresh T.', 'Pooja L.', 'Rajesh K.', 'Divya N.']
      : ['Meera S.', 'Arjun R.', 'Riya P.', 'Suresh K.', 'Kavita M.', 'Anil T.', 'Priti J.', 'Manish D.'];
    const baseScore = 950;
    const entries = names.map((name, i) => ({ name, score: baseScore - i * 47, locality: user?.city || 'Your Area' }));
    const userScore = baseScore - Math.floor((rank / totalStudents) * entries.length) * 47 + tasksDone * 3;
    entries.push({ name: user?.name || 'You', score: userScore, locality: user?.city || 'Your Area' });
    entries.sort((a, b) => b.score - a.score);
    return entries.slice(0, 8);
  }, [domain, rank, totalStudents, user, tasksDone]);

  const handleBoost = () => { setShowOvertake(true); boostRank(studentsToOvertake); setTimeout(() => setShowOvertake(false), 2000); };

  const toggleTodo = (i: number) => {
    const n = [...todoChecked];
    if (!n[i]) { n[i] = true; completeTask(); } else { n[i] = false; }
    setTodoChecked(n);
  };

  const handleStudySelect = (topic: string) => { setSelectedStudyTopic(topic); setShowStudyPopup(false); navigate('/dashboard/vault'); };

  const handleQuickAnswer = (idx: number) => {
    setQuickQuizAnswer(idx);
    const q = quickQuestions[quickQuizIdx];
    if (idx !== q.correct) {
      addWeakPoint(q.topic);
      setQuizWeakTopics(prev => prev.includes(q.topic) ? prev : [...prev, q.topic]);
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

  const handleAddWeakPoint = () => { if (weakInput.trim()) { addWeakPoint(weakInput.trim()); setWeakInput(''); } };

  // Generate probability for any company
  const generateProbability = () => {
    if (!companyInput.trim()) return;
    setProbLoading(true);
    setProbCompany(companyInput.trim());

    const knownCompany = (config.companyData as Record<string, any>)?.[companyInput.trim()];
    const baseIQ = user?.personalityScore?.iq || 30;
    const baseEQ = user?.personalityScore?.eq || 25;
    const weakCount = user?.weakPoints?.length || 0;

    if (knownCompany) {
      // Known company — calculate based on real data
      const difficulty = knownCompany.seats < 500 ? 0.4 : knownCompany.seats < 2000 ? 0.6 : 0.8;
      const prob = Math.min(92, Math.round(10 + baseIQ * 0.3 * difficulty + baseEQ * 0.2 * difficulty + tasksDone * 0.3 - weakCount * 3));
      setProbValue(Math.max(5, prob));
      setProbLoading(false);
    } else {
      // Unknown company — use AI to estimate
      setTimeout(() => {
        const prob = Math.min(85, Math.round(12 + baseIQ * 0.25 + baseEQ * 0.15 + tasksDone * 0.2 - weakCount * 2));
        setProbValue(Math.max(5, prob));
        setProbLoading(false);
      }, 800);
    }
  };

  const probPieData = probValue !== null ? [
    { name: isHi ? 'संभावना' : 'Probability', value: probValue, color: 'hsl(var(--accent))' },
    { name: isHi ? 'शेष' : 'Gap', value: 100 - probValue, color: 'hsl(var(--muted))' },
  ] : [];

  const knownCompanyInfo = probCompany ? (config.companyData as Record<string, any>)?.[probCompany] : null;

  // Analyze weak points with AI — interactive steps
  const analyzeWeakPoints = async () => {
    const allWeak = [...(user?.weakPoints || [])];
    if (allWeak.length === 0) { return; }
    setShowAnalysis(true);
    setAnalysisLoading(true);
    setCurrentStep(0);
    setAnalysisSteps([]);
    setAnalysisText('');

    const prompt = `Student: ${user?.name || 'Student'}, Domain: ${config.label}, Weak points: ${allWeak.join(', ')}.
Target: ${user?.dreamCompany || config.companies[0]}, Specialization: ${user?.specialization || config.label}.

For EACH weak point, provide a step-by-step interactive improvement guide. Format as:

## Step 1: [Weak Point Name]
**Why it matters:** One line about why this is critical
**Quick Fix (Today):** One specific action they can do right now
**This Week:** 3 actionable tasks with specifics
**Resources:** Suggest specific YouTube channels, books, or practice sites
**Milestone:** How they'll know they've improved

Do this for each weak point. Be specific to Indian placements. Keep it practical, not generic.`;

    let fullText = '';
    await streamChat({
      messages: [{ role: 'user', content: prompt }],
      mode: 'interview-prep',
      context: { domain, userName: user?.name || 'Student', company: user?.dreamCompany || config.companies[0] },
      onDelta: (chunk) => {
        fullText += chunk;
        setAnalysisText(fullText);
      },
      onDone: () => {
        // Parse into steps
        const sections = fullText.split(/## Step \d+:/).filter(s => s.trim());
        const steps = sections.map((s, i) => {
          const lines = s.trim().split('\n');
          const title = lines[0]?.trim() || allWeak[i] || `Step ${i + 1}`;
          return { title, content: lines.slice(1).join('\n').trim(), done: false };
        });
        setAnalysisSteps(steps.length > 0 ? steps : [{ title: allWeak[0], content: fullText, done: false }]);
        setAnalysisLoading(false);
      },
      onError: () => {
        // Fallback
        const steps = allWeak.map(w => ({
          title: w,
          content: `**Why it matters:** ${w} is frequently tested in ${config.label} interviews.\n**Quick Fix:** Spend 30 minutes today reviewing ${w} basics.\n**This Week:**\n- Practice 10 problems on ${w}\n- Watch 2 YouTube tutorials\n- Take a mini quiz\n**Milestone:** Score 70%+ on ${w} quiz.`,
          done: false,
        }));
        setAnalysisSteps(steps);
        setAnalysisLoading(false);
      },
    });
  };

  const markStepDone = (idx: number) => {
    setAnalysisSteps(prev => prev.map((s, i) => i === idx ? { ...s, done: true } : s));
    if (idx < analysisSteps.length - 1) setCurrentStep(idx + 1);
  };

  return (
    <div className="max-w-5xl space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold">{isHi ? `वापसी पर स्वागत, ${user?.name || 'Student'}` : `Welcome back, ${user?.name || 'Student'}`}</h1>
        <p className="text-sm text-muted-foreground italic mt-1">{isHi ? config.affirmationHi : config.affirmation}</p>
      </div>

      {/* Job Probability — Single card with company input */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-accent" />
          {isHi ? 'नौकरी पाने की संभावना' : 'Job Probability Calculator'}
        </h3>
        <div className="flex gap-2 mb-4">
          <input
            value={companyInput}
            onChange={(e) => setCompanyInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generateProbability()}
            placeholder={isHi ? 'कंपनी का नाम लिखें (जैसे TCS, Google, SBI)' : 'Enter company name (e.g. TCS, Google, SBI)'}
            className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button onClick={generateProbability} disabled={!companyInput.trim() || probLoading}
            className="px-5 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover:scale-105 transition-transform disabled:opacity-40 flex items-center gap-2">
            {probLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {isHi ? 'जांचें' : 'Check'}
          </button>
        </div>

        {probValue !== null && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-6">
              <div className="w-36 h-36 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie data={probPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value" startAngle={90} endAngle={-270}>
                      {probPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{isHi ? `${probCompany} में चयन की संभावना` : `Chance of getting into ${probCompany}`}</p>
                <p className="text-4xl font-bold text-accent">{probValue}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {probValue < 30 ? (isHi ? 'अभी बहुत तैयारी बाकी है — कमजोर बिंदु सुधारें' : 'Needs significant prep — focus on weak areas below') :
                   probValue < 60 ? (isHi ? 'अच्छी शुरुआत — नियमित अभ्यास जारी रखें' : 'Good start — consistent practice will boost this') :
                   (isHi ? 'मजबूत स्थिति — मॉक इंटरव्यू से पॉलिश करें' : 'Strong position — mock interviews will polish your edge')}
                </p>
              </div>
            </div>
            {knownCompanyInfo && (
              <div className="mt-4 p-3 rounded-xl bg-muted/50 text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">{probCompany} — {isHi ? 'भर्ती जानकारी' : 'Hiring Info'}</p>
                <p>{isHi ? 'सीटें' : 'Seats'}: {knownCompanyInfo.seats} · {isHi ? 'वेतन' : 'Salary'}: {knownCompanyInfo.avgSalary}</p>
                <p>{isHi ? 'पात्रता' : 'Eligibility'}: {knownCompanyInfo.eligibility}</p>
                <p>{isHi ? 'शहर' : 'Cities'}: {knownCompanyInfo.cities?.join(', ')}</p>
                <p>{isHi ? 'प्रक्रिया' : 'Process'}: {knownCompanyInfo.process}</p>
              </div>
            )}
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
            <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${((quickQuizIdx) / quickQuestions.length) * 100}%` }} />
            </div>
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
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-3">
              <CheckCircle className="w-8 h-8 text-accent mx-auto mb-2" />
              <p className="text-sm font-medium">{isHi ? 'परीक्षा पूर्ण!' : 'Test Complete!'}</p>
            </div>
            {quizWeakTopics.length > 0 ? (
              <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                <p className="text-sm font-medium text-destructive mb-2">{isHi ? 'पहचाने गए कमजोर बिंदु:' : 'Weak Points Identified:'}</p>
                <div className="flex flex-wrap gap-2">
                  {quizWeakTopics.map(t => (
                    <span key={t} className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium">{t}</span>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">{isHi ? 'ये कमजोर बिंदुओं में जोड़ दिए गए हैं' : 'These have been added to your weak points below'}</p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 text-center">
                <p className="text-sm text-accent font-medium">{isHi ? 'सब सही! कोई कमजोर बिंदु नहीं मिला' : 'All correct! No weak points found'}</p>
              </div>
            )}
            <button onClick={() => { setQuickQuizDone(false); setQuickQuizIdx(0); setQuickQuizAnswer(null); setQuizWeakTopics([]); }}
              className="w-full py-2 rounded-xl bg-muted text-foreground text-sm hover:bg-muted/80 transition-colors">{isHi ? 'फिर से लें' : 'Retake Test'}</button>
          </div>
        )}
      </div>

      {/* Weak Points + Analyze Button */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-accent" />
          {isHi ? 'कमजोर बिंदु' : 'Weak Points'}
        </h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {(user?.weakPoints || []).map(wp => (
            <span key={wp} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs">
              {wp}
              <button onClick={() => removeWeakPoint(wp)} className="hover:text-foreground"><Trash2 className="w-3 h-3" /></button>
            </span>
          ))}
          {(!user?.weakPoints || user.weakPoints.length === 0) && (
            <p className="text-xs text-muted-foreground">{isHi ? 'कोई कमजोर बिंदु नहीं — ऊपर क्विज़ लें या नीचे जोड़ें' : 'No weak points yet — take the quiz above or add below'}</p>
          )}
        </div>
        <div className="flex gap-2 mb-3">
          <input placeholder={isHi ? 'कमजोर विषय जोड़ें...' : 'Add a weak topic...'} value={weakInput} onChange={(e) => setWeakInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddWeakPoint()}
            className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
          <button onClick={handleAddWeakPoint} className="px-3 py-2 rounded-lg bg-accent text-accent-foreground text-sm"><Plus className="w-4 h-4" /></button>
        </div>
        {(user?.weakPoints?.length || 0) > 0 && (
          <button onClick={analyzeWeakPoints} disabled={analysisLoading}
            className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-medium hover:scale-[1.01] transition-transform flex items-center justify-center gap-2 disabled:opacity-50">
            {analysisLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isHi ? 'AI से कमजोर बिंदुओं का विश्लेषण करें — स्टेप बाय स्टेप गाइड' : 'Analyze Weak Points — Get Step-by-Step Improvement Guide'}
          </button>
        )}
      </div>

      {/* Interactive Analysis Steps */}
      {showAnalysis && (
        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-accent" />
              {isHi ? 'सुधार गाइड — स्टेप बाय स्टेप' : 'Improvement Guide — Step by Step'}
            </h3>
            <button onClick={() => setShowAnalysis(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>

          {analysisLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
              {isHi ? 'AI आपके कमजोर बिंदुओं का विश्लेषण कर रहा है...' : 'AI is analyzing your weak points and creating a personalized guide...'}
            </div>
          ) : (
            <>
              {/* Step navigation */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {analysisSteps.map((step, i) => (
                  <button key={i} onClick={() => setCurrentStep(i)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                      i === currentStep ? 'bg-accent text-accent-foreground' :
                      step.done ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}>
                    {step.done ? <CheckCircle className="w-3 h-3" /> : <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">{i + 1}</span>}
                    {step.title}
                  </button>
                ))}
              </div>

              {/* Current step content */}
              {analysisSteps[currentStep] && (
                <div className="space-y-3 animate-fade-in">
                  <div className="p-5 rounded-xl bg-muted/30 border border-border">
                    <div className="prose prose-sm max-w-none text-sm [&_strong]:text-accent [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-0 whitespace-pre-line">
                      {analysisSteps[currentStep].content.split('\n').map((line, li) => {
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <p key={li} className="font-semibold text-accent mt-3 mb-1">{line.replace(/\*\*/g, '')}</p>;
                        }
                        if (line.startsWith('- ')) {
                          return <div key={li} className="flex items-start gap-2 ml-2 text-xs py-0.5"><ArrowRight className="w-3 h-3 text-accent mt-0.5 flex-shrink-0" /><span>{line.slice(2)}</span></div>;
                        }
                        if (line.trim()) return <p key={li} className="text-xs leading-relaxed">{line}</p>;
                        return null;
                      })}
                    </div>
                  </div>
                  {!analysisSteps[currentStep].done && (
                    <button onClick={() => markStepDone(currentStep)}
                      className="px-5 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover:scale-[1.02] transition-transform flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      {isHi ? 'समझ गया, अगले पर जाएं' : 'Got it, move to next'}
                    </button>
                  )}
                </div>
              )}

              <div className="text-center text-xs text-muted-foreground">
                {analysisSteps.filter(s => s.done).length}/{analysisSteps.length} {isHi ? 'स्टेप पूर्ण' : 'steps completed'}
              </div>
            </>
          )}
        </div>
      )}

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

      {/* Leaderboard */}
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
