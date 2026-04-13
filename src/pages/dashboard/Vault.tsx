import { useState } from 'react';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { BookOpen, Search, Bookmark, FileText, Video, Brain, Map, X, ChevronRight, Star, BookmarkCheck } from 'lucide-react';

interface VaultItem {
  id: string;
  title: string;
  type: 'Notes' | 'Flashcards' | 'Videos' | 'Mind Maps';
  topic: string;
  content: string;
  bookmarked: boolean;
}

const generateItems = (topics: string[]): VaultItem[] => {
  const types: VaultItem['type'][] = ['Notes', 'Flashcards', 'Videos', 'Mind Maps'];
  const items: VaultItem[] = [];
  topics.forEach(topic => {
    types.forEach(type => {
      items.push({
        id: `${topic}-${type}`,
        title: `${topic} — ${type}`,
        type,
        topic,
        content: type === 'Notes' ? `Comprehensive notes covering all key concepts of ${topic}. Includes definitions, formulas, diagrams, and practice examples. Updated regularly with exam-relevant content.`
          : type === 'Flashcards' ? `Quick revision flashcards for ${topic}. 25+ cards covering important terms, definitions, and quick facts. Perfect for last-minute revision.`
          : type === 'Videos' ? `Curated video lectures on ${topic} from top educators. Covers basics to advanced concepts with solved examples. Total duration: ~4 hours.`
          : `Visual mind map of ${topic} showing connections between sub-topics. Great for understanding the big picture and relationships between concepts.`,
        bookmarked: false,
      });
    });
  });
  return items;
};

const typeIcons = { Notes: FileText, Flashcards: Brain, Videos: Video, 'Mind Maps': Map };

