import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStationStore, domainConfig, type Domain } from '@/store/useStationStore';
import { supabase } from '@/integrations/supabase/client';
import { Cpu, Landmark, BookOpen, ArrowRight, Globe, Mail, Lock, User, Loader2, LogIn } from 'lucide-react';

const domainIcons = { engineering: Cpu, commerce: Landmark, arts: BookOpen };

export default function Login() {
  const navigate = useNavigate();
  const { domain, setDomain, language, setLanguage, login } = useStationStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isHi = language === 'hi';

  // Check existing session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await loadProfileAndNavigate(session.user.id);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await loadProfileAndNavigate(session.user.id);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProfileAndNavigate = async (userId: string) => {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (profile) {
      login({
        name: profile.name || 'Student',
        state: '',
        city: profile.city || '',
        college: profile.college || '',
        domain: (profile.domain as Domain) || 'engineering',
        specialization: profile.specialization || '',
        year: '',
        dreamCompany: profile.dream_company || '',
        dreamJob: '',
        targetSalary: '',
        timeline: '',
        personalityScore: { iq: 50, eq: 50, rq: 50 },
        weakPoints: [],
      });
      navigate('/dashboard');
    } else {
      navigate('/onboarding', { state: { name: 'Student' } });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isLogin) {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setError(err.message); setLoading(false); return; }
    } else {
      if (!name.trim()) { setError('Please enter your name'); setLoading(false); return; }
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, domain } },
      });
      if (err) { setError(err.message); setLoading(false); return; }

      // Update profile with domain info
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from('profiles').update({ domain, name }).eq('id', session.user.id);
      }
    }
    setLoading(false);
  };

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
            <h1 className="text-2xl font-bold">{isLogin ? (isHi ? 'वापसी पर स्वागत है' : 'Welcome Back') : (isHi ? 'Station में शामिल हों' : 'Join Station')}</h1>
            <button onClick={() => setLanguage(isHi ? 'en' : 'hi')}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted text-xs text-muted-foreground hover:text-foreground">
              <Globe className="w-3 h-3" /> {isHi ? 'EN' : 'हि'}
            </button>
          </div>
          <p className="text-muted-foreground text-sm mb-6">
            {isLogin ? (isHi ? 'अपनी तैयारी जारी रखने के लिए साइन इन करें' : 'Sign in to continue your preparation') :
              (isHi ? 'अपना डोमेन चुनें और खाता बनाएं' : 'Choose your domain and create an account')}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-xs text-center">{error}</div>
          )}

          {/* Domain selector (only for signup) */}
          {!isLogin && (
            <div className="flex gap-2 mb-4">
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
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder={isHi ? 'आपका पूरा नाम' : 'Full Name'} value={name} onChange={e => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent" required />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input type="email" placeholder={isHi ? 'ईमेल' : 'Email'} value={email} onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input type="password" placeholder={isHi ? 'पासवर्ड' : 'Password'} value={password} onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent" required minLength={6} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-semibold flex items-center justify-center gap-2 hover-scale disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isLogin ? <LogIn className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              {isLogin ? (isHi ? 'साइन इन' : 'Sign In') : (isHi ? 'खाता बनाएं' : 'Create Account')}
            </button>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-4">
            {isLogin ? (isHi ? 'खाता नहीं है?' : "Don't have an account?") : (isHi ? 'पहले से खाता है?' : 'Already have an account?')}{' '}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-accent font-medium hover:underline">
              {isLogin ? (isHi ? 'साइन अप' : 'Sign Up') : (isHi ? 'साइन इन' : 'Sign In')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
