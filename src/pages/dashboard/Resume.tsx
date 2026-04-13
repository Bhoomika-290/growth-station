import { useStationStore, domainConfig } from '@/store/useStationStore';
import { FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';

export default function Resume() {
  const { domain, user } = useStationStore();
  const config = domainConfig[domain];

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Resume & Portfolio</h1>
        <p className="text-sm text-muted-foreground">Build a {config.label}-optimized resume</p>
      </div>

      {/* ATS Score */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">ATS Readiness Score</h3>
          <span className="text-2xl font-bold text-accent">67/100</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden mb-4">
          <div className="h-full bg-accent rounded-full" style={{ width: '67%' }} />
        </div>
        <div className="space-y-2">
          {[
            { ok: true, text: 'Contact info complete' },
            { ok: true, text: 'Skills section matches target role' },
            { ok: false, text: 'Missing quantifiable achievements' },
            { ok: false, text: 'Project descriptions need keywords' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {item.ok ? <CheckCircle className="w-4 h-4 text-accent" /> : <AlertCircle className="w-4 h-4 text-destructive" />}
              <span className={item.ok ? '' : 'text-muted-foreground'}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Templates */}
      <div>
        <h3 className="font-semibold mb-4">Resume Templates</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {['Professional', 'Technical', 'Academic'].map((t) => (
            <div key={t} className="bg-card rounded-xl border border-border p-6 text-center cursor-pointer hover:border-accent/50 transition-all group">
              <FileText className="w-8 h-8 mx-auto mb-3 text-muted-foreground group-hover:text-accent transition-colors" />
              <p className="text-sm font-medium">{t}</p>
              <p className="text-xs text-muted-foreground mt-1">Optimized for {config.label}</p>
            </div>
          ))}
        </div>
      </div>

      <button className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-medium flex items-center justify-center gap-2 hover-scale">
        <Download className="w-4 h-4" /> Download Resume
      </button>
    </div>
  );
}
