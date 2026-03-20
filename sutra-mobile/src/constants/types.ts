export interface LifeScore {
  discipline: number;
  health: number;
  finance: number;
  growth: number;
  total: number;
  label: string;
  labelSanskrit: string;
  streak: number;
  change: number;
  lastUpdated: Date;
}

export interface Task {
  id: string;
  title: string;
  pillar: 'discipline' | 'health' | 'finance' | 'growth';
  completed: boolean;
  meta: string;
  aiGenerated: boolean;
  date: string;
}

export interface CircleMember {
  id: string;
  name: string;
  emoji: string;
  role: string;
  streak: number;
  checkedIn: boolean;
  trustScore: number;
  lifeScore: number;
}

export interface Circle {
  id: string;
  name: string;
  members: CircleMember[];
  avgScore: number;
  daysTogether: number;
  inviteCode: string;
}

export interface Insight {
  type: 'pattern' | 'risk' | 'win' | 'focus';
  pillar: string;
  title: string;
  description: string;
  icon: string;
}

export interface FinanceLog {
  needs: number;
  wants: number;
  waste: number;
  total: number;
  month: string;
  score: number;
}

export interface SavingsGoal {
  id: string;
  title: string;
  saved: number;
  target: number;
  currency: string;
}

export interface Milestone {
  id: string;
  icon: string;
  title: string;
  date: string;
  type: string;
}

export interface User {
  id: string;
  name: string;
  emoji: string;
  joinedDate: string;
  dayCount: number;
  goals: string[];
  selectedPillars: string[];
  onboardingComplete: boolean;
  baselineComplete: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
}
