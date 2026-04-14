import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStationStore, domainConfig, type Domain } from '@/store/useStationStore';
import { signIn, signUp, fetchMe, getToken } from '@/lib/auth';
import { Cpu, Landmark, BookOpen, ArrowRight, Globe, Mail, Lock, User, Loader2, LogIn, Eye, EyeOff, Target, Zap } from 'lucide-react';
import { toast } from 'sonner';

const domainIcons = { engineering: Cpu, commerce: Landmark, arts: BookOpen };
const domainColors = {
  engineering: 'from-blue-600 to-slate-700',
  commerce: 'from-emerald-600 to-teal-700',
  arts: 'from-violet-600 to-purple-700',
};

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
        toast.success(isHi ? 'अकाउंट बन गया! अब प्रोफाइल सेट करें।' : 'Account created! Set up your profile.');
        navigate('/onboarding', { state: { name } });
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel — branding */}
      <div className={`hidden lg:flex flex-1 relative overflow-hidden items-center justify-center bg-gradient-to-br ${domainColors[domain]}`}>
        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/3" />
        </div>

        <div className="relative z-10 text-white text-center px-12 max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
              <Target className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-extrabold tracking-tight">STATION</span>
          </div>

          {/* Domain icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
            {(() => { const Icon = domainIcons[domain]; return <Icon className="w-10 h-10 text-white" />; })()}
          </div>

          <h2 className="text-2xl font-bold mb-3">
            {isHi ? domainConfig[domain].affirmationHi : domainConfig[domain].affirmation}
          </h2>
          <p className="text-white/60 text-sm mb-8 leading-relaxed">
            {isHi ? 'अपनी प्लेसमेंट यात्रा AI के साथ शुरू करें' : 'Start your placement journey with AI by your side'}
          </p>

          {/* Domain selector */}
          <div className="flex gap-2 justify-center">
            {(['engineering', 'commerce', 'arts'] as Domain[]).map((d) => {
              const Icon = domainIcons[d];
              return (
                <button key={d} onClick={() => setDomain(d)}
                  className={`px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-medium transition-all border ${
                    domain === d
                      ? 'border-white/60 bg-white/20 text-white'
                      : 'border-white/20 text-white/50 hover:border-white/40 hover:text-white/70'
                  }`}>
                  <Icon className="w-3.5 h-3.5" />
                  {isHi ? domainConfig[d].labelHi : domainConfig[d].label}
                </button>
              );
            })}
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              { val: '50K+', label: isHi ? 'छात्र' : 'Students' },
              { val: '78%', label: isHi ? 'प्लेसमेंट' : 'Placement' },
              { val: 'AI', label: isHi ? 'पर्सनलाइज़्ड' : 'Personalised' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-xl p-3 border border-white/10">
                <p className="text-lg font-bold">{s.val}</p>
                <p className="text-xs text-white/60">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md animate-slide-up">
          {/* Top bar */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
                <Target className="w-4 h-4 text-accent-foreground" />
              </div>
              <span className="font-bold text-sm">STATION</span>
            </div>
            <div className="flex-1 lg:flex-none" />
            <button onClick={() => setLanguage(isHi ? 'en' : 'hi')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border border-border">
              <Globe className="w-3.5 h-3.5" /> {isHi ? 'English' : 'हिंदी'}
            </button>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
              {isLogin
                ? (isHi ? 'वापसी पर स्वागत है 👋' : 'Welcome back 👋')
                : (isHi ? 'अकाउंट बनाएं ✨' : 'Create your account ✨')}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {isLogin
                ? (isHi ? 'अपनी तैयारी जारी रखें — आप बेहतरीन कर रहे हैं!' : 'Sign in and continue your preparation journey.')
                : (isHi ? 'अपनी प्लेसमेंट यात्रा आज ही शुरू करें।' : 'Join 50,000+ students already preparing.')}
            </p>
          </div>

          {/* Tab toggle */}
          <div className="flex bg-muted rounded-xl p-1 mb-7 border border-border">
            <button onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${isLogin ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {isHi ? 'साइन इन' : 'Sign In'}
            </button>
            <button onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${!isLogin ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {isHi ? 'साइन अप' : 'Sign Up'}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center text-xs font-bold shrink-0">!</span>
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
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors pointer-events-none" />
                <input
                  type="text"
                  placeholder={isHi ? 'आपका पूरा नाम' : 'Full name'}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  data-testid="input-name"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all placeholder:text-muted-foreground/60"
                  required
                />
              </div>
            )}
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors pointer-events-none" />
              <input
                type="email"
                placeholder={isHi ? 'ईमेल एड्रेस' : 'Email address'}
                value={email}
                onChange={e => setEmail(e.target.value)}
                data-testid="input-email"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all placeholder:text-muted-foreground/60"
                required
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={isHi ? 'पासवर्ड (कम से कम 6 अक्षर)' : 'Password (min. 6 characters)'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                data-testid="input-password"
                className="w-full pl-11 pr-11 py-3.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all placeholder:text-muted-foreground/60"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              data-testid="button-submit"
              className="w-full py-3.5 rounded-xl bg-accent text-accent-foreground font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md shadow-accent/20 text-sm mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isLogin ? (
                <LogIn className="w-4 h-4" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {loading
                ? (isHi ? 'जारी है...' : 'Please wait...')
                : isLogin
                ? (isHi ? 'साइन इन करें' : 'Sign In')
                : (isHi ? 'अकाउंट बनाएं' : 'Create Account & Continue')}
            </button>
          </form>

          {isLogin && (
            <p className="text-xs text-center text-muted-foreground mt-5">
              {isHi ? 'खाता नहीं है?' : "Don't have an account?"}{' '}
              <button
                onClick={() => { setIsLogin(false); setError(''); }}
                className="text-accent font-semibold hover:underline underline-offset-2"
              >
                {isHi ? 'साइन अप करें' : 'Sign up free'}
              </button>
            </p>
          )}

          <p className="text-xs text-center text-muted-foreground mt-6 leading-relaxed">
            {isHi ? 'जारी रखने से आप हमारी' : 'By continuing, you agree to our'}{' '}
            <span className="text-accent">Terms of Service</span>{' '}
            {isHi ? 'और' : 'and'}{' '}
            <span className="text-accent">Privacy Policy</span>{' '}
            {isHi ? 'से सहमत होते हैं।' : 'from Station.'}
          </p>
        </div>
      </div>
    </div>
  );
}
