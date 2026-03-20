import {
  Circle,
  FinanceLog,
  Insight,
  LifeScore,
  Milestone,
  SavingsGoal,
  Task,
} from "./types";

export const mockLifeScore: LifeScore = {
  discipline: 72,
  health: 58,
  finance: 74,
  growth: 63,
  total: 68,
  label: "Disciplined",
  labelSanskrit: "\u0905\u0928\u0941\u0936\u093e\u0938\u093f\u0924",
  streak: 12,
};

export const mockTrendData = [
  { day: "Mon", score: 58 },
  { day: "Tue", score: 62 },
  { day: "Wed", score: 57 },
  { day: "Thu", score: 64 },
  { day: "Fri", score: 66 },
  { day: "Sat", score: 65 },
  { day: "Today", score: 68 },
];

export const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Deep work block \u2014 90 minutes",
    pillar: "discipline",
    completed: true,
    meta: "Brahma muhurta focus slot",
  },
  {
    id: "task-2",
    title: "Evening walk and breath reset",
    pillar: "health",
    completed: false,
    meta: "20 min movement \u00b7 nasal breathing",
  },
  {
    id: "task-3",
    title: "Review spending ledger",
    pillar: "finance",
    completed: false,
    meta: "Classify needs / wants / waste",
  },
  {
    id: "task-4",
    title: "Read 15 pages with reflection",
    pillar: "growth",
    completed: false,
    meta: "Vidy\u0101 ritual before sleep",
  },
];

export const mockInsights: Insight[] = [
  {
    id: "insight-1",
    type: "pattern",
    title: "You peak between 9\u201311 AM",
    description: "Your brahma muhurta \u2014 three weeks confirm this.",
    pillar: "Tapas",
    icon: "\u26a1",
  },
  {
    id: "insight-2",
    type: "risk",
    title: "The body is sending a warning",
    description: "Three nights poor sleep. Restore tonight.",
    pillar: "\u0100rogya",
    icon: "\u26a0\ufe0f",
  },
  {
    id: "insight-3",
    type: "win",
    title: "Seven days of financial dharma",
    description: "Zero waste spending. Arthashastra wisdom in action.",
    pillar: "Artha",
    icon: "\u2705",
  },
  {
    id: "insight-4",
    type: "focus",
    title: "Knowledge is being neglected",
    description: "Vidy\u0101 \u2014 20 minutes daily transforms growth.",
    pillar: "Vidy\u0101",
    icon: "\u{1FAB7}",
  },
];

export const mockCircles: Circle[] = [
  {
    id: "circle-1",
    name: "Warriors",
    avgScore: 71,
    daysTogether: 84,
    members: [
      {
        id: "m-1",
        name: "Arjun",
        emoji: "\u{1F9D8}",
        role: "Lead Sadhak",
        streak: 12,
        checkedIn: true,
        trustScore: 91,
        lifeScore: 68,
      },
      {
        id: "m-2",
        name: "Nikhil",
        emoji: "\u{1F9D4}",
        role: "Tapas Keeper",
        streak: 9,
        checkedIn: true,
        trustScore: 84,
        lifeScore: 72,
      },
      {
        id: "m-3",
        name: "Ananya",
        emoji: "\u{1F98A}",
        role: "Arogya Guide",
        streak: -1,
        checkedIn: false,
        trustScore: 48,
        lifeScore: 42,
      },
    ],
  },
];

export const mockFinanceLog: FinanceLog = {
  needs: 24000,
  wants: 9800,
  waste: 4200,
  total: 38000,
  month: "March 2026",
  score: 74,
};

export const mockSavingsGoals: SavingsGoal[] = [
  { id: "goal-1", title: "Emergency Fund", saved: 65000, target: 120000 },
  { id: "goal-2", title: "Laptop Upgrade", saved: 28000, target: 60000 },
  { id: "goal-3", title: "Pilgrimage Reserve", saved: 12000, target: 50000 },
];

export const mockMilestones: Milestone[] = [
  { id: "mile-1", icon: "\u{1F525}", title: "12-Day Agni Streak", date: "Personal best \u00b7 Today" },
  { id: "mile-2", icon: "\u{1F4B0}", title: "Artha \u2014 7 Days Clean", date: "March 11-18" },
  { id: "mile-3", icon: "\u26a1", title: "First Score Above 65", date: "March 10" },
  { id: "mile-4", icon: "\u{1FAB7}", title: "30-Day Sadhak", date: "February 2025" },
  { id: "mile-5", icon: "\u25ce", title: "First Circle Created", date: "February 15" },
];
