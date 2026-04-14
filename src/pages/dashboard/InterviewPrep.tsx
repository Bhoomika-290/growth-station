import { useState, useRef, useEffect } from 'react';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { Mic, MapPin, Building, Target, MessageSquare, Presentation, ArrowRight, ArrowLeft, X, Send, CheckCircle, User, ChevronDown, ChevronUp, Shield, Brain, Heart, Eye, Sparkles, BookOpen, Video, ExternalLink, Loader2, Users } from 'lucide-react';
import { streamChat, type Msg } from '@/lib/ai';
import ReactMarkdown from 'react-markdown';

type Stage = 'overview' | 'job-target' | 'company-prep' | 'behavioral' | 'self-intro-form' | 'self-intro-practice' | 'self-intro-feedback' | 'rapid-fire' | 'mindset';

interface IntroForm {
  name: string;
  role: string;
  targetCompany: string;
  experience: string;
  strengths: string;
  whyThisRole: string;
}

export default function InterviewPrep() {
  const { domain, user, language } = useStationStore();
  const config = domainConfig[domain];
  const isHi = language === 'hi';
  const [stage, setStage] = useState<Stage>('overview');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('Foundation');
  const [aiMessages, setAiMessages] = useState<Msg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentRFQ, setCurrentRFQ] = useState(0);
  const [rfAnswers, setRfAnswers] = useState<string[]>([]);
  const [rfInput, setRfInput] = useState('');
  const [introScript, setIntroScript] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [spokenLines, setSpokenLines] = useState<Set<number>>(new Set());
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);
  const [introForm, setIntroForm] = useState<IntroForm>({
    name: user?.name || '',
    role: user?.dreamJob || user?.dreamCompany || '',
    targetCompany: user?.dreamCompany || config.companies[0],
    experience: '',
    strengths: '',
    whyThisRole: '',
  });
  const [introGenerating, setIntroGenerating] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  const companyData = config.companies.map((c) => {
    const info = (config.companyData as Record<string, any>)?.[c];
    return {
      name: c,
      match: info ? Math.min(95, 35 + Math.round((user?.personalityScore?.iq || 30) / 2)) : 50,
      seats: info?.seats || 'N/A',
      salary: info?.avgSalary || 'N/A',
      skills: config.vaultTopics.slice(0, 3),
      eligibility: info?.eligibility || 'Graduate',
      process: info?.process || 'Online → Interview',
      cities: info?.cities || [],
    };
  });

  const rapidFireQuestions: Record<string, string[]> = {
    engineering: ['What is polymorphism?', 'Explain REST vs GraphQL.', 'What is a deadlock?', 'Difference between TCP and UDP?', 'What is normalization?', 'Explain MVC pattern.'],
    commerce: ['What is fiscal deficit?', 'Explain REPO rate.', 'What is NPA?', 'Difference between SLR and CRR?', 'What is MUDRA loan?', 'Explain Basel III norms.'],
    arts: ['What is Article 370?', 'Explain federalism.', 'What is judicial review?', 'Difference between Fundamental Rights and DPSP?', 'What is CAG?', 'Explain PESA Act.'],
  };

  // ===== AI Company Prep =====
  const startCompanyPrep = (company: string, level?: string) => {
    setSelectedCompany(company);
    const lvl = level || 'Foundation';
    setSelectedLevel(lvl);
    setAiMessages([]);
    setIsStreaming(true);
    setStage('company-prep');

    const systemMsg: Msg[] = [];
    const userMsg: Msg = { role: 'user', content: `I want to start ${lvl} level interview preparation for ${company}. Please ask me the first question.` };

    let assistantText = '';
    streamChat({
      messages: [userMsg],
      mode: 'interview-prep',
      context: {
        domain: domain,
        userName: user?.name || 'Student',
        company: company,
        level: lvl,
        specialization: user?.specialization || '',
        college: user?.college || '',
      },
      onDelta: (chunk) => {
        assistantText += chunk;
        setAiMessages([userMsg, { role: 'assistant', content: assistantText }]);
      },
      onDone: () => {
        setAiMessages([userMsg, { role: 'assistant', content: assistantText }]);
        setIsStreaming(false);
      },
      onError: (err) => {
        setAiMessages([userMsg, { role: 'assistant', content: `Error: ${err}` }]);
        setIsStreaming(false);
      },
    });
  };

  const sendChatAnswer = () => {
    if (!chatInput.trim() || isStreaming) return;
    const userMsg: Msg = { role: 'user', content: chatInput };
    const newMessages = [...aiMessages, userMsg];
    setAiMessages(newMessages);
    setChatInput('');
    setIsStreaming(true);

    let assistantText = '';
    streamChat({
      messages: newMessages,
      mode: 'interview-prep',
      context: {
        domain,
        userName: user?.name || 'Student',
        company: selectedCompany,
        level: selectedLevel,
        specialization: user?.specialization || '',
        college: user?.college || '',
      },
      onDelta: (chunk) => {
        assistantText += chunk;
        setAiMessages([...newMessages, { role: 'assistant', content: assistantText }]);
      },
      onDone: () => {
        setAiMessages([...newMessages, { role: 'assistant', content: assistantText }]);
        setIsStreaming(false);
      },
      onError: (err) => {
        setAiMessages([...newMessages, { role: 'assistant', content: `Error: ${err}` }]);
        setIsStreaming(false);
      },
    });
  };

  const switchLevel = (level: string) => {
    setSelectedLevel(level);
    startCompanyPrep(selectedCompany, level);
  };

  // ===== AI Self Intro Generation =====
  const generateIntro = async () => {
    setIntroGenerating(true);
    const { name, role, targetCompany, experience, strengths, whyThisRole } = introForm;
    const prompt = `Generate a self-introduction script for:
Name: ${name || user?.name || 'Student'}
Role: ${role || 'Software Developer'}
Target Company: ${targetCompany || config.companies[0]}
Education: ${user?.specialization || config.label} from ${user?.college || 'my college'}, ${user?.year || 'current year'}
Experience: ${experience || 'Fresher with project experience'}
Strengths: ${strengths || 'analytical thinking, problem solving'}
Why this role: ${whyThisRole || 'passionate about the field'}

Return ONLY the script lines, one per line, 6-8 lines. Make it natural and confident.`;

    let fullText = '';
    await streamChat({
      messages: [{ role: 'user', content: prompt }],
      mode: 'self-intro-generate',
      context: { domain, userName: name || user?.name || 'Student' },
      onDelta: (chunk) => { fullText += chunk; },
      onDone: () => {
        const lines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 5);
        setIntroScript(lines.length > 0 ? lines : ['Good morning. My name is ' + (name || 'Student') + '.']);
        setCurrentLine(0);
        setSpokenLines(new Set());
        setIntroGenerating(false);
        setStage('self-intro-practice');
      },
      onError: () => {
        // Fallback to local generation
        const lines = [
          `Good morning. My name is ${name || 'Student'}.`,
          `I am a ${user?.year || 'current'} student at ${user?.college || 'my college'}, specializing in ${user?.specialization || config.label}.`,
          `${experience ? `In terms of experience, ${experience}.` : `I have been actively building my skills through projects and self-study.`}`,
          `${strengths ? `My key strengths include ${strengths}.` : `I consider analytical thinking and persistence to be my strongest qualities.`}`,
          `${whyThisRole ? `I am drawn to ${targetCompany} because ${whyThisRole}.` : `What excites me about ${targetCompany} is the growth opportunity.`}`,
          `I am confident that my preparation makes me a strong candidate for ${role || 'this role'}.`,
          `Thank you for this opportunity.`,
        ];
        setIntroScript(lines);
        setCurrentLine(0);
        setSpokenLines(new Set());
        setIntroGenerating(false);
        setStage('self-intro-practice');
      },
    });
  };

  const markLineSpoken = (lineIdx: number) => {
    const next = new Set(spokenLines);
    next.add(lineIdx);
    setSpokenLines(next);
    if (lineIdx < introScript.length - 1) {
      setCurrentLine(lineIdx + 1);
    }
    if (next.size === introScript.length) {
      setTimeout(() => getFeedback(), 500);
    }
  };

  // ===== AI Feedback on Intro =====
  const getFeedback = async () => {
    setStage('self-intro-feedback');
    setFeedbackLoading(true);
    setFeedbackText('');

    const prompt = `Here is the self-introduction script the student practiced line by line:\n\n${introScript.join('\n')}\n\nProvide specific feedback: overall rating out of 10, 2 things they did well, 3 specific improvements, and a rewritten improved version of any weak lines.`;

    await streamChat({
      messages: [{ role: 'user', content: prompt }],
      mode: 'self-intro-feedback',
      context: { domain, userName: user?.name || 'Student' },
      onDelta: (chunk) => {
        setFeedbackText(prev => prev + chunk);
      },
      onDone: () => setFeedbackLoading(false),
      onError: () => {
        setFeedbackText('**Rating: 7/10**\n\n**What you did well:**\n1. Clear structure with greeting and closing\n2. Covered all key areas\n\n**What to improve:**\n1. Add specific project examples\n2. Quantify achievements where possible\n3. Practice with more natural pauses between lines');
        setFeedbackLoading(false);
      },
    });
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

  const rfQuestions = rapidFireQuestions[domain] || rapidFireQuestions.engineering;

  const BackButton = ({ to }: { to: Stage }) => (
    <button onClick={() => setStage(to)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
      <ArrowLeft className="w-4 h-4" /> {isHi ? 'पीछे' : 'Back'}
    </button>
  );

  const readinessScore = user?.personalityScore
    ? Math.round((user.personalityScore.iq * 0.4 + user.personalityScore.eq * 0.3 + user.personalityScore.rq * 0.3))
    : 34;

  // ===== OVERVIEW =====
  if (stage === 'overview') {
    // Simulated applicant data based on company seats
    const applicantData = companyData.map(c => {
      const info = (config.companyData as Record<string, any>)?.[c.name];
      const seats = info?.seats || 500;
      const applicants = seats < 500 ? Math.round(seats * 120) : seats < 2000 ? Math.round(seats * 40) : Math.round(seats * 15);
      const myProbability = Math.min(95, Math.round((c.match / 100) * (seats / applicants) * 1000));
      return { ...c, applicants, myProbability };
    });

    return (
      <div className="max-w-4xl space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">{isHi ? 'इंटरव्यू तैयारी' : 'Interview Prep'}</h1>
          <p className="text-sm text-muted-foreground">{config.interviewText}</p>
        </div>

        {/* Applicants & Probability Overview */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-accent" /> {isHi ? 'प्रतिस्पर्धा विश्लेषण' : 'Competition Analysis'}</h3>
          <div className="space-y-3">
            {applicantData.map((c) => (
              <div key={c.name} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 border border-border hover:border-accent/30 transition-all cursor-pointer" onClick={() => startCompanyPrep(c.name)}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{c.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground">{c.salary}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" /> {c.applicants.toLocaleString()} {isHi ? 'आवेदक' : 'applicants'}
                    </span>
                    <span className="text-xs text-muted-foreground">{c.seats} {isHi ? 'सीटें' : 'seats'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-accent">{c.myProbability}%</p>
                  <p className="text-[10px] text-muted-foreground">{isHi ? 'आपकी संभावना' : 'Your probability'}</p>
                </div>
                <div className="w-16">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${c.myProbability}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stage 1 - Job Targeting */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-accent" /> {isHi ? 'चरण 1 — नौकरी लक्ष्य' : 'Stage 1 — Job Targeting'}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-accent" /> {isHi ? 'क्षेत्र' : 'Region'}: {user?.city || 'Your Area'}</div>
              <div className="flex items-center gap-2 text-sm"><Building className="w-4 h-4 text-accent" /> {companyData.length} {isHi ? 'कंपनियां भर्ती कर रही हैं' : 'companies hiring'}</div>
              <div className="text-xs text-muted-foreground mt-2">{isHi ? 'वर्तमान संभावना' : 'Current hire probability'}: <span className="text-accent font-bold">{readinessScore}%</span></div>
              <button onClick={() => setStage('job-target')} className="mt-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover-scale flex items-center gap-2">
                {isHi ? 'कंपनियां देखें' : 'Explore Companies'} <ArrowRight className="w-4 h-4" />
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

        {/* Stage 2 - Company Prep */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Building className="w-4 h-4 text-accent" /> {isHi ? 'चरण 2 — कंपनी-विशिष्ट तैयारी' : 'Stage 2 — Company-Specific Prep'}</h3>
          <p className="text-sm text-muted-foreground mb-3">{isHi ? 'स्तर और कंपनी चुनकर AI कोच से तैयारी करें' : 'Pick a level to start AI-powered interactive prep with your dream company.'}</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { level: 'Foundation', desc: isHi ? 'बेसिक प्रश्न' : 'Basic questions every candidate must nail', icon: BookOpen },
              { level: 'Competitive', desc: isHi ? 'गहरे प्रश्न' : 'Deeper questions that separate top 20%', icon: Brain },
              { level: 'Placement Ready', desc: isHi ? 'फाइनल राउंड' : 'Final-round questions companies actually ask', icon: Shield },
            ].map((item) => (
              <button key={item.level} onClick={() => startCompanyPrep(user?.dreamCompany || config.companies[0], item.level)}
                className="p-4 rounded-xl border border-border text-left hover:border-accent/50 hover:bg-accent/5 transition-all group">
                <item.icon className="w-5 h-5 text-accent mb-2" />
                <p className="text-sm font-medium">{item.level}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Stage 3 - Behavioral */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><User className="w-4 h-4 text-accent" /> {isHi ? 'चरण 3 — व्यवहार विश्लेषण' : 'Stage 3 — Behavioral Analysis'}</h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 rounded-xl bg-muted/50">
              <p className="font-medium">{isHi ? 'तैयारी स्कोर' : 'Readiness Score'}: <span className="text-accent">{readinessScore}%</span></p>
              <p className="text-xs text-muted-foreground mt-1">
                {readinessScore < 50 ? (isHi ? `${config.vaultTopics[0]} और कम्युनिकेशन पर फोकस करें` : `Focus on ${config.vaultTopics[0]} and communication skills`) :
                 readinessScore < 75 ? (isHi ? `मॉक इंटरव्यू का अभ्यास करें` : `Practice mock interviews to reach 75%`) :
                 (isHi ? 'बॉडी लैंग्वेज और व्यवहार उत्तर पॉलिश करें' : 'Polish behavioral answers and body language')}
              </p>
              <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
                <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${readinessScore}%` }} />
              </div>
            </div>
            <button onClick={() => setStage('behavioral')} className="w-full px-4 py-3 rounded-xl bg-accent/5 border border-accent/20 text-left hover:bg-accent/10 transition-all">
              <p className="font-medium text-xs flex items-center gap-2"><Eye className="w-4 h-4 text-accent" /> {isHi ? 'व्यवहार और संचार गाइड' : 'Formal Behavior & Communication Guide'}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{isHi ? 'ड्रेस कोड, बॉडी लैंग्वेज, STAR मेथड' : `Dress code, body language, STAR method — personalized for ${user?.name || 'you'}`}</p>
            </button>
          </div>
        </div>

        {/* Mindset */}
        <button onClick={() => setStage('mindset')} className="w-full bg-accent/5 border border-accent/20 rounded-2xl p-5 flex items-center gap-4 text-left hover:bg-accent/10 transition-all">
          <div className="w-12 h-12 rounded-xl bg-accent/20 text-accent flex items-center justify-center"><Heart className="w-6 h-6" /></div>
          <div className="flex-1">
            <p className="font-semibold">{isHi ? 'इंटरव्यू माइंडसेट और आत्मविश्वास' : 'Interview Mindset & Confidence'}</p>
            <p className="text-xs text-muted-foreground">{isHi ? 'प्रेरणा, मानसिक तैयारी, नैतिकता' : 'Affirmations, mental preparation, ethics, and winning under pressure'}</p>
          </div>
          <ArrowRight className="w-5 h-5 text-accent" />
        </button>

        {/* Interview Practice */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Mic className="w-4 h-4 text-accent" /> {isHi ? 'इंटरव्यू अभ्यास' : 'Interview Practice'}</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <button onClick={() => setStage('self-intro-form')} className="p-4 rounded-xl border border-border text-left hover:border-accent/50 transition-all group">
              <MessageSquare className="w-5 h-5 text-accent mb-2" />
              <p className="text-sm font-medium">{isHi ? 'सेल्फ इंट्रोडक्शन' : 'Self Introduction'}</p>
              <p className="text-xs text-muted-foreground mt-1">{isHi ? 'AI से स्क्रिप्ट बनवाएं, लाइन बाय लाइन अभ्यास करें' : 'AI generates your script, practice line by line'}</p>
            </button>
            <button onClick={startRapidFire} className="p-4 rounded-xl border border-border text-left hover:border-accent/50 transition-all group">
              <Mic className="w-5 h-5 text-accent mb-2" />
              <p className="text-sm font-medium">{isHi ? 'रैपिड फायर' : 'Rapid Fire'}</p>
              <p className="text-xs text-muted-foreground mt-1">{isHi ? 'तेज़ प्रश्न-उत्तर' : 'Quick Q&A — type your answers fast'}</p>
            </button>
            <button onClick={() => setStage('behavioral')} className="p-4 rounded-xl border border-border text-left hover:border-accent/50 transition-all group">
              <Presentation className="w-5 h-5 text-accent mb-2" />
              <p className="text-sm font-medium">{isHi ? 'भाषण पैटर्न' : 'Speech Patterns'}</p>
              <p className="text-xs text-muted-foreground mt-1">{isHi ? 'फॉर्मल, एलिवेटर पिच' : 'Formal, elevator pitch, technical intro'}</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== MINDSET =====
  if (stage === 'mindset') {
    const name = user?.name || 'Student';
    const targetRole = user?.dreamCompany || config.companies[0];
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <BackButton to="overview" />
        <h1 className="text-2xl font-bold">{isHi ? 'इंटरव्यू माइंडसेट और आत्मविश्वास' : 'Interview Mindset & Confidence'}</h1>
        <p className="text-sm text-muted-foreground">{isHi ? `${name}, इंटरव्यू रूम में जाने से पहले यह जानना ज़रूरी है` : `Everything ${name} needs to know before walking into that room.`}</p>

        {/* Motivational Video */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Video className="w-4 h-4 text-accent" /> {isHi ? 'प्रेरणादायक वीडियो' : 'Motivational Videos'}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl overflow-hidden aspect-video">
              <iframe src="https://www.youtube.com/embed/ZXsQAXx_ao0" className="w-full h-full" allowFullScreen title="Motivational" />
            </div>
            <div className="rounded-xl overflow-hidden aspect-video">
              <iframe src="https://www.youtube.com/embed/UNQhuFL6CWg" className="w-full h-full" allowFullScreen title="Interview Tips" />
            </div>
          </div>
        </div>

        {/* Affirmations */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Heart className="w-4 h-4 text-accent" /> {isHi ? 'दैनिक प्रतिज्ञा' : 'Your Daily Affirmations'}</h3>
          <div className="space-y-3">
            {[
              isHi ? `मैं ${name} हूँ, और मैंने यहाँ होने के लिए कड़ी मेहनत की है।` : `I am ${name}, and I have worked hard to be here. I deserve this opportunity.`,
              isHi ? `${targetRole} के लिए मेरी तैयारी ने मुझे पहले से मजबूत बनाया है।` : `My preparation for ${targetRole} has made me stronger than I was yesterday.`,
              isHi ? `मुझे परफेक्ट होने की ज़रूरत नहीं। मुझे उपस्थित, ईमानदार और आत्मविश्वासी होना है।` : `I do not need to be perfect. I need to be present, honest, and confident.`,
              isHi ? `हर अस्वीकृति एक पुनर्निर्देशन है।` : `Every rejection is a redirect. Every interview is practice for the one that changes everything.`,
              isHi ? config.affirmationHi.replace(/"/g, '') : config.affirmation.replace(/"/g, ''),
            ].map((aff, i) => (
              <div key={i} className="p-4 rounded-xl bg-accent/5 border border-accent/10 text-sm italic leading-relaxed flex items-start gap-3">
                <span className="text-accent text-lg">✨</span>
                <span>{aff}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mental Preparation Checklist */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Brain className="w-4 h-4 text-accent" /> {isHi ? 'मानसिक तैयारी गाइड' : 'Mental Preparation Guide'}</h3>
          <MentalPrepChecklist isHi={isHi} />
        </div>

        {/* Ethics */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-accent" /> {isHi ? 'नैतिकता और व्यावसायिक अखंडता' : 'Ethics & Professional Integrity'}</h3>
          <div className="space-y-3 text-sm">
            {[
              { title: isHi ? 'ईमानदार रहें' : 'Be Honest', desc: isHi ? 'अपने कौशल या अनुभव को कभी बढ़ा-चढ़ाकर न बताएं।' : 'Never exaggerate your skills. Honesty about what you don\'t know shows maturity.' },
              { title: isHi ? 'प्रक्रिया का सम्मान करें' : 'Respect the Process', desc: isHi ? 'पिछले नियोक्ता की बुराई न करें।' : 'Don\'t badmouth previous employers. Focus on what you bring.' },
              { title: isHi ? 'कृतज्ञता दिखाएं' : 'Show Gratitude', desc: isHi ? 'इंटरव्यूअर का समय के लिए धन्यवाद करें।' : 'Thank the interviewer. Send a brief thank-you message after.' },
              { title: isHi ? 'परिणाम स्वीकार करें' : 'Accept Outcomes Gracefully', desc: isHi ? 'चयन न होने पर फीडबैक मांगें।' : 'If not selected, ask for feedback. Persistence wins.' },
            ].map((item) => (
              <div key={item.title} className="p-4 rounded-xl bg-muted/30 border border-border">
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pressure Tips with Images */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent" /> {isHi ? 'दबाव में कैसे जीतें' : 'How to Win Under Pressure'}</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { title: isHi ? 'ठहरें' : 'The Pause Technique', desc: isHi ? '"बहुत अच्छा प्रश्न है, मुझे एक पल सोचने दीजिए"' : 'Say "Great question, let me think." It buys time and shows composure.', emoji: '⏸️' },
              { title: isHi ? 'रीडायरेक्ट' : 'The Redirect', desc: isHi ? 'यदि अटक जाएं, तो "मैंने यह विशिष्ट स्थिति नहीं देखी, लेकिन..."' : 'Pivot: "I haven\'t encountered that, but in a similar situation I..."', emoji: '🔄' },
              { title: isHi ? 'बॉडी लैंग्वेज' : 'Body Language Reset', desc: isHi ? 'बाहें खोलें, दोनों पैर सीधे, पीठ सीधी।' : 'Uncross arms, feet flat, sit up. Your body tells your brain you\'re confident.', emoji: '💪' },
              { title: isHi ? '"मैं करूँगा" की शक्ति' : 'Power of "I Will"', desc: isHi ? '"मैं सोचता हूँ" को "मैं करूँगा" से बदलें।' : 'Replace "I think I can" with "I will." Confident language changes perception.', emoji: '🚀' },
            ].map((tip) => (
              <div key={tip.title} className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                <p className="font-medium text-sm flex items-center gap-2"><span className="text-xl">{tip.emoji}</span> {tip.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Interview Day Video */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Video className="w-4 h-4 text-accent" /> {isHi ? 'इंटरव्यू टिप्स वीडियो' : 'Interview Day Tips'}</h3>
          <div className="rounded-xl overflow-hidden aspect-video">
            <iframe src="https://www.youtube.com/embed/HG68Ymazo18" className="w-full h-full" allowFullScreen title="Interview Day" />
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
        <h1 className="text-2xl font-bold">{isHi ? 'नौकरी लक्ष्य' : 'Job Targeting'} — {user?.city || 'Your Area'}</h1>
        <div className="space-y-3">
          {companyData.map((c) => (
            <div key={c.name} className="bg-card rounded-xl border border-border overflow-hidden">
              <button onClick={() => setExpandedCompany(expandedCompany === c.name ? null : c.name)} className="w-full flex items-center gap-4 p-4 text-left">
                <Building className="w-5 h-5 text-accent" />
                <div className="flex-1">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.seats} {isHi ? 'सीटें' : 'seats'} · {c.salary}</p>
                </div>
                <span className="text-sm font-bold text-accent">{c.match}% match</span>
                {expandedCompany === c.name ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              {expandedCompany === c.name && (
                <div className="px-4 pb-4 border-t border-border pt-3 animate-fade-in space-y-3">
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">{isHi ? 'पात्रता' : 'Eligibility'}:</span> {c.eligibility}</p>
                    <p><span className="font-medium">{isHi ? 'प्रक्रिया' : 'Process'}:</span> {c.process}</p>
                    {c.cities.length > 0 && <p><span className="font-medium">{isHi ? 'शहर' : 'Cities'}:</span> {c.cities.join(', ')}</p>}
                  </div>
                  <div className="flex gap-2 flex-wrap">{c.skills.map(s => <span key={s} className="px-2 py-1 rounded-lg bg-accent/10 text-accent text-xs">{s}</span>)}</div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${c.match}%` }} />
                  </div>
                  <button onClick={() => startCompanyPrep(c.name)} className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover-scale">
                    {isHi ? `${c.name} के लिए तैयारी शुरू करें` : `Start Prep for ${c.name}`}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ===== COMPANY PREP — AI CHATBOT =====
  if (stage === 'company-prep') {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <BackButton to="overview" />
            <h2 className="text-lg font-bold">{selectedCompany} — {isHi ? 'इंटरव्यू तैयारी' : 'Interview Prep'}</h2>
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

        <div className="bg-card rounded-2xl border border-border h-[450px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {aiMessages.filter(m => m.role !== 'user' || aiMessages.indexOf(m) > 0).map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-accent text-accent-foreground rounded-br-md' : 'bg-muted rounded-bl-md'}`}>
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none [&_p]:mb-1 [&_ul]:mt-1 [&_li]:text-sm">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : msg.content}
                </div>
              </div>
            ))}
            {isStreaming && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" /> {isHi ? 'AI सोच रहा है...' : 'AI is thinking...'}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="p-4 border-t border-border flex gap-2">
            <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendChatAnswer()}
              placeholder={isHi ? 'अपना उत्तर टाइप करें...' : 'Type your answer...'}
              disabled={isStreaming}
              className="flex-1 px-4 py-2 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50" />
            <button onClick={sendChatAnswer} disabled={!chatInput.trim() || isStreaming} className="px-4 py-2 rounded-xl bg-accent text-accent-foreground hover-scale disabled:opacity-40">
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
        <h2 className="text-lg font-bold">{isHi ? 'सेल्फ इंट्रोडक्शन — आपकी जानकारी' : 'Self Introduction — Your Details'}</h2>
        <p className="text-sm text-muted-foreground">{isHi ? 'AI आपकी जानकारी से एक पर्सनलाइज़्ड स्क्रिप्ट बनाएगा' : 'AI will create a personalized script from your details to practice line by line.'}</p>

        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">{isHi ? 'पूरा नाम' : 'Your Full Name'}</label>
            <input value={introForm.name} onChange={e => setIntroForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Rahul Sharma" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">{isHi ? 'लक्ष्य भूमिका' : 'Target Role / Position'}</label>
            <input value={introForm.role} onChange={e => setIntroForm(p => ({ ...p, role: e.target.value }))} placeholder="e.g. Software Developer, Bank PO" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">{isHi ? 'लक्ष्य कंपनी' : 'Target Company'}</label>
            <input value={introForm.targetCompany} onChange={e => setIntroForm(p => ({ ...p, targetCompany: e.target.value }))} placeholder="e.g. TCS, SBI, UPSC" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">{isHi ? 'अनुभव (संक्षेप)' : 'Your Experience (brief)'}</label>
            <textarea value={introForm.experience} onChange={e => setIntroForm(p => ({ ...p, experience: e.target.value }))} placeholder="e.g. Interned at XYZ for 3 months" className={`${inputClass} resize-none`} rows={2} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">{isHi ? 'आपकी ताकतें' : 'Key Strengths'}</label>
            <input value={introForm.strengths} onChange={e => setIntroForm(p => ({ ...p, strengths: e.target.value }))} placeholder="e.g. problem-solving, teamwork" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">{isHi ? 'यह भूमिका क्यों?' : 'Why This Role / Company?'}</label>
            <textarea value={introForm.whyThisRole} onChange={e => setIntroForm(p => ({ ...p, whyThisRole: e.target.value }))} placeholder="e.g. I admire their work culture" className={`${inputClass} resize-none`} rows={2} />
          </div>
          <button onClick={generateIntro} disabled={!introForm.name.trim() || introGenerating}
            className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-medium hover-scale disabled:opacity-40 flex items-center justify-center gap-2">
            {introGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> {isHi ? 'AI स्क्रिप्ट बना रहा है...' : 'AI generating script...'}</> :
              <><Mic className="w-4 h-4" /> {isHi ? 'AI से स्क्रिप्ट बनवाएं' : 'Generate Script with AI'}</>}
          </button>
        </div>
      </div>
    );
  }

  // ===== SELF INTRO PRACTICE =====
  if (stage === 'self-intro-practice') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <BackButton to="self-intro-form" />
        <h2 className="text-lg font-bold">{isHi ? 'अपना परिचय अभ्यास करें' : 'Practice Your Introduction'}</h2>
        <p className="text-sm text-muted-foreground">{isHi ? 'हर लाइन ज़ोर से पढ़ें। पढ़ने के बाद "मैंने बोला" दबाएं।' : 'Read each line aloud. Click "I spoke this" after reading clearly.'}</p>

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
                      {isHi ? 'मैंने यह लाइन बोली' : 'I spoke this line'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-center text-xs text-muted-foreground">{spokenLines.size}/{introScript.length} {isHi ? 'लाइन पूर्ण' : 'lines completed'}</div>
      </div>
    );
  }

  // ===== SELF INTRO FEEDBACK (AI) =====
  if (stage === 'self-intro-feedback') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <BackButton to="overview" />
        <h2 className="text-lg font-bold">{isHi ? 'अभ्यास पूर्ण — AI फीडबैक' : 'Practice Complete — AI Feedback'}</h2>
        <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6 text-center">
          <CheckCircle className="w-12 h-12 text-accent mx-auto mb-3" />
          <p className="text-lg font-bold">{isHi ? `शाबाश, ${introForm.name || user?.name}!` : `Great job, ${introForm.name || user?.name}!`}</p>
          <p className="text-sm text-muted-foreground mt-1">{isHi ? `आपने सभी ${introScript.length} लाइन पूर्ण कीं` : `You completed all ${introScript.length} lines.`}</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4">{isHi ? 'AI का फीडबैक' : 'AI Feedback'}</h3>
          {feedbackLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Loader2 className="w-4 h-4 animate-spin" /> {isHi ? 'AI विश्लेषण कर रहा है...' : 'AI analyzing your introduction...'}
            </div>
          )}
          <div className="prose prose-sm max-w-none text-sm">
            <ReactMarkdown>{feedbackText}</ReactMarkdown>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => { setSpokenLines(new Set()); setCurrentLine(0); setStage('self-intro-practice'); }}
            className="flex-1 py-3 rounded-xl bg-muted text-foreground font-medium hover-scale">
            {isHi ? 'फिर से अभ्यास करें' : 'Practice Again'}
          </button>
          <button onClick={() => setStage('overview')} className="flex-1 py-3 rounded-xl bg-accent text-accent-foreground font-medium hover-scale">
            {isHi ? 'वापस जाएं' : 'Back to Interview Prep'}
          </button>
        </div>
      </div>
    );
  }

  // ===== BEHAVIORAL =====
  if (stage === 'behavioral') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <BackButton to="overview" />
        <h1 className="text-2xl font-bold">{isHi ? 'व्यवहार और संचार गाइड' : 'Behavioral & Communication Guide'}</h1>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4">{isHi ? 'STAR विधि' : 'STAR Method'} — {user?.name || 'Student'}</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { letter: 'S', title: isHi ? 'स्थिति' : 'Situation', desc: isHi ? 'पृष्ठभूमि बताएं' : 'Set the scene with context' },
              { letter: 'T', title: isHi ? 'कार्य' : 'Task', desc: isHi ? 'क्या करना था' : 'What was your responsibility' },
              { letter: 'A', title: isHi ? 'कार्रवाई' : 'Action', desc: isHi ? 'आपने क्या किया' : 'What did you specifically do' },
              { letter: 'R', title: isHi ? 'परिणाम' : 'Result', desc: isHi ? 'क्या हासिल हुआ' : 'What was the measurable outcome' },
            ].map(s => (
              <div key={s.letter} className="p-4 rounded-xl bg-muted/50 flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm">{s.letter}</span>
                <div>
                  <p className="font-medium text-sm">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold mb-4">{isHi ? 'ड्रेस कोड' : 'Dress Code & Body Language'}</h3>
          <div className="space-y-3">
            {[
              { emoji: '👔', tip: isHi ? 'फॉर्मल कपड़े — इस्त्री किए हुए, साफ' : 'Formal attire — ironed, clean, fitting well' },
              { emoji: '👀', tip: isHi ? 'आँख में आँख डालकर बात करें' : 'Maintain steady eye contact — look at the bridge of their nose if nervous' },
              { emoji: '🤝', tip: isHi ? 'मज़बूत हैंडशेक — न बहुत कसा, न ढीला' : 'Firm handshake — not crushing, not limp' },
              { emoji: '🪑', tip: isHi ? 'सीधे बैठें, बाहें न बांधें' : 'Sit upright, don\'t cross arms — open posture shows confidence' },
              { emoji: '😊', tip: isHi ? 'शुरू और अंत में मुस्कुराएं' : 'Smile at the start and end — it\'s memorable' },
            ].map(item => (
              <div key={item.emoji} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 text-sm">
                <span className="text-xl">{item.emoji}</span>
                <span>{item.tip}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl overflow-hidden aspect-video">
          <iframe src="https://www.youtube.com/embed/S1jB5YOp5Oc" className="w-full h-full" allowFullScreen title="Body Language Tips" />
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
          <h2 className="text-lg font-bold">{isHi ? 'रैपिड फायर' : 'Rapid Fire'} — {config.label}</h2>
          <span className="text-xs text-muted-foreground">{rfAnswers.length}/{rfQuestions.length}</span>
        </div>

        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${(rfAnswers.length / rfQuestions.length) * 100}%` }} />
        </div>

        {!allAnswered ? (
          <div className="bg-card rounded-2xl border border-border p-6">
            <p className="text-xs text-accent mb-2">{isHi ? 'प्रश्न' : 'Question'} {currentRFQ + 1}</p>
            <p className="text-lg font-medium mb-4">{rfQuestions[currentRFQ]}</p>
            <div className="flex gap-2">
              <input value={rfInput} onChange={e => setRfInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitRFAnswer()}
                placeholder={isHi ? 'तेज़ उत्तर दें...' : 'Type your quick answer...'}
                className="flex-1 px-4 py-2 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              <button onClick={submitRFAnswer} disabled={!rfInput.trim()} className="px-4 py-2 rounded-xl bg-accent text-accent-foreground hover-scale disabled:opacity-40">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <div className="text-center">
              <CheckCircle className="w-10 h-10 text-accent mx-auto mb-2" />
              <p className="font-bold text-lg">{isHi ? 'पूर्ण!' : 'Complete!'}</p>
              <p className="text-sm text-muted-foreground">{rfAnswers.length}/{rfQuestions.length} {isHi ? 'उत्तर दिए' : 'answered'}</p>
            </div>
            <div className="space-y-2">
              {rfQuestions.map((q, i) => (
                <div key={i} className="p-3 rounded-xl bg-muted/30 text-sm">
                  <p className="font-medium text-xs text-accent">Q{i + 1}: {q}</p>
                  <p className="text-muted-foreground mt-1">{isHi ? 'आपका उत्तर' : 'Your answer'}: {rfAnswers[i] || '-'}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setStage('overview')} className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-medium hover-scale">
              {isHi ? 'वापस जाएं' : 'Back to Interview Prep'}
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
}

// Interactive checklist component
function MentalPrepChecklist({ isHi }: { isHi: boolean }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const toggle = (id: string) => {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id); else next.add(id);
    setChecked(next);
  };

  const sections = [
    { title: isHi ? 'इंटरव्यू से पहली रात' : 'Night Before', items: [
      { id: 'clothes', text: isHi ? 'कपड़े तैयार करें — फॉर्मल, इस्त्री किए' : 'Lay out clothes — formal, ironed, clean' },
      { id: 'resume', text: isHi ? 'रिज्यूमे एक बार रिव्यू करें' : 'Review resume once — know every line' },
      { id: 'sleep', text: isHi ? '7-8 घंटे सोएं' : 'Sleep 7-8 hours — your brain needs it' },
      { id: 'nocram', text: isHi ? 'आखिरी समय में न पढ़ें' : 'No last-minute cramming — trust your prep' },
    ]},
    { title: isHi ? 'इंटरव्यू की सुबह' : 'Morning Of', items: [
      { id: 'wake', text: isHi ? '2 घंटे पहले उठें' : 'Wake 2 hours early — no rushing' },
      { id: 'eat', text: isHi ? 'हल्का भोजन करें' : 'Eat light, healthy meal' },
      { id: 'mirror', text: isHi ? 'शीशे में अभ्यास करें' : 'Practice intro once in mirror' },
      { id: 'arrive', text: isHi ? '15 मिनट पहले पहुंचें' : 'Arrive 15 minutes early' },
    ]},
    { title: isHi ? 'इंटरव्यू के दौरान' : 'During Interview', items: [
      { id: 'breathe', text: isHi ? 'धीरे सांस लें — 4 सेकंड अंदर, 4 बाहर' : 'Breathe slowly — 4 sec in, 4 sec out' },
      { id: 'listen', text: isHi ? 'पूरा सुनें, फिर 2 सेकंड रुकें' : 'Listen fully, pause 2 seconds before answering' },
      { id: 'dunno', text: isHi ? '"मैंने यह नहीं किया, लेकिन मेरा तरीका होगा..."' : '"I haven\'t worked with that, but here\'s how I\'d approach it"' },
      { id: 'ask', text: isHi ? 'अंत में एक सोचा-समझा प्रश्न पूछें' : 'Ask one thoughtful question at the end' },
    ]},
  ];

  return (
    <div className="space-y-4">
      {sections.map(s => (
        <div key={s.title} className="p-4 rounded-xl bg-muted/50">
          <p className="font-medium text-sm mb-3">{s.title}</p>
          <div className="space-y-2">
            {s.items.map(item => (
              <button key={item.id} onClick={() => toggle(item.id)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left text-xs transition-all ${checked.has(item.id) ? 'bg-accent/10 text-accent line-through' : 'hover:bg-muted'}`}>
                <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${checked.has(item.id) ? 'bg-accent border-accent' : 'border-border'}`}>
                  {checked.has(item.id) && <CheckCircle className="w-3 h-3 text-accent-foreground" />}
                </div>
                {item.text}
              </button>
            ))}
          </div>
        </div>
      ))}
      <p className="text-xs text-muted-foreground text-center">{checked.size}/{sections.reduce((a, s) => a + s.items.length, 0)} {isHi ? 'पूर्ण' : 'completed'}</p>
    </div>
  );
}
