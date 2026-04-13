import { useStationStore, domainConfig } from '@/store/useStationStore';
import { Mic, MapPin, Building, Target, MessageSquare, Presentation } from 'lucide-react';

export default function InterviewPrep() {
  const { domain, user } = useStationStore();
  const config = domainConfig[domain];

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
            <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-accent" /> Region: {user?.city || 'Malad'}</div>
            <div className="flex items-center gap-2 text-sm"><Building className="w-4 h-4 text-accent" /> 12 companies hiring in your area</div>
            <div className="text-xs text-muted-foreground mt-2">Current hire probability: <span className="text-accent font-bold">34%</span></div>
            <div className="text-xs text-muted-foreground">Skills to boost probability: Communication, Technical rounds</div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Top Companies</p>
            {config.companies.slice(0, 4).map((c) => (
              <div key={c} className="flex items-center justify-between p-2 rounded-lg bg-muted text-sm">
                <span>{c}</span>
                <span className="text-xs text-accent">{Math.floor(Math.random() * 30) + 20}% match</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stage 2 - Company Prep */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Building className="w-4 h-4 text-accent" /> Stage 2 — Company-Specific Prep</h3>
        <div className="grid grid-cols-3 gap-3">
          {['Foundation', 'Competitive', 'Placement Ready'].map((level, i) => (
            <div key={level} className={`p-4 rounded-xl border text-center transition-all hover:border-accent/50 cursor-pointer ${i === 0 ? 'border-accent bg-accent/5' : 'border-border'}`}>
              <p className="text-sm font-medium">{level}</p>
              <p className="text-xs text-muted-foreground mt-1">Level {String.fromCharCode(65 + i)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Interview Practice */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Mic className="w-4 h-4 text-accent" /> Interview Practice</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: MessageSquare, title: 'Self Introduction', desc: 'AI-generated script, teleprompter style' },
            { icon: Mic, title: 'Rapid Fire', desc: 'Speak your answers, AI evaluates' },
            { icon: Presentation, title: 'Speech Patterns', desc: 'Formal, elevator pitch, technical' },
          ].map((p) => (
            <button key={p.title} className="p-4 rounded-xl border border-border text-left hover:border-accent/50 transition-all group">
              <p.icon className="w-5 h-5 text-accent mb-2" />
              <p className="text-sm font-medium">{p.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{p.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
