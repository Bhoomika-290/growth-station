import { useState } from 'react';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { Mic, MapPin, Building, Target, MessageSquare, Presentation, ArrowRight, X, Send, CheckCircle, User, ChevronDown, ChevronUp } from 'lucide-react';

type Stage = 'overview' | 'job-target' | 'company-prep' | 'behavioral' | 'self-intro' | 'rapid-fire';

interface ChatMsg {
  role: 'bot' | 'user';
  text: string;
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
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);

  const companyData = config.companies.map((c, i) => ({
    name: c,
    match: 20 + i * 12,
    hiring: Math.floor(Math.random() * 50) + 10,
    skills: config.vaultTopics.slice(0, 3),
    salary: domain === 'engineering' ? `${5 + i * 2}-${8 + i * 2} LPA` : domain === 'commerce' ? `${4 + i}-${7 + i} LPA` : `Grade ${String.fromCharCode(65 + i)}`,
  }));

  const generateIntro = () => {
    const name = user?.name || 'Student';
    const company = selectedCompany || config.companies[0];
    const spec = user?.specialization || config.label;
    setIntroScript([
      `Good morning/afternoon, my name is ${name}.`,
      `I am a ${user?.year || 'final year'} student from ${user?.college || 'my college'}, specializing in ${spec}.`,
      `I have been actively preparing for roles in ${config.label} with a focus on ${config.vaultTopics[0]} and ${config.vaultTopics[1]}.`,
      `What excites me about ${company} is the opportunity to apply my skills in a real-world environment.`,
      `During my preparation, I have completed over 50 practice sessions and consistently improved my problem-solving abilities.`,
      `I believe my analytical thinking and dedication make me a strong fit for this role.`,
      `I am eager to contribute to ${company}'s mission and grow as a professional. Thank you.`,
    ]);
    setStage('self-intro');
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
      { role: 'bot', text: `Welcome to ${company} interview preparation! Let's start with Foundation level questions. I'll ask you one question at a time — type your answer and I'll evaluate it.` },
      { role: 'bot', text: companyQuestions.Foundation[0] },
    ]);
    setStage('company-prep');
  };

  const sendChatAnswer = () => {
    if (!chatInput.trim()) return;
    const newMsgs: ChatMsg[] = [...chatMessages, { role: 'user', text: chatInput }];
    setChatInput('');

    const qIdx = newMsgs.filter(m => m.role === 'user').length;
    const levelQs = companyQuestions[selectedLevel];

    // Evaluate
    const evaluations = [
      'Good structure! Try to be more specific with examples.',
      'Strong answer. The STAR method would make it even better.',
      'Decent response. Add quantifiable achievements for impact.',
      'Nice! Be more concise — aim for 60-90 seconds when speaking.',
      'Great content! Work on your confidence words — avoid "I think" and use "I believe".',
    ];

    newMsgs.push({ role: 'bot', text: evaluations[Math.min(qIdx - 1, evaluations.length - 1)] });

    if (qIdx < levelQs.length) {
      newMsgs.push({ role: 'bot', text: levelQs[qIdx] });
    } else {
      newMsgs.push({ role: 'bot', text: `Excellent! You've completed all ${selectedLevel} questions. Your readiness for this level: ${60 + qIdx * 5}%. Move to the next level to challenge yourself further!` });
    }

    setChatMessages(newMsgs);
  };

  const rfQuestions = rapidFireQuestions[domain] || rapidFireQuestions.engineering;

  // Overview
  if (stage === 'overview') {
    return (
      <div className="max-w-4xl space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">Interview Prep</h1>
          <p className="text-sm text-muted-foreground">{config.interviewText}</p>
        </div>

        {/* Stage 1 */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-accent" /> Stage 1 — Job Targeting</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-accent" /> Region: {user?.city || 'Your Area'}</div>
              <div className="flex items-center gap-2 text-sm"><Building className="w-4 h-4 text-accent" /> {companyData.length} companies hiring</div>
              <div className="text-xs text-muted-foreground mt-2">Current hire probability: <span className="text-accent font-bold">34%</span></div>
              <button onClick={() => setStage('job-target')} className="mt-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover-scale flex items-center gap-2">
                Explore Companies <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {companyData.slice(0, 3).map((c) => (
                <div key={c.name} className="flex items-center justify-between p-2 rounded-lg bg-muted text-sm cursor-pointer hover:bg-accent/10" onClick={() => startCompanyPrep(c.name)}>
                  <span>{c.name}</span>
                  <span className="text-xs text-accent">{c.match}% match</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stage 2 */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Building className="w-4 h-4 text-accent" /> Stage 2 — Company-Specific Prep</h3>
          <p className="text-sm text-muted-foreground mb-3">Click any company above to start an interactive prep session with 3 difficulty levels.</p>
          <div className="grid grid-cols-3 gap-3">
            {['Foundation', 'Competitive', 'Placement Ready'].map((level, i) => (
              <div key={level} className="p-4 rounded-xl border border-border text-center">
                <p className="text-sm font-medium">{level}</p>
                <p className="text-xs text-muted-foreground mt-1">Level {String.fromCharCode(65 + i)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stage 3 - Behavioral */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><User className="w-4 h-4 text-accent" /> Stage 3 — Behavioral Analysis</h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 rounded-xl bg-muted/50">
              <p className="font-medium">Your Readiness Score: <span className="text-accent">74%</span></p>
              <p className="text-xs text-muted-foreground mt-1">Improve communication skills to reach 85%</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-accent/5 border border-accent/20">
                <p className="font-medium text-xs">Formal Behavior</p>
                <p className="text-[10px] text-muted-foreground mt-1">Dress code, body language, handshake, eye contact, sitting posture</p>
              </div>
              <div className="p-3 rounded-xl bg-accent/5 border border-accent/20">
                <p className="font-medium text-xs">Communication</p>
                <p className="text-[10px] text-muted-foreground mt-1">Avoid filler words, use STAR method, be concise, ask questions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Interview Practice */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Mic className="w-4 h-4 text-accent" /> Interview Practice</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <button onClick={generateIntro} className="p-4 rounded-xl border border-border text-left hover:border-accent/50 transition-all group">
              <MessageSquare className="w-5 h-5 text-accent mb-2" />
              <p className="text-sm font-medium">Self Introduction</p>
              <p className="text-xs text-muted-foreground mt-1">AI-generated script, line by line</p>
            </button>
            <button onClick={startRapidFire} className="p-4 rounded-xl border border-border text-left hover:border-accent/50 transition-all group">
              <Mic className="w-5 h-5 text-accent mb-2" />
              <p className="text-sm font-medium">Rapid Fire</p>
              <p className="text-xs text-muted-foreground mt-1">Quick Q&A — type your answers fast</p>
            </button>
            <button onClick={() => setStage('behavioral')} className="p-4 rounded-xl border border-border text-left hover:border-accent/50 transition-all group">
              <Presentation className="w-5 h-5 text-accent mb-2" />
              <p className="text-sm font-medium">Speech Patterns</p>
              <p className="text-xs text-muted-foreground mt-1">Formal, elevator pitch, technical</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Job Targeting detail
  if (stage === 'job-target') {
    return (
      <div className="max-w-4xl space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <button onClick={() => setStage('overview')} className="text-muted-foreground hover:text-foreground text-sm">← Back</button>
          <h1 className="text-2xl font-bold">Job Targeting — {user?.city || 'Your Area'}</h1>
        </div>
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
                    <div className="flex gap-2">{c.skills.map(s => <span key={s} className="px-2 py-1 rounded-lg bg-accent/10 text-accent text-xs">{s}</span>)}</div>
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

  // Company Prep Chatbot
  if (stage === 'company-prep') {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <button onClick={() => setStage('overview')} className="text-muted-foreground hover:text-foreground text-sm">← Back</button>
            <h2 className="text-lg font-bold">{selectedCompany} — Interview Prep</h2>
          </div>
          <div className="flex gap-2">
            {['Foundation', 'Competitive', 'Placement Ready'].map(l => (
              <button key={l} onClick={() => {
                setSelectedLevel(l);
                setChatMessages([
                  { role: 'bot', text: `Switching to ${l} level. Let's go!` },
                  { role: 'bot', text: companyQuestions[l][0] },
                ]);
              }} className={`px-3 py-1 rounded-lg text-xs font-medium ${selectedLevel === l ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
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

  // Self Introduction
  if (stage === 'self-intro') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <button onClick={() => setStage('overview')} className="text-muted-foreground hover:text-foreground text-sm">← Back</button>
          <h2 className="text-lg font-bold">Self Introduction Script</h2>
        </div>
        <div className="bg-card rounded-2xl border border-border p-6">
          <p className="text-xs text-muted-foreground mb-4">Read each line aloud. Practice until it feels natural.</p>
          <div className="space-y-4">
            {introScript.map((line, i) => (
              <div key={i} className="flex gap-3 items-start animate-fade-in" style={{ animationDelay: `${i * 0.3}s` }}>
                <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-sm leading-relaxed">{line}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 text-sm">
          <p className="font-medium mb-2">Tips for delivery:</p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>- Maintain eye contact, speak clearly</li>
            <li>- Pause between sentences for emphasis</li>
            <li>- Keep it under 90 seconds</li>
            <li>- Smile naturally, show confidence</li>
            <li>- Practice in front of a mirror 5 times</li>
          </ul>
        </div>
        <button onClick={() => setStage('overview')} className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-medium hover-scale">
          Done Practicing
        </button>
      </div>
    );
  }

  // Rapid Fire
  if (stage === 'rapid-fire') {
    const allAnswered = rfAnswers.length >= rfQuestions.length;
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <button onClick={() => setStage('overview')} className="text-muted-foreground hover:text-foreground text-sm">← Back</button>
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
                placeholder="Type your answer quickly..."
                autoFocus
                className="flex-1 px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              <button onClick={submitRFAnswer} disabled={!rfInput.trim()} className="px-6 py-3 rounded-xl bg-accent text-accent-foreground font-medium hover-scale disabled:opacity-40">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h3 className="font-semibold text-center">Rapid Fire Complete!</h3>
            <p className="text-sm text-center text-muted-foreground">You answered {rfAnswers.length} questions. Review your answers below.</p>
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

  // Behavioral / Speech patterns
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <button onClick={() => setStage('overview')} className="text-muted-foreground hover:text-foreground text-sm">← Back</button>
        <h2 className="text-lg font-bold">Speech Patterns</h2>
      </div>
      {[
        { title: 'Formal Introduction', template: `Good morning. I am ${user?.name || 'your name'}, a ${user?.specialization || config.label} professional. I specialize in ${config.vaultTopics[0]} and ${config.vaultTopics[1]}, with a strong focus on practical application. Thank you for this opportunity.` },
        { title: 'Elevator Pitch (30s)', template: `In 30 seconds: I'm ${user?.name || 'your name'}, passionate about ${config.label}. I've spent the last ${user?.timeline || '6'} months mastering ${config.vaultTopics[0]}. My goal is to join ${user?.dreamCompany || config.companies[0]} and contribute to innovative solutions. I bring analytical skills, team spirit, and relentless curiosity.` },
        { title: 'Technical Introduction', template: `Hi, I'm ${user?.name || 'your name'}. My technical foundation includes ${config.vaultTopics.slice(0, 3).join(', ')}. I've completed multiple projects and practice sessions, scoring consistently in the top percentile on ${config.quizTypes[0]} assessments. I'm ready to apply these skills in a professional setting.` },
      ].map((pattern) => (
        <div key={pattern.title} className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-3">{pattern.title}</h3>
          <p className="text-sm leading-relaxed bg-muted/50 p-4 rounded-xl italic">{pattern.template}</p>
          <p className="text-xs text-muted-foreground mt-2">Practice reading this aloud 3-5 times until it feels natural.</p>
        </div>
      ))}
      <button onClick={() => setStage('overview')} className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-medium hover-scale">
        Back to Interview Prep
      </button>
    </div>
  );
}
