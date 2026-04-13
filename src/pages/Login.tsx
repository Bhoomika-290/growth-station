import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStationStore, domainConfig, type Domain } from '@/store/useStationStore';
import { Cpu, Landmark, BookOpen, ArrowRight } from 'lucide-react';

const domainIcons = { engineering: Cpu, commerce: Landmark, arts: BookOpen };

export default function Login() {
  const navigate = useNavigate();
  const { domain, setDomain } = useStationStore();
  const [name, setName] = useState('');

  return (
    <div className="min-h-screen flex">
      {/* Left visual */}
      <div className="hidden md:flex flex-1 bg-primary items-center justify-center p-12">
        <div className="text-primary-foreground text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-sidebar-primary/20 flex items-center justify-center">
            {(() => { const Icon = domainIcons[domain]; return <Icon className="w-10 h-10 text-sidebar-primary" />; })()}
          </div>
          <h2 className="text-3xl font-bold mb-2">{domainConfig[domain].label}</h2>
          <p className="text-primary-foreground/70 text-sm max-w-xs">{domainConfig[domain].affirmation}</p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-slide-up">
          <h1 className="text-2xl font-bold mb-1">Welcome to Station</h1>
          <p className="text-muted-foreground text-sm mb-8">Choose your domain & enter your name to begin</p>

          <div className="flex gap-2 mb-6">
            {(['engineering', 'commerce', 'arts'] as Domain[]).map((d) => {
              const Icon = domainIcons[d];
              return (
                <button
                  key={d}
                  onClick={() => setDomain(d)}
                  className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1 text-xs font-medium border transition-all ${
                    domain === d ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted-foreground hover:border-accent/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {domainConfig[d].label}
                </button>
              );
            })}
          </div>

          <input
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground mb-4 focus:outline-none focus:ring-2 focus:ring-accent"
          />

          <button
            onClick={() => name.trim() && navigate('/onboarding', { state: { name } })}
            disabled={!name.trim()}
            className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-semibold flex items-center justify-center gap-2 hover-scale disabled:opacity-40"
          >
            Continue to Setup <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
