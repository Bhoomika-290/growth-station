import { useState } from 'react';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { MapPin, Clock, Briefcase, DollarSign, Search, ExternalLink } from 'lucide-react';

type JobType = 'all' | 'full-time' | 'internship';

interface Job {
  title: string;
  company: string;
  logo: string;
  type: 'FULL-TIME' | 'INTERNSHIP';
  location: string;
  salary: string;
  level: string;
  posted: string;
  link: string;
}

const engineeringJobs: Job[] = [
  { title: 'Frontend Developer', company: 'Amazon', logo: '📦', type: 'FULL-TIME', location: 'Remote', salary: '12-18 LPA', level: 'Fresher', posted: '2 days ago', link: '#' },
  { title: 'Software Engineer Intern', company: 'Google', logo: '🔍', type: 'INTERNSHIP', location: 'Bangalore, India', salary: '80k-1.2L/month', level: 'Fresher', posted: '1 day ago', link: '#' },
  { title: 'Backend Developer', company: 'Microsoft', logo: '🪟', type: 'FULL-TIME', location: 'Hyderabad', salary: '15-25 LPA', level: 'Fresher', posted: '3 days ago', link: '#' },
  { title: 'SDE Intern', company: 'TCS', logo: '🏢', type: 'INTERNSHIP', location: 'Mumbai', salary: '25k/month', level: 'Fresher', posted: '5 days ago', link: '#' },
  { title: 'DevOps Engineer', company: 'Infosys', logo: '🔷', type: 'FULL-TIME', location: 'Pune', salary: '6-10 LPA', level: 'Fresher', posted: '1 week ago', link: '#' },
  { title: 'Data Analyst', company: 'Wipro', logo: '🌸', type: 'FULL-TIME', location: 'Chennai', salary: '5-8 LPA', level: 'Fresher', posted: '4 days ago', link: '#' },
];

const commerceJobs: Job[] = [
  { title: 'Probationary Officer', company: 'SBI', logo: '🏦', type: 'FULL-TIME', location: 'All India', salary: '8-14 LPA', level: 'Graduate', posted: '1 week ago', link: '#' },
  { title: 'Clerk', company: 'HDFC Bank', logo: '🏦', type: 'FULL-TIME', location: 'Mumbai', salary: '4-6 LPA', level: 'Graduate', posted: '3 days ago', link: '#' },
  { title: 'Internship - Finance', company: 'ICICI', logo: '🏦', type: 'INTERNSHIP', location: 'Delhi', salary: '20k/month', level: 'Student', posted: '2 days ago', link: '#' },
  { title: 'Grade B Officer', company: 'RBI', logo: '🏛️', type: 'FULL-TIME', location: 'Mumbai', salary: '12-20 LPA', level: 'Graduate', posted: '1 week ago', link: '#' },
];

const artsJobs: Job[] = [
  { title: 'Civil Services (IAS)', company: 'UPSC', logo: '🏛️', type: 'FULL-TIME', location: 'All India', salary: 'Grade A Pay Scale', level: 'Graduate', posted: 'Annual', link: '#' },
  { title: 'State PCS', company: 'State Govt', logo: '🏛️', type: 'FULL-TIME', location: 'State Level', salary: '₹44,900+', level: 'Graduate', posted: 'Annual', link: '#' },
  { title: 'SSC CGL', company: 'SSC', logo: '🏛️', type: 'FULL-TIME', location: 'All India', salary: '₹25,500-₹81,100', level: 'Graduate', posted: '2 weeks ago', link: '#' },
];

export default function Jobs() {
  const { domain, user, tasksDone } = useStationStore();
  const isHi = useStationStore(s => s.language) === 'hi';
  const [filter, setFilter] = useState<JobType>('all');
  const [search, setSearch] = useState('');

  const allJobs = domain === 'engineering' ? engineeringJobs : domain === 'commerce' ? commerceJobs : artsJobs;

  const calcMatch = () => {
    const baseIQ = user?.personalityScore?.iq || 30;
    const weakCount = user?.weakPoints?.length || 0;
    return Math.min(90, Math.max(10, Math.round(baseIQ * 0.4 + tasksDone * 0.5 - weakCount * 3)));
  };

  const match = calcMatch();

  const filtered = allJobs.filter(j => {
    if (filter === 'full-time' && j.type !== 'FULL-TIME') return false;
    if (filter === 'internship' && j.type !== 'INTERNSHIP') return false;
    if (search && !j.title.toLowerCase().includes(search.toLowerCase()) && !j.company.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-5xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">{isHi ? 'नौकरी के अवसर' : 'Job Opportunities'}</h1>
        <p className="text-sm text-muted-foreground">{isHi ? 'अपने कौशल और तैयारी के अनुसार भूमिकाएं खोजें' : 'Discover roles tailored to your skills and preparation level.'}</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={isHi ? 'शीर्षक या कंपनी द्वारा खोजें...' : 'Search by title or company...'}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {([['all', isHi ? 'सभी' : 'All'], ['full-time', isHi ? 'पूर्णकालिक' : 'Full-time'], ['internship', isHi ? 'इंटर्नशिप' : 'Internship']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key as JobType)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${filter === key ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Job Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map((job, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border p-6 hover:border-accent/50 transition-all">
            <div className="flex items-start gap-4 mb-4">
              <span className="text-3xl">{job.logo}</span>
              <div className="flex-1">
                <h3 className="font-bold">{job.title}</h3>
                <p className="text-xs text-muted-foreground">{job.company}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                job.type === 'FULL-TIME' ? 'bg-muted text-foreground' : 'bg-accent/10 text-accent'
              }`}>{job.type}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
              <div className="flex items-center gap-1 text-muted-foreground"><MapPin className="w-3 h-3" /> {job.location}</div>
              <div className="flex items-center gap-1 text-accent font-medium"><DollarSign className="w-3 h-3" /> {job.salary}</div>
              <div className="flex items-center gap-1 text-muted-foreground"><Briefcase className="w-3 h-3" /> {job.level}</div>
              <div className="flex items-center gap-1 text-muted-foreground"><Clock className="w-3 h-3" /> {job.posted}</div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">
                <span>{isHi ? 'पात्रता मैच' : 'Eligibility Match'}</span>
                <span className={match < 40 ? 'text-destructive' : match < 70 ? 'text-muted-foreground' : 'text-accent'}>{match}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${match < 40 ? 'bg-destructive' : match < 70 ? 'bg-accent' : 'bg-accent'}`}
                  style={{ width: `${match}%` }} />
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:border-accent/50 transition-all">
                {isHi ? 'विवरण देखें' : 'View Details'}
              </button>
              <button className="flex-1 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover:scale-[1.02] transition-transform">
                {isHi ? 'आवेदन करें' : 'Apply Now'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">{isHi ? 'कोई नौकरी नहीं मिली' : 'No jobs found matching your criteria'}</p>
        </div>
      )}
    </div>
  );
}
