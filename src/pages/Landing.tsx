import { useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp, Users, Award, Cpu, Landmark, BookOpen, LogIn, Zap, Brain, Target } from 'lucide-react';
import { useStationStore, type Domain } from '@/store/useStationStore';

const tickerMessages = [
  'Raj (IAS) overtook 234 students in Mumbai',
  'Shyam (TCS) moved to Top 8% in Andheri',
  'Priya cleared SBI PO Prelims — Top 2% Delhi',
  'Arjun got placed at Infosys 7.2 LPA from Pune',
  'Meera (UPSC) cracked Mains — Jaipur topper',
];

const domains: { id: Domain; icon: typeof Cpu; title: string; desc: string; stat: string; pkg: string; companies: string; color: string }[] = [
  { id: 'engineering', icon: Cpu, title: 'Engineering', desc: 'Tech placements, DSA, System Design, Full-stack prep', stat: '87% placement rate', pkg: 'Avg 8.2 LPA', companies: 'TCS, Infosys, Google, Amazon', color: 'from-blue-500/10 to-indigo-500/10 border-blue-200' },
  { id: 'commerce', icon: Landmark, title: 'Commerce & Banking', desc: 'SBI PO, IBPS, RBI, Banking & Finance readiness', stat: '72% selection rate', pkg: 'Avg 6.5 LPA', companies: 'SBI, HDFC, RBI, ICICI', color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200' },
  { id: 'arts', icon: BookOpen, title: 'Arts & Civil Services', desc: 'UPSC, IAS, IPS — complete prelims to interview prep', stat: '94% prelims clear rate', pkg: 'Grade A postings', companies: 'IAS, IPS, IFS, IRS', color: 'from-violet-500/10 to-purple-500/10 border-violet-200' },
];

const stats = [
  { icon: Users, value: '50,000+', label: 'Students' },
  { icon: Award, value: '78%', label: 'Placement Rate' },
  { icon: Zap, value: '3x', label: 'Faster Prep' },
  { icon: Brain, value: 'AI', label: 'Personalised' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { setDomain } = useStationStore();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Ticker */}
      <div className="bg-primary text-primary-foreground py-2 overflow-hidden">
        <div className="animate-ticker whitespace-nowrap flex gap-12 text-xs font-medium">
          {[...tickerMessages, ...tickerMessages].map((m, i) => (
            <span key={i} className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-accent shrink-0" /> {m}
            </span>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Target className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">Station</span>
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              <LogIn className="w-4 h-4" /> Login
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12 text-center animate-slide-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-6">
          <Zap className="w-3.5 h-3.5" /> AI-Powered Placement Prep for India
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold mb-5 leading-[1.05] tracking-tight">
          Find Your <span className="text-accent">Station</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          From your current level to job-ready — personalized for your domain, city, and ambition. Beat the competition with AI that knows exactly where you stand.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-accent text-accent-foreground font-bold text-base hover:opacity-90 transition-opacity shadow-lg shadow-accent/20"
          >
            Start for Free <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            <LogIn className="w-4 h-4" /> Sign In
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-6 pb-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-card rounded-2xl border border-border p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                <s.icon className="w-5 h-5 text-accent" />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Domain Cards */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold mb-2 text-center">Choose Your Path</h2>
        <p className="text-sm text-muted-foreground text-center mb-8">Every domain has its own AI-curated roadmap</p>
        <div className="grid md:grid-cols-3 gap-6">
          {domains.map((d) => (
            <button
              key={d.id}
              onClick={() => { setDomain(d.id); navigate('/login'); }}
              className={`group bg-gradient-to-br ${d.color} rounded-2xl p-7 text-left border hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
            >
              <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-5 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                <d.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">{d.title}</h3>
              <p className="text-muted-foreground text-sm mb-5 leading-relaxed">{d.desc}</p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 font-medium text-accent"><Award className="w-3 h-3" />{d.stat}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><TrendingUp className="w-3 h-3" />{d.pkg}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Users className="w-3 h-3" />{d.companies}</div>
              </div>
              <div className="mt-5 flex items-center gap-1 text-xs text-accent font-semibold group-hover:gap-2 transition-all">
                Get Started <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-card border-t border-border py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-2">How Station Works</h2>
          <p className="text-muted-foreground text-sm mb-12">Three steps to placement readiness</p>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { step: '01', title: 'Pick Your Domain', desc: 'Engineering, Commerce, or Arts — each with its own AI-powered roadmap and curated resources.', icon: Target },
              { step: '02', title: 'AI Profiles You', desc: 'Personality quiz + academic data = your unique readiness score and personalized weak-point analysis.', icon: Brain },
              { step: '03', title: 'Climb Your Rank', desc: 'Weekly plans, quizzes, mock interviews — watch your city rank rise every day you practice.', icon: TrendingUp },
            ].map((s) => (
              <div key={s.step} className="relative text-left bg-background rounded-2xl p-6 border border-border">
                <span className="text-5xl font-extrabold text-accent/15 absolute -top-2 right-4">{s.step}</span>
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <s.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-base font-semibold mb-1.5">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16">
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Ready to find your Station?</h2>
          <p className="text-primary-foreground/70 mb-8 text-sm">Join 50,000+ students already on their placement journey.</p>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-accent text-accent-foreground font-bold text-base hover:opacity-90 transition-opacity shadow-lg"
          >
            Start Preparing Now <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
