import { useStationStore, domainConfig } from '@/store/useStationStore';
import { Users, TrendingUp, MapPin, Trophy } from 'lucide-react';

export default function Social() {
  const { domain, user, rank } = useStationStore();
  const config = domainConfig[domain];

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Social Hub</h1>
        <p className="text-sm text-muted-foreground">See who's preparing for the same goals in your area</p>
      </div>

      {/* Locality stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Users, label: 'Same Role', value: '847 students' },
          { icon: MapPin, label: 'In Your Area', value: '124 students' },
          { icon: Trophy, label: 'Your Rank', value: `#${rank}` },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-4 text-center">
            <s.icon className="w-5 h-5 mx-auto mb-2 text-accent" />
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Live Feed */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-accent" /> Live Feed</h3>
        <div className="space-y-3">
          {config.socialFeed.map((msg, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 text-sm animate-fade-in" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold">
                {msg.charAt(0)}
              </div>
              <span>{msg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Trophy className="w-4 h-4 text-accent" /> Leaderboard</h3>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl text-sm ${i === 2 ? 'bg-accent/10 border border-accent/30' : 'bg-muted/30'}`}>
              <span className="w-6 text-center font-bold text-accent">#{i + 1}</span>
              <span className="flex-1">{i === 2 ? (user?.name || 'You') : `Student #${Math.floor(Math.random() * 500) + 100}`}</span>
              <span className="text-xs text-muted-foreground">{95 - i * 3} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
