import { useState, useEffect, useCallback } from 'react';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { Brain, Zap, Clock, Star, Shield, X, ArrowRight, CheckCircle, XCircle, Timer } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

const quizIcons = [Zap, Clock, Brain, Star, Shield];

// Domain-specific question banks
const questionBank: Record<string, { iq: Q[]; eq: Q[]; rq: Q[] }> = {
  engineering: {
    iq: [
      { q: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correct: 1 },
      { q: 'Which data structure uses FIFO?', options: ['Stack', 'Queue', 'Tree', 'Graph'], correct: 1 },
      { q: 'What is 2^10?', options: ['512', '1024', '2048', '256'], correct: 1 },
      { q: 'Which sorting algorithm has best average case?', options: ['Bubble Sort', 'Selection Sort', 'Merge Sort', 'Insertion Sort'], correct: 2 },
      { q: 'A binary tree with n nodes has how many edges?', options: ['n', 'n-1', 'n+1', '2n'], correct: 1 },
    ],
    eq: [
      { q: 'Your teammate pushes buggy code before a demo. You:', options: ['Fix it quietly', 'Call them out publicly', 'Report to manager', 'Discuss privately after'], correct: 3 },
      { q: 'You disagree with the tech lead\'s architecture. You:', options: ['Just follow orders', 'Present data-backed alternative', 'Complain to others', 'Refuse to implement'], correct: 1 },
      { q: 'A junior dev is struggling. You:', options: ['Let them figure it out', 'Pair program with them', 'Do their work', 'Tell the manager'], correct: 1 },
      { q: 'Deadline is tomorrow but code has bugs. You:', options: ['Ship anyway', 'Ask for extension with clear reasoning', 'Pull all-nighter alone', 'Blame QA'], correct: 1 },
      { q: 'You receive harsh code review feedback. You:', options: ['Get defensive', 'Ignore it', 'Learn from it and improve', 'Complain to HR'], correct: 2 },
    ],
    rq: [
      { q: 'What does REST stand for?', options: ['Remote Execution Service Tool', 'Representational State Transfer', 'Reliable Server Technology', 'Resource Extraction Standard'], correct: 1 },
      { q: 'Which protocol does HTTPS use for encryption?', options: ['SSH', 'TLS/SSL', 'FTP', 'SMTP'], correct: 1 },
      { q: 'What is Docker primarily used for?', options: ['Version control', 'Containerization', 'Testing', 'Deployment only'], correct: 1 },
      { q: 'SQL JOIN that returns all rows from both tables?', options: ['INNER JOIN', 'LEFT JOIN', 'FULL OUTER JOIN', 'CROSS JOIN'], correct: 2 },
      { q: 'What is CI/CD?', options: ['Code Integration/Code Delivery', 'Continuous Integration/Continuous Delivery', 'Central Intelligence/Central Data', 'Code Inspection/Code Debug'], correct: 1 },
    ],
  },
  commerce: {
    iq: [
      { q: 'If a product costs ₹400 and sells for ₹500, profit % is?', options: ['20%', '25%', '30%', '15%'], correct: 1 },
      { q: 'Simple Interest on ₹1000 at 10% for 2 years?', options: ['₹100', '₹200', '₹210', '₹150'], correct: 1 },
      { q: 'A train 200m long crosses a pole in 10s. Speed?', options: ['20 m/s', '72 km/h', 'Both A and B', '36 km/h'], correct: 2 },
      { q: 'Average of first 10 natural numbers?', options: ['5', '5.5', '6', '4.5'], correct: 1 },
      { q: 'If A:B = 2:3 and B:C = 4:5, then A:C = ?', options: ['8:15', '2:5', '4:5', '6:10'], correct: 0 },
    ],
    eq: [
      { q: 'A customer is angry about a service delay. You:', options: ['Argue with them', 'Listen empathetically and resolve', 'Ignore them', 'Pass to someone else'], correct: 1 },
      { q: 'You notice a colleague making accounting errors. You:', options: ['Report immediately to boss', 'Help them identify and fix', 'Ignore it', 'Tell other colleagues'], correct: 1 },
      { q: 'Your bank has a new policy you disagree with. You:', options: ['Refuse to follow', 'Follow and provide feedback through proper channel', 'Complain publicly', 'Quit'], correct: 1 },
      { q: 'A senior gives you credit for their work. You:', options: ['Accept it', 'Clarify the truth respectfully', 'Tell everyone', 'Stay silent'], correct: 1 },
      { q: 'You are overloaded with work before an exam. You:', options: ['Skip the exam', 'Prioritize and manage time', 'Do everything poorly', 'Blame your workload'], correct: 1 },
    ],
    rq: [
      { q: 'What is the full form of NABARD?', options: ['National Bank for Agriculture and Rural Development', 'National Board of Agricultural Research', 'National Bureau of Audit and Revenue', 'None of these'], correct: 0 },
      { q: 'Current SLR requirement by RBI is approximately?', options: ['4%', '18%', '23%', '10%'], correct: 1 },
      { q: 'What is KYC?', options: ['Keep Your Cash', 'Know Your Customer', 'Key Yield Certificate', 'Knowledge Yearly Check'], correct: 1 },
      { q: 'RTGS minimum transfer amount?', options: ['₹1 lakh', '₹2 lakh', '₹50,000', 'No minimum'], correct: 1 },
      { q: 'What is NPA in banking?', options: ['New Profit Account', 'Non-Performing Asset', 'National Payment Authority', 'Net Payable Amount'], correct: 1 },
    ],
  },
  arts: {
    iq: [
      { q: 'How many schedules are in the Indian Constitution?', options: ['8', '10', '12', '14'], correct: 2 },
      { q: 'The Tropic of Cancer passes through how many Indian states?', options: ['6', '7', '8', '9'], correct: 2 },
      { q: 'Who was the first President of India?', options: ['Jawaharlal Nehru', 'Rajendra Prasad', 'S. Radhakrishnan', 'Zakir Hussain'], correct: 1 },
      { q: 'Article 21 of the Constitution deals with?', options: ['Right to Education', 'Right to Life and Liberty', 'Right to Equality', 'Right to Freedom of Speech'], correct: 1 },
      { q: 'The Battle of Plassey was fought in which year?', options: ['1757', '1764', '1857', '1947'], correct: 0 },
    ],
    eq: [
      { q: 'As a district magistrate, a flood hits. First priority?', options: ['File report to HQ', 'Organize immediate rescue', 'Wait for orders', 'Call press conference'], correct: 1 },
      { q: 'A local politician pressures you to bend rules. You:', options: ['Comply to avoid conflict', 'Politely refuse citing rules', 'Report to media', 'Transfer the case'], correct: 1 },
      { q: 'Two communities are in conflict in your district. You:', options: ['Support the majority', 'Impose curfew immediately', 'Initiate dialogue between leaders', 'Wait for state orders'], correct: 2 },
      { q: 'A whistleblower reports corruption in your office. You:', options: ['Suppress it', 'Investigate independently', 'Transfer the whistleblower', 'Ignore it'], correct: 1 },
      { q: 'You discover your senior officer is corrupt. You:', options: ['Join them', 'Document evidence and report', 'Ignore it', 'Resign'], correct: 1 },
    ],
    rq: [
      { q: 'UPSC Prelims has how many papers?', options: ['1', '2', '3', '4'], correct: 1 },
      { q: 'Ethics paper in UPSC Mains is which paper?', options: ['GS Paper I', 'GS Paper II', 'GS Paper III', 'GS Paper IV'], correct: 3 },
      { q: 'Which amendment is called Mini Constitution?', options: ['42nd', '44th', '73rd', '86th'], correct: 0 },
      { q: 'Panchayati Raj was constitutionalized by which amendment?', options: ['42nd', '73rd', '74th', '86th'], correct: 1 },
      { q: 'What is the age limit for UPSC Civil Services (General)?', options: ['30', '32', '35', '28'], correct: 1 },
    ],
  },
};