export default function Vault() {
  const { domain } = useStationStore();
  const config = domainConfig[domain];
  const [items, setItems] = useState<VaultItem[]>(() => generateItems(config.vaultTopics));
  const [search, setSearch] = useState('');
  const [activeTopic, setActiveTopic] = useState<string>('All');
  const [activeType, setActiveType] = useState<string>('All');
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [flashcardFlipped, setFlashcardFlipped] = useState<Record<number, boolean>>({});

  const toggleBookmark = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, bookmarked: !item.bookmarked } : item));
  };

  const filtered = items.filter(item => {
    if (search && !item.title.toLowerCase().includes(search.toLowerCase()) && !item.topic.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeTopic !== 'All' && item.topic !== activeTopic) return false;
    if (activeType !== 'All' && item.type !== activeType) return false;
    if (showBookmarksOnly && !item.bookmarked) return false;
    return true;
  });

  const flashcards = selectedItem?.type === 'Flashcards' ? [
    { front: `What is ${selectedItem.topic}?`, back: `${selectedItem.topic} is a core concept in ${config.label} preparation covering fundamental principles and applications.` },
    { front: `Key formula for ${selectedItem.topic}?`, back: `The primary formula involves understanding the relationship between core variables. Review notes for detailed equations.` },
    { front: `Application of ${selectedItem.topic}?`, back: `Used extensively in ${config.companies[0]} interviews and ${config.quizTypes[0]} quizzes. Master this for guaranteed marks.` },
    { front: `Common mistake in ${selectedItem.topic}?`, back: `Most students confuse the sub-concepts. Remember to differentiate between similar terms and applications.` },
    { front: `Quick tip for ${selectedItem.topic}?`, back: `Practice 5 problems daily. Focus on understanding, not memorization. Link to other topics for deeper understanding.` },
  ] : [];

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Knowledge Vault</h1>
          <p className="text-sm text-muted-foreground">{config.label} resources organized by topic</p>
        </div>
        <button onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm ${showBookmarksOnly ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
          {showBookmarksOnly ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          {showBookmarksOnly ? 'Bookmarked' : 'Bookmarks'}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input placeholder="Search topics, notes, flashcards..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
      </div>

      {/* Topic tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['All', ...config.vaultTopics].map((t) => (
          <button key={t} onClick={() => setActiveTopic(t)}
            className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeTopic === t ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:bg-secondary'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Type filter */}
      <div className="flex gap-2">
        {['All', 'Notes', 'Flashcards', 'Videos', 'Mind Maps'].map((t) => (
          <button key={t} onClick={() => setActiveType(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeType === t ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-muted/50 text-muted-foreground'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((item) => {
          const Icon = typeIcons[item.type];
          return (
            <div key={item.id} onClick={() => { setSelectedItem(item); setFlashcardFlipped({}); }}
              className="bg-card rounded-xl border border-border p-5 hover:border-accent/50 transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.type}</p>
                    <p className="text-xs text-muted-foreground">{item.topic}</p>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); toggleBookmark(item.id); }}
                  className={`p-1 rounded ${item.bookmarked ? 'text-accent' : 'text-muted-foreground hover:text-accent'}`}>
                  {item.bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{item.content}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[10px] text-accent">Click to open</span>
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No items found. Try a different search or filter.</p>
        </div>
      )}

      {/* Weak area suggestion */}
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex items-center gap-3">
        <Star className="w-5 h-5 text-accent flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">Recommended for you</p>
          <p className="text-xs text-muted-foreground">Based on your quiz results, focus on: {config.vaultTopics[3]}</p>
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setSelectedItem(null)}>
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
              <div>
                <h3 className="font-semibold">{selectedItem.topic} — {selectedItem.type}</h3>
                <p className="text-xs text-muted-foreground">{config.label}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleBookmark(selectedItem.id)}
                  className={selectedItem.bookmarked ? 'text-accent' : 'text-muted-foreground'}>
                  {selectedItem.bookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                </button>
                <button onClick={() => setSelectedItem(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-6">
              {selectedItem.type === 'Notes' && (
                <div className="prose prose-sm max-w-none">
                  <h4 className="text-base font-semibold mb-3">📘 {selectedItem.topic}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{selectedItem.content}</p>
                  <div className="space-y-3 text-sm">
                    <div className="bg-muted/50 p-4 rounded-xl">
                      <p className="font-medium mb-1">Key Concepts:</p>
                      <ul className="space-y-1 text-muted-foreground text-xs">
                        <li>- Introduction to {selectedItem.topic} fundamentals</li>
                        <li>- Core principles and applications</li>
                        <li>- Common patterns and problem types</li>
                        <li>- Advanced techniques and optimizations</li>
                        <li>- Practice problems with solutions</li>
                      </ul>
                    </div>
                    <div className="bg-accent/5 p-4 rounded-xl border border-accent/20">
                      <p className="font-medium text-xs">Exam Tips:</p>
                      <p className="text-xs text-muted-foreground mt-1">This topic appears frequently in {config.quizTypes[0]} and {config.quizTypes[1]}. Focus on understanding the fundamentals before moving to advanced problems.</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedItem.type === 'Flashcards' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Click a card to flip it. Review all cards for complete revision.</p>
                  {flashcards.map((card, i) => (
                    <button key={i} onClick={() => setFlashcardFlipped(prev => ({ ...prev, [i]: !prev[i] }))}
                      className="w-full p-5 rounded-xl border border-border text-left transition-all hover:border-accent/50">
                      <p className="text-[10px] text-accent mb-1">{flashcardFlipped[i] ? 'ANSWER' : 'QUESTION'} — Card {i + 1}</p>
                      <p className="text-sm font-medium">{flashcardFlipped[i] ? card.back : card.front}</p>
                      <p className="text-[10px] text-muted-foreground mt-2">Tap to {flashcardFlipped[i] ? 'see question' : 'reveal answer'}</p>
                    </button>
                  ))}
                </div>
              )}

              {selectedItem.type === 'Videos' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">{selectedItem.content}</p>
                  {['Introduction & Basics', 'Core Concepts Deep Dive', 'Practice Problems Solved', 'Advanced Applications'].map((title, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-accent/5 cursor-pointer transition-all">
                      <div className="w-10 h-10 rounded-lg bg-accent/20 text-accent flex items-center justify-center">
                        <Video className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{title}</p>
                        <p className="text-xs text-muted-foreground">{20 + i * 15} min · Lecture {i + 1}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}

              {selectedItem.type === 'Mind Maps' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">{selectedItem.content}</p>
                  <div className="bg-muted/30 rounded-xl p-6">
                    <div className="text-center">
                      <div className="inline-block px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-bold mb-4">{selectedItem.topic}</div>
                      <div className="grid grid-cols-2 gap-4">
                        {['Fundamentals', 'Applications', 'Problem Solving', 'Advanced'].map((branch, i) => (
                          <div key={i} className="p-3 rounded-xl border border-border bg-card">
                            <p className="text-xs font-medium">{branch}</p>
                            <div className="mt-2 space-y-1">
                              {['Sub-topic A', 'Sub-topic B'].map((sub, j) => (
                                <p key={j} className="text-[10px] text-muted-foreground pl-2 border-l-2 border-accent/30">{sub}</p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
