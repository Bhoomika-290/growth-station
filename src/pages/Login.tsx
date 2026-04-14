import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStationStore, domainConfig, type Domain } from '@/store/useStationStore';
import { signIn, signUp, fetchMe, getToken } from '@/lib/auth';
import { Cpu, Landmark, BookOpen, ArrowRight, Globe, Mail, Lock, User, Loader2, LogIn, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const domainIcons = { engineering: Cpu, commerce: Landmark, arts: BookOpen };

export default function Login() {
  const navigate = useNavigate();
  const { domain, setDomain, language, setLanguage, login } = useStationStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isHi = language === 'hi';

  useEffect(() => {
    const checkSession = async () => {
      if (!getToken()) return;
      const user = await fetchMe();
      if (user) {
        login({
          name: user.name || 'Student',
          state: '', city: user.city || '', college: user.college || '',
          domain: (user.domain as Domain) || 'engineering',
          specialization: user.specialization || '', year: '',
          dreamCompany: user.dream_company || '', dreamJob: '', targetSalary: '', timeline: '',
          personalityScore: { iq: 50, eq: 50, rq: 50 }, weakPoints: [],
        });
        navigate('/dashboard');
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { user } = await signIn(email, password);
        login({
          name: user.name || 'Student',
          state: '', city: user.city || '', college: user.college || '',
          domain: (user.domain as Domain) || 'engineering',
          specialization: user.specialization || '', year: '',
          dreamCompany: user.dream_company || '', dreamJob: '', targetSalary: '', timeline: '',
          personalityScore: { iq: 50, eq: 50, rq: 50 }, weakPoints: [],
        });
        navigate('/dashboard');
      } else {
        if (!name.trim()) { setError('Please enter your name'); setLoading(false); return; }
        await signUp(email, password, name, domain);
        toast.success(isHi ? 'अकाउंट बन गया! अब लॉगिन करें।' : 'Account created! Please sign in.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center bg-primary">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-sidebar-primary blur-3xl" />
        </div>
        <div className="relative z-10 text-primary-foreground text-center px-12 max-w-md">
          <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-accent/20 backdrop-blur flex items-center justify-center border border-accent/30">
            {(() => { const Icon = domainIcons[domain]; return <Icon className="w-10 h-10 text-accent" />; })()}
          </div>
          <h2 className="text-4xl font-bold mb-3 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            STATION
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-6">
            {isHi ? domainConfig[domain].affirmationHi : domainConfig[domain].affirmation}
          </p>
          <div className="flex gap-3 justify-center">
            {(['engineering', 'commerce', 'arts'] as Domain[]).map((d) => {
              const Icon = domainIcons[d];
              return (
                <button key={d} onClick={() => setDomain(d)}
                  className={`px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-medium transition-all border ${
                    domain === d
                      ? 'border-accent bg-accent/20 text-accent'
                      : 'border-primary-foreground/20 text-primary-foreground/60 hover:border-primary-foreground/40'
                  }`}>
                  <Icon className="w-4 h-4" />
                  {isHi ? domainConfig[d].labelHi : domainConfig[d].label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md animate-slide-up">
          {/* Language toggle */}
          <div className="flex justify-end mb-6">
            <button onClick={() => setLanguage(isHi ? 'en' : 'hi')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
              <Globe className="w-3.5 h-3.5" /> {isHi ? 'English' : 'हिंदी'}
            </button>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              {isLogin ? (isHi ? 'वापसी पर स्वागत है' : 'Welcome back') : (isHi ? 'अकाउंट बनाएं' : 'Create your account')}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isLogin
                ? (isHi ? 'अपनी तैयारी जारी रखें' : 'Sign in to continue your preparation journey')
                : (isHi ? 'अपनी प्लेसमेंट यात्रा शुरू करें' : 'Start your placement preparation journey')}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
              {error}
            </div>
          )}

          {/* Domain selector (signup only, mobile) */}
          {!isLogin && (
            <div className="flex gap-2 mb-5 lg:hidden">
              {(['engineering', 'commerce', 'arts'] as Domain[]).map((d) => {
                const Icon = domainIcons[d];
                return (
                  <button key={d} onClick={() => setDomain(d)}
                    className={`flex-1 py-2.5 rounded-xl flex flex-col items-center gap-1 text-xs font-medium border transition-all ${
                      domain === d ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted-foreground hover:border-accent/50'
                    }`}>
                    <Icon className="w-4 h-4" />
                    {isHi ? domainConfig[d].labelHi : domainConfig[d].label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <input type="text" placeholder={isHi ? 'आपका पूरा नाम' : 'Full name'} value={name} onChange={e => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all" required />
              </div>
            )}
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
              <input type="email" placeholder={isHi ? 'ईमेल' : 'Email address'} value={email} onChange={e => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all" required />
            </div>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
              <input type={showPassword ? 'text' : 'password'} placeholder={isHi ? 'पासवर्ड' : 'Password'} value={password} onChange={e => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all" required minLength={6} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isLogin ? <LogIn className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              {isLogin ? (isHi ? 'साइन इन करें' : 'Sign in') : (isHi ? 'अकाउंट बनाएं' : 'Create account')}
            </button>
          </form>

          {/* Toggle */}
          <p className="text-sm text-center text-muted-foreground mt-6">
            {isLogin ? (isHi ? 'खाता नहीं है?' : "Don't have an account?") : (isHi ? 'पहले से खाता है?' : 'Already have an account?')}{' '}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-accent font-semibold hover:underline underline-offset-2">
              {isLogin ? (isHi ? 'साइन अप करें' : 'Sign up') : (isHi ? 'साइन इन करें' : 'Sign in')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