interface Q {
  q: string;
  options: string[];
  correct: number;
}

type QuizPhase = 'select' | 'topic' | 'playing' | 'results';
type QuizSection = 'iq' | 'eq' | 'rq';

export default function Quizzes() {
  const { domain, boostRank } = useStationStore();
  const config = domainConfig[domain];
  const [phase, setPhase] = useState<QuizPhase>('select');
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [currentSection, setCurrentSection] = useState<QuizSection>('iq');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<QuizSection, number[]>>({ iq: [], eq: [], rq: [] });
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [scores, setScores] = useState({ iq: 0, eq: 0, rq: 0 });

  const questions = questionBank[domain] || questionBank.engineering;
  const sectionQuestions = questions[currentSection];
  const currentQuestion = sectionQuestions[currentQ];
  const sectionLabels: Record<QuizSection, string> = { iq: 'IQ — Analytical', eq: 'EQ — Situational', rq: 'RQ — Domain Knowledge' };
  const sections: QuizSection[] = ['iq', 'eq', 'rq'];

  // Timer
  useEffect(() => {
    if (phase !== 'playing' || showFeedback) return;
    if (timeLeft <= 0) {
      handleAnswer(-1);
      return;
    }
    const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase, showFeedback]);

  const startQuiz = (quizType: string) => {
    setSelectedQuiz(quizType);
    setPhase('topic');
  };

  const startPlaying = (topic: string) => {
    setSelectedTopic(topic);
    setPhase('playing');
    setCurrentSection('iq');
    setCurrentQ(0);
    setAnswers({ iq: [], eq: [], rq: [] });
    setScores({ iq: 0, eq: 0, rq: 0 });
    setTimeLeft(30);
    setSelectedAnswer(null);
    setShowFeedback(false);
  };

  const handleAnswer = useCallback((ansIdx: number) => {
    if (showFeedback) return;
    setSelectedAnswer(ansIdx);
    setShowFeedback(true);

    const isCorrect = ansIdx === currentQuestion.correct;
    if (isCorrect) {
      setScores(prev => ({ ...prev, [currentSection]: prev[currentSection] + 1 }));
    }

    setAnswers(prev => ({
      ...prev,
      [currentSection]: [...prev[currentSection], ansIdx],
    }));

    setTimeout(() => {
      if (currentQ < sectionQuestions.length - 1) {
        setCurrentQ(currentQ + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setTimeLeft(30);
      } else {
        const sIdx = sections.indexOf(currentSection);
        if (sIdx < 2) {
          setCurrentSection(sections[sIdx + 1]);
          setCurrentQ(0);
          setSelectedAnswer(null);
          setShowFeedback(false);
          setTimeLeft(30);
        } else {
          setPhase('results');
          boostRank(10);
        }
      }
    }, 1500);
  }, [showFeedback, currentQ, currentSection, currentQuestion, sectionQuestions.length, sections, boostRank]);

  const totalQuestions = sectionQuestions.length * 3;
  const totalCorrect = scores.iq + scores.eq + scores.rq;
  const gScore = Math.round((scores.iq / 5) * 100);
  const mScore = Math.round((scores.rq / 5) * 100);
  const aScore = Math.round((scores.eq / 5) * 100);

  const radarData = [
    { subject: 'Geometrical (IQ)', A: gScore },
    { subject: 'Memory (RQ)', A: mScore },
    { subject: 'Application (EQ)', A: aScore },
  ];

  // Select quiz type
  if (phase === 'select') {
    return (
      <div className="max-w-4xl space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">Quizzes</h1>
          <p className="text-sm text-muted-foreground">{config.label} — IQ + EQ + RQ assessment</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {config.quizTypes.map((qt, i) => {
            const Icon = quizIcons[i % quizIcons.length];
            return (
              <button key={qt} onClick={() => startQuiz(qt)}
                className="bg-card rounded-2xl border border-border p-6 text-left hover:border-accent/50 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-3 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{qt}</h3>
                <p className="text-xs text-muted-foreground">15 questions · 3 sections (IQ/EQ/RQ)</p>
              </button>
            );
          })}
        </div>
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-3">GMA Report Breakdown</h3>
          <p className="text-xs text-muted-foreground mb-4">Complete a quiz to see your personalized GMA scores</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { letter: 'G', label: 'Geometrical / Spatial', desc: 'IQ questions' },
              { letter: 'M', label: 'Memory / Analytical', desc: 'RQ questions' },
              { letter: 'A', label: 'Application / EQ', desc: 'EQ questions' },
            ].map((g) => (
              <div key={g.letter} className="space-y-2">
                <span className="text-2xl font-bold text-accent">{g.letter}</span>
                <p className="text-[10px] text-muted-foreground">{g.label}</p>
                <p className="text-[10px] text-muted-foreground">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Topic selection popup
  if (phase === 'topic') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setPhase('select')}>
        <div className="bg-card rounded-2xl p-8 shadow-2xl w-full max-w-md animate-fade-in" onClick={(e) => e.stopPropagation()}
          style={{ perspective: '1000px', transform: 'rotateX(2deg)' }}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">What are you studying today?</h3>
            <button onClick={() => setPhase('select')} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Quiz: {selectedQuiz}</p>
          <div className="grid grid-cols-2 gap-3">
            {config.quizPopupOptions.map((opt) => (
              <button key={opt} onClick={() => startPlaying(opt)}
                className="p-4 rounded-xl border border-border text-sm font-medium text-left transition-all hover:border-accent hover:bg-accent/5 hover:-translate-y-1 hover:shadow-md">
                <Brain className="w-4 h-4 text-accent mb-2" />
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Quiz playing
  if (phase === 'playing') {
    const overallProgress = (sections.indexOf(currentSection) * 5 + currentQ) / 15 * 100;
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{selectedQuiz} · {selectedTopic}</p>
            <h2 className="text-lg font-bold">{sectionLabels[currentSection]}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1 text-sm font-mono font-bold ${timeLeft <= 10 ? 'text-destructive' : 'text-accent'}`}>
              <Timer className="w-4 h-4" /> {timeLeft}s
            </div>
            <button onClick={() => setPhase('select')} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Question {sections.indexOf(currentSection) * 5 + currentQ + 1} of 15</span>
            <span>Section {sections.indexOf(currentSection) + 1}/3</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>

        {/* Question */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <p className="font-medium mb-6">{currentQuestion.q}</p>
          <div className="space-y-3">
            {currentQuestion.options.map((opt, oi) => {
              let cls = 'border-border hover:border-accent/50';
              if (showFeedback) {
                if (oi === currentQuestion.correct) cls = 'border-accent bg-accent/10 text-accent';
                else if (oi === selectedAnswer && oi !== currentQuestion.correct) cls = 'border-destructive bg-destructive/10 text-destructive';
              } else if (selectedAnswer === oi) {
                cls = 'border-accent bg-accent/5';
              }
              return (
                <button key={oi} onClick={() => !showFeedback && handleAnswer(oi)}
                  disabled={showFeedback}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border text-sm text-left transition-all ${cls}`}>
                  <span className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {String.fromCharCode(65 + oi)}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {showFeedback && oi === currentQuestion.correct && <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />}
                  {showFeedback && oi === selectedAnswer && oi !== currentQuestion.correct && <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Score tracker */}
        <div className="flex gap-3">
          {sections.map((s) => (
            <div key={s} className={`flex-1 p-3 rounded-xl text-center text-xs ${s === currentSection ? 'bg-accent/10 border border-accent/30' : 'bg-muted'}`}>
              <p className="font-bold">{s.toUpperCase()}</p>
              <p className="text-muted-foreground">{scores[s]}/{s === currentSection ? currentQ + (showFeedback ? 1 : 0) : (sections.indexOf(s) < sections.indexOf(currentSection) ? 5 : 0)}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Results
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Quiz Complete!</h1>
        <p className="text-muted-foreground">{selectedQuiz} · {selectedTopic}</p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 text-center">
        <p className="text-4xl font-bold text-accent mb-2">{totalCorrect}/15</p>
        <p className="text-sm text-muted-foreground">Overall Score: {Math.round((totalCorrect / 15) * 100)}%</p>
        <p className="text-xs text-accent mt-2">Rank boosted by 10 positions!</p>
      </div>

      {/* GMA Radar */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold mb-4 text-center">GMA Report</h3>
        <ResponsiveContainer width="100%" height={250}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
            <Radar name="Score" dataKey="A" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.3} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed scores */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { letter: 'G', label: 'Geometrical / IQ', score: gScore },
          { letter: 'M', label: 'Memory / RQ', score: mScore },
          { letter: 'A', label: 'Application / EQ', score: aScore },
        ].map((g) => (
          <div key={g.letter} className="bg-card rounded-xl border border-border p-4 text-center">
            <span className="text-2xl font-bold text-accent">{g.letter}</span>
            <div className="h-2 bg-muted rounded-full overflow-hidden my-2">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${g.score}%` }} />
            </div>
            <p className="text-sm font-bold">{g.score}%</p>
            <p className="text-[10px] text-muted-foreground">{g.label}</p>
          </div>
        ))}
      </div>

      {/* Weak zone */}
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
        <p className="text-sm font-medium mb-2">
          Weak zone: {gScore <= mScore && gScore <= aScore ? 'Analytical Thinking (IQ)' : mScore <= aScore ? 'Domain Knowledge (RQ)' : 'Situational Judgment (EQ)'}
        </p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>1. Practice more {gScore <= mScore && gScore <= aScore ? 'logical reasoning' : mScore <= aScore ? config.vaultTopics[0] : 'case studies'} daily</li>
          <li>2. Review incorrect answers and understand why</li>
          <li>3. Take focused mini-quizzes on weak areas</li>
        </ul>
      </div>

      <button onClick={() => setPhase('select')} className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-medium hover-scale flex items-center justify-center gap-2">
        <ArrowRight className="w-4 h-4" /> Take Another Quiz
      </button>
    </div>
  );
}
