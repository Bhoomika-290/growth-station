import { useState } from 'react';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { Brain, Zap, Clock, Star, Shield, X } from 'lucide-react';

const quizIcons = [Zap, Clock, Brain, Star, Shield];

export default function Quizzes() {
  const { domain } = useStationStore();
  const config = domainConfig[domain];
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Quizzes</h1>
        <p className="text-sm text-muted-foreground">{config.label} — IQ + EQ + RQ assessment</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {config.quizTypes.map((qt, i) => {
          const Icon = quizIcons[i % quizIcons.length];
          return (
            <button key={qt} onClick={() => setShowPopup(true)}
              className="bg-card rounded-2xl border border-border p-6 text-left hover:border-accent/50 hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-3 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{qt}</h3>
              <p className="text-xs text-muted-foreground">{Math.floor(Math.random() * 20) + 10} questions · {Math.floor(Math.random() * 15) + 5} min</p>
            </button>
          );
        })}
      </div>

      {/* GMA Info */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold mb-3">GMA Report Breakdown</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { letter: 'G', label: 'Geometrical / Spatial', score: 72 },
            { letter: 'M', label: 'Memory / Analytical', score: 68 },
            { letter: 'A', label: 'Application / EQ', score: 81 },
          ].map((g) => (
            <div key={g.letter} className="space-y-2">
              <span className="text-2xl font-bold text-accent">{g.letter}</span>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full" style={{ width: `${g.score}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground">{g.label}</p>
              <p className="text-sm font-bold">{g.score}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3D Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setShowPopup(false)}>
          <div className="bg-card rounded-2xl p-8 shadow-2xl w-full max-w-md animate-fade-in" onClick={(e) => e.stopPropagation()}
            style={{ perspective: '1000px', transform: 'rotateX(2deg)' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">What are you studying today?</h3>
              <button onClick={() => setShowPopup(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {config.quizPopupOptions.map((opt) => (
                <button key={opt} onClick={() => { setSelectedTopic(opt); setShowPopup(false); }}
                  className={`p-4 rounded-xl border text-sm font-medium text-left transition-all hover:border-accent hover:bg-accent/5 hover:-translate-y-1 hover:shadow-md ${
                    selectedTopic === opt ? 'border-accent bg-accent/10' : 'border-border'
                  }`}>
                  <Brain className="w-4 h-4 text-accent mb-2" />
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
