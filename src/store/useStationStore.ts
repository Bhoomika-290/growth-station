import { create } from 'zustand';

export type Domain = 'engineering' | 'commerce' | 'arts';
export type ThemeOption = 'engineering' | 'commerce' | 'arts' | 'violet' | 'forest' | 'mocha';

interface UserProfile {
  name: string;
  state: string;
  city: string;
  college: string;
  domain: Domain;
  specialization: string;
  year: string;
  dreamCompany: string;
  targetSalary: string;
  timeline: string;
  personalityScore: { iq: number; eq: number; rq: number };
}

interface StationState {
  domain: Domain;
  theme: ThemeOption;
  isLoggedIn: boolean;
  user: UserProfile | null;
  rank: number;
  totalStudents: number;
  streak: number;
  tasksDone: number;
  focusMinutes: number;
  weeklyGoalProgress: number;

  setDomain: (d: Domain) => void;
  setTheme: (t: ThemeOption) => void;
  login: (user: UserProfile) => void;
  logout: () => void;
  boostRank: (amount: number) => void;
  completeTask: () => void;
  addFocusMinutes: (m: number) => void;
}

export const useStationStore = create<StationState>((set) => ({
  domain: 'engineering',
  theme: 'engineering',
  isLoggedIn: false,
  user: null,
  rank: 1247,
  totalStudents: 5000,
  streak: 7,
  tasksDone: 23,
  focusMinutes: 0,
  weeklyGoalProgress: 62,

  setDomain: (domain) => set({ domain, theme: domain }),
  setTheme: (theme) => set({ theme }),
  login: (user) => set({ isLoggedIn: true, user, domain: user.domain, theme: user.domain }),
  logout: () => set({ isLoggedIn: false, user: null }),
  boostRank: (amount) => set((s) => ({ rank: Math.max(1, s.rank - amount) })),
  completeTask: () => set((s) => ({ tasksDone: s.tasksDone + 1, weeklyGoalProgress: Math.min(100, s.weeklyGoalProgress + 5) })),
  addFocusMinutes: (m) => set((s) => ({ focusMinutes: s.focusMinutes + m })),
}));

// Domain content configurations
export const domainConfig = {
  engineering: {
    label: 'Engineering',
    tag: 'TECH',
    affirmation: '"The engineer who solves today\'s problem builds tomorrow\'s infrastructure."',
    quizTypes: ['Rapid Fire', 'Code Debug', 'System Design', 'Aptitude', 'Placement Guarantee'],
    quizPopupOptions: ['Data Structures & Algorithms', 'System Design', 'Operating Systems', 'Database Management', 'Web Development'],
    todoItems: ['Solve 5 DSA problems on Arrays', 'Watch System Design video — Load Balancers', 'Practice SQL joins — 10 queries', 'Read OS chapter on Process Scheduling'],
    vaultTopics: ['DSA', 'System Design', 'DBMS', 'Operating Systems', 'Networking', 'Web Dev'],
    socialFeed: [
      'Priya (TCS) moved to Top 5% in Mumbai',
      'Arjun cleared Infosys Round 2 from Pune',
      'Neha got placed at Wipro — 6.5 LPA from Bangalore',
    ],
    interviewText: 'Target companies hiring in your area: TCS, Infosys, Wipro, Cognizant, Accenture',
    weeklyTopics: ['Arrays & Hashing', 'Trees & Graphs', 'Dynamic Programming', 'System Design Basics', 'SQL & DBMS', 'OS Concepts', 'Mock Interview'],
    companies: ['TCS', 'Infosys', 'Wipro', 'Google', 'Microsoft', 'Amazon'],
  },
  commerce: {
    label: 'Commerce',
    tag: 'FINANCE',
    affirmation: '"In the world of finance, discipline is the currency that compounds."',
    quizTypes: ['Speed Mathematics', 'Case Study', 'Quantitative Analysis', 'Reasoning', 'Banking Guarantee'],
    quizPopupOptions: ['Quantitative Aptitude', 'Banking Awareness', 'Financial Statements', 'Reasoning Ability', 'Current Affairs'],
    todoItems: ['Practice 20 Quant problems — Profit & Loss', 'Read banking awareness — RBI policies', 'Solve reasoning puzzles — Seating arrangement', 'Review financial statements analysis'],
    vaultTopics: ['Quantitative Aptitude', 'Reasoning', 'Banking Awareness', 'Financial Analysis', 'Economics', 'Current Affairs'],
    socialFeed: [
      'Rohit cleared SBI PO Prelims from Delhi',
      'Anjali (IBPS Clerk) moved to Top 3% in Kolkata',
      'Vikram got selected for RBI Grade B from Chennai',
    ],
    interviewText: 'Upcoming bank exams: SBI PO, IBPS Clerk, RBI Grade B, NABARD',
    weeklyTopics: ['Number System', 'Profit & Loss', 'Data Interpretation', 'Syllogisms', 'Banking GK', 'English Grammar', 'Mock Test'],
    companies: ['SBI', 'HDFC Bank', 'ICICI', 'RBI', 'NABARD', 'Kotak'],
  },
  arts: {
    label: 'Arts',
    tag: 'CIVIL SERVICES',
    affirmation: '"A nation\'s strength lies in the clarity of its administrators."',
    quizTypes: ['Rapid Prelims', 'Essay Analysis', 'Current Affairs', 'Ethics & Integrity', 'UPSC Guarantee'],
    quizPopupOptions: ['Indian History', 'Indian Polity', 'Geography', 'Economy', 'Ethics & Governance'],
    todoItems: ['Read Laxmikanth Chapter 12 — Fundamental Rights', 'Write practice essay — Federalism', 'Current affairs — last 30 days review', 'Map work — Rivers of India'],
    vaultTopics: ['History', 'Polity', 'Geography', 'Economy', 'Ethics', 'Current Affairs'],
    socialFeed: [
      'Meera (IAS 2024) cleared Mains from Jaipur',
      'Suresh moved to Top 1% UPSC aspirants in Lucknow',
      'Kavita cleared IFS interview round from Bhopal',
    ],
    interviewText: 'UPSC Calendar: Prelims June, Mains September, Interview January',
    weeklyTopics: ['Ancient India', 'Indian Polity', 'Physical Geography', 'Indian Economy', 'Ethics Case Studies', 'Current Affairs', 'Answer Writing'],
    companies: ['IAS', 'IPS', 'IFS', 'IRS', 'IRTS', 'State PCS'],
  },
};
