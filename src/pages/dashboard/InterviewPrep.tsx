import { useState, useRef, useEffect } from 'react';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { Mic, MapPin, Building, Target, MessageSquare, Presentation, ArrowRight, ArrowLeft, X, Send, CheckCircle, User, ChevronDown, ChevronUp, Shield, Brain, Heart, Eye, Sparkles, BookOpen, Video, ExternalLink, Loader2 } from 'lucide-react';
import { streamChat, type Msg } from '@/lib/ai';

type Stage = 'overview' | 'job-target' | 'company-prep' | 'behavioral' | 'self-intro-form' | 'self-intro-practice' | 'self-intro-feedback' | 'rapid-fire' | 'mindset';

interface ChatMsg {
  role: 'bot' | 'user';
  text: string;
}

interface IntroForm {
  name: string;
  role: string;
  targetCompany: string;
  experience: string;
  strengths: string;
  whyThisRole: string;
}

const companyQuestions: Record<string, string[]> = {
  Foundation: [
    'Tell me about yourself.',
    'Why do you want to work here?',
    'What are your strengths?',
    'Where do you see yourself in 5 years?',
    'Why should we hire you?',
  ],
  Competitive: [
    'Describe a challenging project you worked on.',
    'How do you handle conflict in a team?',
    'Walk me through your problem-solving process.',
    'What is your greatest professional achievement?',
    'How do you prioritize multiple deadlines?',
  ],
  'Placement Ready': [
    'Design a system that handles 1M requests/second.',
    'How would you optimize a slow database query?',
    'Explain a time you failed and what you learned.',
    'What makes you different from other candidates?',
    'Any questions for us? (And why it matters)',
  ],
};

const rapidFireQuestions: Record<string, string[]> = {
  engineering: [
    'What is polymorphism?', 'Explain REST vs GraphQL.', 'What is a deadlock?',
    'Difference between TCP and UDP?', 'What is normalization?', 'Explain MVC pattern.',
    'What is a hash table?', 'Explain ACID properties.',
  ],
  commerce: [
    'What is fiscal deficit?', 'Explain REPO rate.', 'What is NPA?',
    'Difference between SLR and CRR?', 'What is MUDRA loan?', 'Explain Basel III norms.',
    'What is priority sector lending?', 'Explain NEFT vs RTGS.',
  ],
  arts: [
    'What is Article 370?', 'Explain federalism.', 'What is judicial review?',
    'Difference between Fundamental Rights and DPSP?', 'What is CAG?', 'Explain PESA Act.',
    'What is NITI Aayog?', 'Explain Right to Information.',
  ],
};

