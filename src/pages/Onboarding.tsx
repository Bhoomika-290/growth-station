import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

const personalityQuestions = [
  { q: 'You receive conflicting instructions from two seniors. You:', options: ['Follow the more senior one', 'Ask both to align', 'Use your own judgment', 'Escalate to someone higher'] },
  { q: 'You have 2 hours to learn something completely new. You:', options: ['Watch a video tutorial', 'Read documentation', 'Try building immediately', 'Find a mentor'] },
  { q: 'A teammate is struggling with their part. You:', options: ['Offer help proactively', 'Wait for them to ask', 'Take over their part', 'Suggest they ask the lead'] },
  { q: 'Under extreme deadline pressure, you:', options: ['Stay calm and prioritize', 'Work overtime to finish all', 'Cut scope strategically', 'Ask for deadline extension'] },
  { q: 'Your biggest strength is:', options: ['Analytical thinking', 'Communication', 'Creativity', 'Persistence'] },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = (location.state as any)?.name || 'Student';
  const { domain, login } = useStationStore();
  const config = domainConfig[domain];

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    state: '', city: '', college: '', specialization: '', year: '', dreamCompany: '', targetSalary: '', timeline: '6',
    answers: Array(5).fill(-1),
  });

  const totalSteps = 4;

  const handleFinish = () => {
    login({
      name: userName, state: form.state, city: form.city, college: form.college,
      domain, specialization: form.specialization, year: form.year,
      dreamCompany: form.dreamCompany, targetSalary: form.targetSalary, timeline: form.timeline,
      personalityScore: { iq: 65, eq: 72, rq: 58 },
    });
    navigate('/dashboard');
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent";

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-lg animate-slide-up">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? 'bg-accent' : 'bg-border'}`} />
          ))}
        </div>

        <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Personal Details</h2>
              <p className="text-sm text-muted-foreground">Hi {userName}, let's set up your profile</p>
              <input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className={inputClass} />
              <input placeholder="City / Locality" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} />
              <input placeholder="College name" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} className={inputClass} />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Academic Info</h2>
              <p className="text-sm text-muted-foreground">Domain: <span className="text-accent font-medium">{config.label}</span></p>
              <input placeholder="Specialization (e.g., Computer Science)" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} className={inputClass} />
              <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className={inputClass}>
                <option value="">Current year / status</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="Final Year">Final Year</option>
                <option value="Graduate">Graduate</option>
              </select>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Your Target</h2>
              <input placeholder={`Dream ${domain === 'arts' ? 'service' : 'company'} (e.g., ${config.companies[0]})`} value={form.dreamCompany} onChange={(e) => setForm({ ...form, dreamCompany: e.target.value })} className={inputClass} />
              <input placeholder="Target package / salary" value={form.targetSalary} onChange={(e) => setForm({ ...form, targetSalary: e.target.value })} className={inputClass} />
              <div className="space-y-2">
                <label className="text-sm font-medium">Timeline</label>
                <div className="flex gap-2">
                  {['3', '6', '12'].map((t) => (
                    <button key={t} onClick={() => setForm({ ...form, timeline: t })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${form.timeline === t ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted-foreground'}`}>
                      {t} months
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Quick Personality Check</h2>
              <p className="text-sm text-muted-foreground">5 questions to understand your IQ/EQ/RQ baseline</p>
              {personalityQuestions.map((pq, qi) => (
                <div key={qi} className="space-y-2">
                  <p className="text-sm font-medium">{qi + 1}. {pq.q}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {pq.options.map((opt, oi) => (
                      <button key={oi} onClick={() => { const a = [...form.answers]; a[qi] = oi; setForm({ ...form, answers: a }); }}
                        className={`text-xs py-2 px-3 rounded-lg border transition-all text-left ${form.answers[qi] === oi ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted-foreground hover:border-accent/50'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {step > 0 ? (
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}
            {step < totalSteps - 1 ? (
              <button onClick={() => setStep(step + 1)} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-medium text-sm hover-scale">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleFinish} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-medium text-sm hover-scale">
                <CheckCircle className="w-4 h-4" /> Generate My Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
