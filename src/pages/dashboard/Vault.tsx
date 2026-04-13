import { useState } from 'react';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { BookOpen, Search, Bookmark, FileText, Video, Brain, Map } from 'lucide-react';

const contentTypes = [
  { icon: FileText, label: 'Notes' },
  { icon: Brain, label: 'Flashcards' },
  { icon: Video, label: 'Videos' },
  { icon: Map, label: 'Mind Maps' },
];

export default function Vault() {
  const { domain } = useStationStore();
  const config = domainConfig[domain];
  const [search, setSearch] = useState('');
  const [activeTopic, setActiveTopic] = useState(config.vaultTopics[0]);

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Knowledge Vault</h1>
          <p className="text-sm text-muted-foreground">{config.label} resources organized by topic</p>
        </div>
        <Bookmark className="w-5 h-5 text-accent" />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input placeholder="Search topics, notes, flashcards..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
      </div>

      {/* Topic tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {config.vaultTopics.map((t) => (
          <button key={t} onClick={() => setActiveTopic(t)}
            className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeTopic === t ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:bg-secondary'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {contentTypes.map((ct) => (
          <div key={ct.label} className="bg-card rounded-xl border border-border p-5 hover:border-accent/50 transition-all cursor-pointer group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                <ct.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{ct.label}</p>
                <p className="text-xs text-muted-foreground">{activeTopic}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{Math.floor(Math.random() * 20) + 5} items available</p>
          </div>
        ))}
      </div>

      {/* Weak area suggestion */}
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex items-center gap-3">
        <BookOpen className="w-5 h-5 text-accent flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">Recommended for you</p>
          <p className="text-xs text-muted-foreground">Based on your quiz results, focus on: {config.vaultTopics[3]}</p>
        </div>
      </div>
    </div>
  );
}