export default function InterviewPrep() {
  const { domain, user } = useStationStore();
  const config = domainConfig[domain];
  const [stage, setStage] = useState<Stage>('overview');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('Foundation');
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [currentRFQ, setCurrentRFQ] = useState(0);
  const [rfAnswers, setRfAnswers] = useState<string[]>([]);
  const [rfInput, setRfInput] = useState('');
  const [introScript, setIntroScript] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [spokenLines, setSpokenLines] = useState<Set<number>>(new Set());
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);
  const [introForm, setIntroForm] = useState<IntroForm>({
    name: user?.name || '',
    role: user?.dreamCompany || '',
    targetCompany: config.companies[0],
    experience: '',
    strengths: '',
    whyThisRole: '',
  });

  const companyData = config.companies.map((c, i) => ({
    name: c,
    match: Math.min(95, 35 + i * 10 + (user?.personalityScore ? Math.round((user.personalityScore.iq + user.personalityScore.rq) / 3) : 0)),
    hiring: Math.floor(Math.random() * 50) + 10,
    skills: config.vaultTopics.slice(0, 3),
    salary: domain === 'engineering' ? `${5 + i * 2}-${8 + i * 2} LPA` : domain === 'commerce' ? `${4 + i}-${7 + i} LPA` : `Grade ${String.fromCharCode(65 + i)}`,
  }));

  // Self intro - generate from user's actual details
  const generateIntro = () => {
    const { name, role, targetCompany, experience, strengths, whyThisRole } = introForm;
    const spec = user?.specialization || config.label;
    const college = user?.college || 'my institution';
    const year = user?.year || 'current';

    const lines = [
      `Good morning/afternoon. My name is ${name || 'Student'}.`,
      `I am a ${year} student at ${college}, specializing in ${spec}.`,
    ];

    if (experience.trim()) {
      lines.push(`In terms of experience, ${experience}.`);
    } else {
      lines.push(`I have been actively building my skills in ${config.vaultTopics[0]} and ${config.vaultTopics[1]} through consistent practice and self-study.`);
    }

    if (strengths.trim()) {
      lines.push(`My key strengths include ${strengths}.`);
    } else {
      lines.push(`I consider analytical thinking and persistence to be my strongest qualities.`);
    }

    if (whyThisRole.trim()) {
      lines.push(`I am drawn to ${targetCompany || 'this organization'} because ${whyThisRole}.`);
    } else {
      lines.push(`What excites me about ${targetCompany || 'this opportunity'} is the chance to apply what I have learned in a real-world environment.`);
    }

    lines.push(`I am confident that my preparation and mindset make me a strong candidate for ${role || 'this role'}.`);
    lines.push(`Thank you for this opportunity. I look forward to contributing meaningfully.`);

    setIntroScript(lines);
    setCurrentLine(0);
    setSpokenLines(new Set());
    setStage('self-intro-practice');
  };

  const markLineSpoken = (lineIdx: number) => {
    const next = new Set(spokenLines);
    next.add(lineIdx);
    setSpokenLines(next);
    if (lineIdx < introScript.length - 1) {
      setCurrentLine(lineIdx + 1);
    }
    if (next.size === introScript.length) {
      setTimeout(() => setStage('self-intro-feedback'), 500);
    }
  };

  const startRapidFire = () => {
    setCurrentRFQ(0);
    setRfAnswers([]);
    setRfInput('');
    setStage('rapid-fire');
  };

  const submitRFAnswer = () => {
    if (!rfInput.trim()) return;
    setRfAnswers(prev => [...prev, rfInput]);
    setRfInput('');
    const questions = rapidFireQuestions[domain] || rapidFireQuestions.engineering;
    if (currentRFQ < questions.length - 1) {
      setCurrentRFQ(prev => prev + 1);
    }
  };

  const startCompanyPrep = (company: string) => {
    setSelectedCompany(company);
    setSelectedLevel('Foundation');
    setChatMessages([
      { role: 'bot', text: `Welcome to ${company} interview preparation, ${user?.name || 'Student'}! Let's start with Foundation level. I'll ask questions one at a time — type your best answer.` },
      { role: 'bot', text: companyQuestions.Foundation[0] },
    ]);
    setStage('company-prep');
  };

  const switchLevel = (level: string) => {
    setSelectedLevel(level);
    setChatMessages([
      { role: 'bot', text: `Switching to ${level} level for ${selectedCompany}. These questions are ${level === 'Foundation' ? 'fundamental — get the basics right' : level === 'Competitive' ? 'tougher — think deeper, use examples' : 'the real deal — companies ask these in final rounds'}. Let's go!` },
      { role: 'bot', text: companyQuestions[level][0] },
    ]);
  };

  const sendChatAnswer = () => {
    if (!chatInput.trim()) return;
    const newMsgs: ChatMsg[] = [...chatMessages, { role: 'user', text: chatInput }];
    setChatInput('');

    const userAnswerCount = newMsgs.filter(m => m.role === 'user').length;
    const levelQs = companyQuestions[selectedLevel];

    // More specific evaluations based on answer length and content
    const answer = chatInput.trim();
    let feedback = '';
    if (answer.length < 30) {
      feedback = 'Too brief. Expand with a specific example from your experience. Aim for 3-4 sentences minimum.';
    } else if (answer.length < 80) {
      feedback = 'Decent start. Try the STAR method: Situation, Task, Action, Result. This adds structure and makes your answer memorable.';
    } else if (!answer.includes('I ') && !answer.includes('my ')) {
      feedback = 'Good detail, but make it personal. Use "I did..." and "My approach was..." to show ownership.';
    } else if (answer.length > 200) {
      feedback = 'Strong content with good detail! For an interview, practice trimming this to 60-90 seconds. Conciseness shows clarity of thought.';
    } else {
      feedback = 'Well-structured answer with good length. Consider adding a quantifiable result — numbers make answers 2x more impactful.';
    }

    newMsgs.push({ role: 'bot', text: feedback });

    if (userAnswerCount < levelQs.length) {
      newMsgs.push({ role: 'bot', text: levelQs[userAnswerCount] });
    } else {
      const score = Math.min(95, 55 + userAnswerCount * 7 + Math.floor(answer.length / 20));
      newMsgs.push({ role: 'bot', text: `All ${selectedLevel} questions complete! Your readiness for ${selectedCompany} at this level: ${score}%. ${score >= 80 ? 'Strong performance — move to the next level!' : 'Review your weaker answers and try again, or move up to challenge yourself.'}` });
    }

    setChatMessages(newMsgs);
  };

  const rfQuestions = rapidFireQuestions[domain] || rapidFireQuestions.engineering;

  const BackButton = ({ to }: { to: Stage }) => (
    <button onClick={() => setStage(to)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
      <ArrowLeft className="w-4 h-4" /> Back
    </button>
  );

  // ===== OVERVIEW =====
  if (stage === 'overview') {
    const readinessScore = user?.personalityScore
      ? Math.round((user.personalityScore.iq * 0.4 + user.personalityScore.eq * 0.3 + user.personalityScore.rq * 0.3))
      : 34;

    return (
      <div className="max-w-4xl space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">Interview Prep</h1>
          <p className="text-sm text-muted-foreground">{config.interviewText}</p>
        </div>

        {/* Stage 1 - Job Targeting */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-accent" /> Stage 1 — Job Targeting</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-accent" /> Region: {user?.city || 'Your Area'}</div>
              <div className="flex items-center gap-2 text-sm"><Building className="w-4 h-4 text-accent" /> {companyData.length} companies hiring</div>
              <div className="text-xs text-muted-foreground mt-2">Current hire probability: <span className="text-accent font-bold">{readinessScore}%</span></div>
              <button onClick={() => setStage('job-target')} className="mt-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover-scale flex items-center gap-2">
                Explore Companies <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {companyData.slice(0, 3).map((c) => (
                <div key={c.name} className="flex items-center justify-between p-2 rounded-lg bg-muted text-sm cursor-pointer hover:bg-accent/10 transition-colors" onClick={() => startCompanyPrep(c.name)}>
                  <span>{c.name}</span>
                  <span className="text-xs text-accent">{c.match}% match</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stage 2 - Company Prep — clickable levels */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Building className="w-4 h-4 text-accent" /> Stage 2 — Company-Specific Prep</h3>
          <p className="text-sm text-muted-foreground mb-3">Pick a level and company to start an interactive prep session.</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { level: 'Foundation', desc: 'Basic questions every candidate must nail', icon: BookOpen },
              { level: 'Competitive', desc: 'Deeper questions that separate top 20%', icon: Brain },
              { level: 'Placement Ready', desc: 'Final-round questions companies always ask', icon: Shield },
            ].map((item) => (
              <button key={item.level} onClick={() => { setSelectedLevel(item.level); startCompanyPrep(user?.dreamCompany || config.companies[0]); }}
                className="p-4 rounded-xl border border-border text-left hover:border-accent/50 hover:bg-accent/5 transition-all group">
                <item.icon className="w-5 h-5 text-accent mb-2" />
                <p className="text-sm font-medium">{item.level}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Stage 3 - Behavioral Analysis — user-specific */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><User className="w-4 h-4 text-accent" /> Stage 3 — Behavioral Analysis</h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 rounded-xl bg-muted/50">
              <p className="font-medium">Your Readiness Score: <span className="text-accent">{readinessScore}%</span></p>
              <p className="text-xs text-muted-foreground mt-1">
                {readinessScore < 50 ? `Focus on ${config.vaultTopics[0]} and communication skills to cross 50%` :
                 readinessScore < 75 ? `Improve ${config.vaultTopics[1]} and practice mock interviews to reach 75%` :
                 `Strong position! Polish behavioral answers and body language to reach 90%+`}
              </p>
              <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
                <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${readinessScore}%` }} />
              </div>
            </div>
            <button onClick={() => setStage('behavioral')} className="w-full px-4 py-3 rounded-xl bg-accent/5 border border-accent/20 text-left hover:bg-accent/10 transition-all">
              <p className="font-medium text-xs flex items-center gap-2"><Eye className="w-4 h-4 text-accent" /> Formal Behavior & Communication Guide</p>
              <p className="text-[10px] text-muted-foreground mt-1">Dress code, body language, STAR method, confidence building — personalized for {user?.name || 'you'}</p>
            </button>
          </div>
        </div>

        {/* Mindset & Affirmations */}
        <button onClick={() => setStage('mindset')} className="w-full bg-accent/5 border border-accent/20 rounded-2xl p-5 flex items-center gap-4 text-left hover:bg-accent/10 transition-all">
          <div className="w-12 h-12 rounded-xl bg-accent/20 text-accent flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Interview Mindset & Confidence</p>
            <p className="text-xs text-muted-foreground">Affirmations, mental preparation, ethics, and how to win under pressure</p>
          </div>
          <ArrowRight className="w-5 h-5 text-accent" />
        </button>

        {/* Interview Practice */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Mic className="w-4 h-4 text-accent" /> Interview Practice</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <button onClick={() => setStage('self-intro-form')} className="p-4 rounded-xl border border-border text-left hover:border-accent/50 transition-all group">
              <MessageSquare className="w-5 h-5 text-accent mb-2" />
              <p className="text-sm font-medium">Self Introduction</p>
              <p className="text-xs text-muted-foreground mt-1">Enter your details, get a script, practice line by line</p>
            </button>
            <button onClick={startRapidFire} className="p-4 rounded-xl border border-border text-left hover:border-accent/50 transition-all group">
              <Mic className="w-5 h-5 text-accent mb-2" />
              <p className="text-sm font-medium">Rapid Fire</p>
              <p className="text-xs text-muted-foreground mt-1">Quick Q&A — type your answers fast</p>
            </button>
            <button onClick={() => setStage('behavioral')} className="p-4 rounded-xl border border-border text-left hover:border-accent/50 transition-all group">
              <Presentation className="w-5 h-5 text-accent mb-2" />
              <p className="text-sm font-medium">Speech Patterns</p>
              <p className="text-xs text-muted-foreground mt-1">Formal, elevator pitch, technical intro</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== MINDSET & AFFIRMATIONS =====
  if (stage === 'mindset') {
    const name = user?.name || 'Student';
    const targetRole = user?.dreamCompany || config.companies[0];
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <BackButton to="overview" />
        <h1 className="text-2xl font-bold">Interview Mindset & Confidence</h1>
        <p className="text-sm text-muted-foreground">Everything {name} needs to know before walking into that room.</p>

        {/* Affirmations */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Heart className="w-4 h-4 text-accent" /> Your Daily Affirmations</h3>
          <div className="space-y-3">
            {[
              `I am ${name}, and I have worked hard to be here. I deserve this opportunity.`,
              `My preparation for ${targetRole} has made me stronger than I was yesterday.`,
              `I do not need to be perfect. I need to be present, honest, and confident.`,
              `Every rejection is a redirect. Every interview is practice for the one that changes everything.`,
              `I am not competing against others. I am showing the best version of myself.`,
              `${config.affirmation.replace(/"/g, '')}`,
            ].map((aff, i) => (
              <div key={i} className="p-4 rounded-xl bg-accent/5 border border-accent/10 text-sm italic leading-relaxed">
                {aff}
              </div>
            ))}
          </div>
        </div>

        {/* Mental Preparation */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Brain className="w-4 h-4 text-accent" /> Mental Preparation Guide</h3>
          <div className="space-y-4">
            {[
              { title: 'Night Before the Interview', points: ['Lay out your clothes — formal, ironed, clean', 'Review your resume once — know every line', 'Sleep 7-8 hours — your brain needs it', 'No last-minute cramming — trust your preparation'] },
              { title: 'Morning of the Interview', points: ['Wake up 2 hours early — no rushing', 'Eat a light, healthy meal — avoid heavy food', 'Practice your introduction once in the mirror', 'Arrive 15 minutes early — never late, never too early'] },
              { title: 'During the Interview', points: ['Breathe slowly — 4 seconds in, 4 seconds out', 'Listen fully before answering — pause for 2 seconds', 'If you don\'t know something, say "I haven\'t worked with that yet, but here\'s how I would approach it"', 'Ask one thoughtful question at the end — it shows interest'] },
            ].map((section) => (
              <div key={section.title} className="p-4 rounded-xl bg-muted/50">
                <p className="font-medium text-sm mb-2">{section.title}</p>
                <ul className="space-y-1.5">
                  {section.points.map((p, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-accent mt-0.5 flex-shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Ethics & Integrity */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-accent" /> Ethics & Professional Integrity</h3>
          <div className="space-y-3 text-sm">
            {[
              { title: 'Be Honest', desc: 'Never exaggerate your skills or experience. Interviewers can spot dishonesty. Honesty about what you don\'t know shows maturity.' },
              { title: 'Respect the Process', desc: 'Don\'t badmouth previous employers, teachers, or competitors. Focus on what you bring, not what others lack.' },
              { title: 'Show Gratitude', desc: 'Thank the interviewer for their time. Send a brief thank-you message after. It\'s rare and memorable.' },
              { title: 'Accept Outcomes Gracefully', desc: 'If you don\'t get selected, ask for feedback. Every "no" teaches you something. Persistence wins in the long run.' },
            ].map((item) => (
              <div key={item.title} className="p-4 rounded-xl bg-muted/30 border border-border">
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How to Win Under Pressure */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent" /> How to Win Under Pressure</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { title: 'The Pause Technique', desc: 'When asked a tough question, say "That\'s a great question, let me think for a moment." It buys time and shows composure.' },
              { title: 'The Redirect', desc: 'If stuck, pivot: "I haven\'t encountered that specific scenario, but in a similar situation I did..." Then share a relevant experience.' },
              { title: 'Body Language Reset', desc: 'If you feel nervous, uncross your arms, plant both feet flat, and sit up straight. Your body tells your brain you\'re confident.' },
              { title: 'The Power of "I Will"', desc: 'Replace "I think I can" with "I will." Replace "I\'ll try" with "Here\'s my plan." Confident language changes perception.' },
            ].map((tip) => (
              <div key={tip.title} className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                <p className="font-medium text-sm">{tip.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ===== JOB TARGETING =====
  if (stage === 'job-target') {
    return (
      <div className="max-w-4xl space-y-6 animate-fade-in">
        <BackButton to="overview" />
        <h1 className="text-2xl font-bold">Job Targeting — {user?.city || 'Your Area'}</h1>
        <div className="space-y-3">
          {companyData.map((c) => (
            <div key={c.name} className="bg-card rounded-xl border border-border overflow-hidden">
              <button onClick={() => setExpandedCompany(expandedCompany === c.name ? null : c.name)} className="w-full flex items-center gap-4 p-4 text-left">
                <Building className="w-5 h-5 text-accent" />
                <div className="flex-1">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.hiring} positions · {c.salary}</p>
                </div>
                <span className="text-sm font-bold text-accent">{c.match}% match</span>
                {expandedCompany === c.name ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              {expandedCompany === c.name && (
                <div className="px-4 pb-4 border-t border-border pt-3 animate-fade-in space-y-3">
                  <div className="text-sm">
                    <p className="font-medium mb-1">Required Skills:</p>
                    <div className="flex gap-2 flex-wrap">{c.skills.map(s => <span key={s} className="px-2 py-1 rounded-lg bg-accent/10 text-accent text-xs">{s}</span>)}</div>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium mb-1">Hire Probability: <span className="text-accent">{c.match}%</span></p>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${c.match}%` }} />
                    </div>
                  </div>
                  <button onClick={() => startCompanyPrep(c.name)} className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover-scale">
                    Start Prep for {c.name}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ===== COMPANY PREP CHATBOT =====
  if (stage === 'company-prep') {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <BackButton to="overview" />
            <h2 className="text-lg font-bold">{selectedCompany} — Interview Prep</h2>
          </div>
          <div className="flex gap-2">
            {['Foundation', 'Competitive', 'Placement Ready'].map(l => (
              <button key={l} onClick={() => switchLevel(l)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${selectedLevel === l ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:bg-accent/10'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border h-[400px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-accent text-accent-foreground rounded-br-md' : 'bg-muted rounded-bl-md'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-border flex gap-2">
            <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendChatAnswer()}
              placeholder="Type your answer..."
              className="flex-1 px-4 py-2 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
            <button onClick={sendChatAnswer} disabled={!chatInput.trim()} className="px-4 py-2 rounded-xl bg-accent text-accent-foreground hover-scale disabled:opacity-40">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== SELF INTRO FORM =====
  if (stage === 'self-intro-form') {
    const inputClass = "w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent";
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <BackButton to="overview" />
        <h2 className="text-lg font-bold">Self Introduction — Your Details</h2>
        <p className="text-sm text-muted-foreground">Fill in your details and we'll create a personalized introduction script for you to practice line by line.</p>

        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Your Full Name</label>
            <input value={introForm.name} onChange={e => setIntroForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Rahul Sharma" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Target Role / Position</label>
            <input value={introForm.role} onChange={e => setIntroForm(p => ({ ...p, role: e.target.value }))} placeholder="e.g. Software Developer, Bank PO, IAS Officer" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Target Company / Organization</label>
            <input value={introForm.targetCompany} onChange={e => setIntroForm(p => ({ ...p, targetCompany: e.target.value }))} placeholder="e.g. TCS, SBI, UPSC" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Your Experience (brief)</label>
            <textarea value={introForm.experience} onChange={e => setIntroForm(p => ({ ...p, experience: e.target.value }))} placeholder="e.g. I interned at XYZ for 3 months working on web development" className={`${inputClass} resize-none`} rows={2} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Your Key Strengths</label>
            <input value={introForm.strengths} onChange={e => setIntroForm(p => ({ ...p, strengths: e.target.value }))} placeholder="e.g. problem-solving, teamwork, quick learner" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Why This Role / Company?</label>
            <textarea value={introForm.whyThisRole} onChange={e => setIntroForm(p => ({ ...p, whyThisRole: e.target.value }))} placeholder="e.g. I admire their work culture and want to grow in this domain" className={`${inputClass} resize-none`} rows={2} />
          </div>
          <button onClick={generateIntro} disabled={!introForm.name.trim()} className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-medium hover-scale disabled:opacity-40 flex items-center justify-center gap-2">
            <Mic className="w-4 h-4" /> Generate My Introduction Script
          </button>
        </div>
      </div>
    );
  }

  // ===== SELF INTRO PRACTICE (line by line) =====
  if (stage === 'self-intro-practice') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <BackButton to="self-intro-form" />
        <h2 className="text-lg font-bold">Practice Your Introduction</h2>
        <p className="text-sm text-muted-foreground">Read each line aloud. Click "I spoke this" after reading each line clearly. Go at your own pace.</p>

        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          {introScript.map((line, i) => {
            const isSpoken = spokenLines.has(i);
            const isCurrent = i === currentLine;
            return (
              <div key={i} className={`flex gap-3 items-start p-3 rounded-xl transition-all ${isCurrent ? 'bg-accent/10 border border-accent/30' : isSpoken ? 'opacity-50' : 'border border-transparent'}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${isSpoken ? 'bg-accent text-accent-foreground' : isCurrent ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'}`}>
                  {isSpoken ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </span>
                <div className="flex-1">
                  <p className={`text-sm leading-relaxed ${isCurrent ? 'font-medium' : ''}`}>{line}</p>
                  {isCurrent && !isSpoken && (
                    <button onClick={() => markLineSpoken(i)} className="mt-2 px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover-scale">
                      I spoke this line
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center text-xs text-muted-foreground">
          {spokenLines.size}/{introScript.length} lines completed
        </div>
      </div>
    );
  }

  // ===== SELF INTRO FEEDBACK =====
  if (stage === 'self-intro-feedback') {
    const name = introForm.name || user?.name || 'Student';
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <BackButton to="overview" />
        <h2 className="text-lg font-bold">Practice Complete — Improvement Tips</h2>
        <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6 text-center">
          <CheckCircle className="w-12 h-12 text-accent mx-auto mb-3" />
          <p className="text-lg font-bold">Great job, {name}!</p>
          <p className="text-sm text-muted-foreground mt-1">You completed all {introScript.length} lines of your introduction.</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4">What to Improve Next</h3>
          <div className="space-y-3">
            {[
              { area: 'Pace & Timing', tip: `Your introduction has ${introScript.length} lines. Aim to deliver the full thing in 60-90 seconds. Time yourself with the Focus Timer.` },
              { area: 'Confidence Words', tip: 'Replace "I think" with "I believe." Replace "maybe" with "I am working on." Confident language changes how interviewers perceive you.' },
              { area: 'Eye Contact', tip: 'Practice looking at a fixed point (or camera) while speaking. Don\'t read — glance at the line, then look up and speak.' },
              { area: 'Filler Words', tip: 'Notice if you say "um," "like," or "you know." Pause silently instead — it sounds more composed.' },
              { area: 'Closing Impact', tip: 'Your last line matters most. Make it confident and forward-looking. End with energy, not a trailing voice.' },
            ].map((item) => (
              <div key={item.area} className="p-3 rounded-xl bg-muted/50">
                <p className="font-medium text-sm">{item.area}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.tip}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => { setSpokenLines(new Set()); setCurrentLine(0); setStage('self-intro-practice'); }}
            className="flex-1 py-3 rounded-xl bg-muted text-foreground font-medium hover-scale">
            Practice Again
          </button>
          <button onClick={() => setStage('overview')} className="flex-1 py-3 rounded-xl bg-accent text-accent-foreground font-medium hover-scale">
            Back to Interview Prep
          </button>
        </div>
      </div>
    );
  }

  // ===== RAPID FIRE =====
  if (stage === 'rapid-fire') {
    const allAnswered = rfAnswers.length >= rfQuestions.length;
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <BackButton to="overview" />
          <h2 className="text-lg font-bold">Rapid Fire — {config.label}</h2>
          <span className="text-xs text-muted-foreground">{rfAnswers.length}/{rfQuestions.length}</span>
        </div>

        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${(rfAnswers.length / rfQuestions.length) * 100}%` }} />
        </div>

        {!allAnswered ? (
          <div className="bg-card rounded-2xl border border-border p-6">
            <p className="text-xl font-bold text-center mb-6">{rfQuestions[currentRFQ]}</p>
            <div className="flex gap-2">
              <input value={rfInput} onChange={(e) => setRfInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitRFAnswer()}
                placeholder="Type your answer quickly..." autoFocus
                className="flex-1 px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              <button onClick={submitRFAnswer} disabled={!rfInput.trim()} className="px-6 py-3 rounded-xl bg-accent text-accent-foreground font-medium hover-scale disabled:opacity-40">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h3 className="font-semibold text-center">Rapid Fire Complete!</h3>
            <p className="text-sm text-center text-muted-foreground">You answered {rfAnswers.length} questions. Review below.</p>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {rfQuestions.map((q, i) => (
                <div key={i} className="p-3 rounded-xl bg-muted/50 text-sm">
                  <p className="font-medium text-xs text-accent mb-1">Q: {q}</p>
                  <p className="text-xs">A: {rfAnswers[i] || 'Skipped'}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setStage('overview')} className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-medium hover-scale">
              Back to Interview Prep
            </button>
          </div>
        )}
      </div>
    );
  }

  // ===== BEHAVIORAL / SPEECH PATTERNS =====
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <BackButton to="overview" />
      <h2 className="text-lg font-bold">Speech Patterns & Behavioral Guide</h2>
      <p className="text-sm text-muted-foreground">Personalized scripts for {user?.name || 'you'} targeting {user?.dreamCompany || config.companies[0]}</p>

      {/* Behavioral Tips */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Eye className="w-4 h-4 text-accent" /> Body Language Essentials</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { title: 'Handshake', desc: 'Firm, 2-3 seconds. Not too tight, not limp.' },
            { title: 'Posture', desc: 'Sit upright, both feet flat. Lean slightly forward to show interest.' },
            { title: 'Eye Contact', desc: 'Look at the interviewer\'s forehead triangle. Natural, not staring.' },
            { title: 'Hands', desc: 'Rest on table or lap. No fidgeting, no crossing arms.' },
          ].map(tip => (
            <div key={tip.title} className="p-3 rounded-xl bg-muted/50 text-sm">
              <p className="font-medium text-xs">{tip.title}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Speech Templates */}
      {[
        { title: 'Formal Introduction', template: `Good morning. I am ${user?.name || 'your name'}, currently pursuing ${user?.specialization || config.label} at ${user?.college || 'my institution'}. I have been focusing on ${config.vaultTopics[0]} and ${config.vaultTopics[1]}, and I am targeting a role at ${user?.dreamCompany || config.companies[0]}. Thank you for this opportunity.` },
        { title: 'Elevator Pitch (30 seconds)', template: `I am ${user?.name || 'your name'}, a ${user?.year || 'current'} ${user?.specialization || config.label} student. Over the past ${user?.timeline || '6'} months, I have been preparing intensively in ${config.vaultTopics[0]}. My goal is to join ${user?.dreamCompany || config.companies[0]} where I can apply my analytical skills and contribute from day one. What sets me apart is my consistency — ${user?.name ? `${user.name} doesn't give up` : 'I do not give up'}.` },
        { title: 'Technical Introduction', template: `Hello, I am ${user?.name || 'your name'}. My technical foundation spans ${config.vaultTopics.slice(0, 3).join(', ')}. I have completed multiple practice assessments in ${config.quizTypes[0]} and ${config.quizTypes[1]}, consistently improving each week. I am ready to apply these skills in a professional setting at ${user?.dreamCompany || config.companies[0]}.` },
      ].map((pattern) => (
        <div key={pattern.title} className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-3">{pattern.title}</h3>
          <p className="text-sm leading-relaxed bg-muted/50 p-4 rounded-xl">{pattern.template}</p>
          <p className="text-xs text-muted-foreground mt-2">Practice reading aloud 3-5 times. Time yourself — aim for natural delivery.</p>
        </div>
      ))}
    </div>
  );
}
