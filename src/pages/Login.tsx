import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStationStore, domainConfig, type Domain } from '@/store/useStationStore';
import { Cpu, Landmark, BookOpen, ArrowRight, Globe } from 'lucide-react';

const domainIcons = { engineering: Cpu, commerce: Landmark, arts: BookOpen };

export default function Login() {
  const navigate = useNavigate();
  const { domain, setDomain, language, setLanguage } = useStationStore();
  const [name, setName] = useState('');
  const isHi = language === 'hi';

  return (
    <div className="min-h-screen flex">
      {/* Left visual */}
      <div className="hidden md:flex flex-1 bg-primary items-center justify-center p-12">
        <div className="text-primary-foreground text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-sidebar-primary/20 flex items-center justify-center">
            {(() => { const Icon = domainIcons[domain]; return <Icon className="w-10 h-10 text-sidebar-primary" />; })()}
          </div>
          <h2 className="text-3xl font-bold mb-2">{isHi ? domainConfig[domain].labelHi : domainConfig[domain].label}</h2>
          <p className="text-primary-foreground/70 text-sm max-w-xs">{isHi ? domainConfig[domain].affirmationHi : domainConfig[domain].affirmation}</p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-slide-up">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{isHi ? 'Station में आपका स्वागत है' : 'Welcome to Station'}</h1>
            <button onClick={() => setLanguage(isHi ? 'en' : 'hi')}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted text-xs text-muted-foreground hover:text-foreground">
              <Globe className="w-3 h-3" /> {isHi ? 'EN' : 'हि'}
            </button>
          </div>
          <p className="text-muted-foreground text-sm mb-8">{isHi ? 'अपना डोमेन चुनें और शुरू करने के लिए अपना नाम दर्ज करें' : 'Choose your domain & enter your name to begin'}</p>

          <div className="flex gap-2 mb-6">
            {(['engineering', 'commerce', 'arts'] as Domain[]).map((d) => {
              const Icon = domainIcons[d];
              return (
                <button key={d} onClick={() => setDomain(d)}
                  className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1 text-xs font-medium border transition-all ${
                    domain === d ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted-foreground hover:border-accent/50'
                  }`}>
                  <Icon className="w-5 h-5" />
                  {isHi ? domainConfig[d].labelHi : domainConfig[d].label}
                </button>
              );
            })}
          </div>

          <input type="text" placeholder={isHi ? 'आपका पूरा नाम' : 'Your full name'} value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground mb-4 focus:outline-none focus:ring-2 focus:ring-accent" />

          <button onClick={() => name.trim() && navigate('/onboarding', { state: { name } })}
            disabled={!name.trim()}
            className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-semibold flex items-center justify-center gap-2 hover-scale disabled:opacity-40">
            {isHi ? 'सेटअप जारी रखें' : 'Continue to Setup'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
