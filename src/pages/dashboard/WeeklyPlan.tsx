import { useState } from 'react';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { Clock, FileText, X, TrendingUp, AlertTriangle, Award, CheckCircle, BarChart3, MapPin, Video, ExternalLink, BookOpen, ChevronRight, Play } from 'lucide-react';

export default function WeeklyPlan() {
  const { domain, user, completeTask, rank, totalStudents, language } = useStationStore();
  const config = domainConfig[domain];
  const isHi = language === 'hi';
  const [showReport, setShowReport] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const resources = config.weeklyResources as Record<string, { videos: string[]; pdfs: string[] }>;

  const steps = config.weeklyTopics.map((topic, i) => ({
    step: i + 1,
    topic,
    description: getStepDescription(domain, topic, user?.dreamCompany || config.companies[0]),
    time: `${2 + i} hours`,
    videos: resources[topic]?.videos || [],
    pdfs: resources[topic]?.pdfs || [],
    questions: getStepQuestions(domain, topic),
  }));

  const toggleStep = (i: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(i)) { next.delete(i); } else { next.add(i); completeTask(); }
      return next;
    });
  };

  const totalCompleted = completedSteps.size;
  const overallProgress = Math.round((totalCompleted / steps.length) * 100);
  const pct = Math.round(((totalStudents - rank) / totalStudents) * 100);

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isHi ? 'रोडमैप' : 'Roadmap'}</h1>
          <p className="text-sm text-muted-foreground">{isHi ? 'आपकी व्यक्तिगत तैयारी योजना' : 'Your personalized preparation plan'}</p>
        </div>
        <button onClick={() => setShowReport(true)} className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover:scale-105 transition-transform flex items-center gap-2">
          <FileText className="w-4 h-4" /> {isHi ? 'रिपोर्ट' : 'Report'}
        </button>
      </div>

      {/* Progress bar */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">{totalCompleted}/{steps.length} {isHi ? 'स्टेप पूर्ण' : 'steps completed'}</p>
          <p className="text-sm font-bold text-accent">{overallProgress}%</p>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }} />
        </div>
      </div>

      {/* Steps — Timeline Style */}
      <div className="space-y-4">
        {steps.map((step, i) => {
          const done = completedSteps.has(i);
          const expanded = expandedStep === i;
          return (
            <div key={i} className="relative">
              {/* Timeline connector */}
              {i < steps.length - 1 && (
                <div className={`absolute left-5 top-16 w-0.5 h-[calc(100%-2rem)] ${done ? 'bg-accent' : 'bg-border'}`} />
              )}

              <div className={`bg-card rounded-2xl border transition-all ${done ? 'border-accent/40' : 'border-border'} overflow-hidden`}>
                {/* Step Header */}
                <div className="flex items-start gap-4 p-5">
                  {/* Step circle */}
                  <button onClick={() => toggleStep(i)}
                    className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm transition-all ${
                      done ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground border-2 border-border'
                    }`}>
                    {done ? <CheckCircle className="w-5 h-5" /> : step.step}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-accent font-bold">Step {step.step}</span>
                        <h3 className={`font-bold text-base mt-0.5 ${done ? 'line-through text-muted-foreground' : ''}`}>{step.topic}</h3>
                      </div>
                      <button onClick={() => setExpandedStep(expanded ? null : i)}
                        className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-medium hover:scale-105 transition-transform flex items-center gap-1 flex-shrink-0">
                        {isHi ? 'सीखना शुरू करें' : 'Start Learning'} <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Est. {step.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{step.description}</p>

                    {/* Resource links — always visible */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {step.videos.slice(0, 2).map((url, vi) => (
                        <a key={vi} href={url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 text-xs hover:bg-accent/10 transition-colors">
                          <Play className="w-3 h-3 text-accent" /> {step.topic.split(' ')[0]} - Video {vi + 1} <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                      {step.pdfs.slice(0, 1).map((pdf, pi) => (
                        <span key={pi} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 text-xs">
                          <BookOpen className="w-3 h-3 text-accent" /> {pdf}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Expanded: Questions & detailed resources */}
                {expanded && (
                  <div className="px-5 pb-5 pt-0 border-t border-border mt-0 animate-fade-in">
                    <div className="ml-14 space-y-4 pt-4">
                      {/* Practice Questions */}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-accent mb-2">{isHi ? 'अभ्यास प्रश्न' : 'Practice Questions'}</p>
                        <div className="space-y-2">
                          {step.questions.map((q, qi) => (
                            <div key={qi} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/30 text-xs">
                              <span className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-[10px] flex-shrink-0">{qi + 1}</span>
                              <span>{q}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Video embeds */}
                      {step.videos.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-accent mb-2">{isHi ? 'वीडियो लेक्चर' : 'Video Lectures'}</p>
                          <div className="grid gap-2">
                            {step.videos.map((url, vi) => {
                              const videoId = extractYouTubeId(url);
                              return videoId ? (
                                <div key={vi} className="rounded-xl overflow-hidden aspect-video bg-muted">
                                  <iframe src={`https://www.youtube.com/embed/${videoId}`} title={`${step.topic} Video ${vi + 1}`}
                                    className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                                </div>
                              ) : (
                                <a key={vi} href={url} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-accent/10 transition-all">
                                  <Video className="w-5 h-5 text-accent" />
                                  <span className="text-xs">{isHi ? 'वीडियो देखें' : 'Watch Video'} {vi + 1}</span>
                                  <ExternalLink className="w-3 h-3 ml-auto" />
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setShowReport(false)}>
          <div className="bg-card rounded-2xl p-6 shadow-2xl w-full max-w-lg animate-fade-in max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold">{isHi ? 'साप्ताहिक प्रदर्शन' : 'Weekly Performance'}</h3>
              <button onClick={() => setShowReport(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="text-center p-4 rounded-xl border border-border mb-4">
              <p className="text-4xl font-bold text-accent">{overallProgress}%</p>
              <p className="text-xs text-muted-foreground mt-1">{totalCompleted}/{steps.length} {isHi ? 'स्टेप पूर्ण' : 'steps completed'}</p>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                <BarChart3 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div><p className="font-medium">Top {pct}% in {user?.city || 'your area'}</p></div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{isHi ? 'बाकी स्टेप पूरे करें' : 'Complete remaining steps'}</p>
                  <p className="text-xs text-muted-foreground">{steps.length - totalCompleted} {isHi ? 'बाकी' : 'remaining'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function getStepDescription(domain: string, topic: string, company: string): string {
  const descs: Record<string, Record<string, string>> = {
    engineering: {
      'Arrays & Hashing': `Master array manipulation and hash map patterns. ${company} heavily tests these in online assessments. Focus on two-pointer, sliding window, and frequency counting techniques.`,
      'Trees & Graphs': `Build strong fundamentals in tree traversals and graph algorithms. Practice BFS, DFS, and shortest path problems commonly asked at ${company}.`,
      'Dynamic Programming': `Learn to identify DP patterns — knapsack, LCS, matrix chain. ${company} often asks medium-hard DP problems in technical rounds.`,
      'System Design Basics': `Understand scalability, load balancing, caching, and database sharding. Essential for ${company} senior rounds.`,
      'SQL & DBMS': `Master SQL queries, normalization, ACID properties, and indexing. ${company} tests DBMS fundamentals in technical interviews.`,
      'OS Concepts': `Study processes, threads, memory management, and scheduling algorithms. Core CS fundamentals tested at ${company}.`,
      'Mock Interview': `Practice full mock interviews simulating ${company}'s actual interview format. Focus on communication and problem-solving approach.`,
    },
    commerce: {
      'Number System': `Master number system shortcuts for quick calculations. Essential for ${company} quantitative aptitude section.`,
      'Profit & Loss': `Learn all P&L formulas, partnerships, and SI/CI problems. High-weightage topic in ${company} exams.`,
      'Data Interpretation': `Practice reading charts, tables, and graphs quickly. ${company} dedicates 15-20 questions to DI.`,
      'Syllogisms': `Learn Venn diagram method for solving syllogisms accurately. Important for ${company} reasoning section.`,
      'Banking GK': `Study current banking policies, RBI guidelines, and financial news. ${company} asks 25-30 GK questions.`,
      'English Grammar': `Focus on error spotting, fill in blanks, and reading comprehension. Important for ${company} English section.`,
      'Mock Test': `Take full-length mock tests simulating ${company}'s actual exam pattern and time limits.`,
    },
    arts: {
      'Ancient India': `Study Indus Valley, Vedic period, Mauryas, and Guptas. Foundation for UPSC History paper.`,
      'Indian Polity': `Master constitutional framework, amendments, and landmark judgments from Laxmikanth.`,
      'Physical Geography': `Study geomorphology, climatology, and oceanography. Important for Prelims and Mains.`,
      'Indian Economy': `Understand fiscal policy, monetary policy, and economic surveys. High-weightage in UPSC.`,
      'Ethics Case Studies': `Practice writing ethical dilemma case studies with proper framework and analysis.`,
      'Current Affairs': `Review last 6 months of national and international events, government schemes.`,
      'Answer Writing': `Practice structured answer writing with introduction, body, and conclusion format.`,
    },
  };
  return descs[domain]?.[topic] || `Focus on mastering ${topic}. This is an important area for your preparation.`;
}

function getStepQuestions(domain: string, topic: string): string[] {
  const qs: Record<string, Record<string, string[]>> = {
    engineering: {
      'Arrays & Hashing': ['Two Sum problem', 'Find duplicates in array', 'Longest consecutive sequence', 'Group anagrams'],
      'Trees & Graphs': ['Level order traversal', 'Validate BST', 'Number of islands', 'Dijkstra shortest path'],
      'Dynamic Programming': ['Climbing stairs', 'Longest common subsequence', '0/1 Knapsack', 'Edit distance'],
      'System Design Basics': ['Design URL shortener', 'Design chat system', 'Design rate limiter'],
      'SQL & DBMS': ['Write JOIN queries', 'Explain normalization forms', 'ACID properties with examples'],
      'OS Concepts': ['Explain deadlock conditions', 'Page replacement algorithms', 'Process vs Thread'],
      'Mock Interview': ['Introduce yourself in 2 minutes', 'Solve a medium DSA problem', 'Explain a past project'],
    },
    commerce: {
      'Number System': ['Find HCF/LCM of 3 numbers', 'Remainder theorem problems', 'Unit digit problems'],
      'Profit & Loss': ['Successive discount problems', 'Partnership ratio problems', 'Marked price questions'],
      'Data Interpretation': ['Bar graph analysis', 'Pie chart calculations', 'Table-based questions'],
      'Syllogisms': ['All-Some-No combinations', 'Either-Or conclusions', 'Complementary pair identification'],
      'Banking GK': ['Current repo rate', 'RBI governor functions', 'Recent banking mergers'],
      'English Grammar': ['Subject-verb agreement', 'Error detection', 'Para jumbles'],
      'Mock Test': ['Full prelims mock', 'Sectional time management', 'Accuracy vs attempts analysis'],
    },
    arts: {
      'Ancient India': ['Harappan trade routes', 'Ashoka\'s dhamma', 'Gupta golden age contributions'],
      'Indian Polity': ['Fundamental Rights vs DPSP', 'Amendment procedures', 'Federal structure analysis'],
      'Physical Geography': ['Plate tectonics theory', 'Indian monsoon mechanism', 'Ocean currents'],
      'Indian Economy': ['GDP vs GNP', 'Fiscal deficit implications', 'Monetary policy tools'],
      'Ethics Case Studies': ['Conflict of interest scenario', 'Whistleblower dilemma', 'Public duty vs personal ethics'],
      'Current Affairs': ['Recent Supreme Court verdicts', 'International summits', 'Government flagship schemes'],
      'Answer Writing': ['150-word answer structure', 'Diagram integration', 'Conclusion writing practice'],
    },
  };
  return qs[domain]?.[topic] || ['Practice fundamentals', 'Solve 5 problems', 'Review key concepts'];
}
