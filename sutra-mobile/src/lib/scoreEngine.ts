import { LifeScore } from '../constants/types';

export interface DisciplineInputs {
  tasksCompleted: number;
  tasksTotal: number;
  streakDays: number;
  circleCheckinRate: number;
}

export interface HealthInputs {
  sleepHours: number;
  sleepConsistency: boolean;
  movementLogged: boolean;
  daysSinceLastLog: number;
}

export interface FinanceInputs {
  needsAmount: number;
  wantsAmount: number;
  wasteAmount: number;
  totalAmount: number;
  savingsGoalsOnTrack: number;
  totalSavingsGoals: number;
  cleanDaysStreak: number;
}

export interface GrowthInputs {
  learningLoggedToday: boolean;
  milestonesHitThisWeek: number;
  reflectionEntries: number;
}

export function calcDiscipline(inputs: DisciplineInputs): number {
  const taskRatio =
    inputs.tasksTotal > 0 ? (inputs.tasksCompleted / inputs.tasksTotal) * 60 : 0;
  const streakBonus = Math.min(25, Math.log(inputs.streakDays + 1) * 10);
  const circleBonus = inputs.circleCheckinRate * 15;
  return Math.min(100, Math.round(taskRatio + streakBonus + circleBonus));
}

export function calcHealth(inputs: HealthInputs): number {
  const sleepOptimal = inputs.sleepHours >= 6 && inputs.sleepHours <= 8;
  const sleepScore = sleepOptimal
    ? 50
    : Math.max(0, 50 - Math.abs(inputs.sleepHours - 7) * 10);
  const consistencyBonus = inputs.sleepConsistency ? 15 : 0;
  const movementScore = inputs.movementLogged ? 30 : 0;
  const decay = Math.min(30, inputs.daysSinceLastLog * 5);

  return Math.max(
    0,
    Math.min(100, Math.round(sleepScore + consistencyBonus + movementScore - decay))
  );
}

export function calcFinance(inputs: FinanceInputs): number {
  const wastePercent =
    inputs.totalAmount > 0 ? inputs.wasteAmount / inputs.totalAmount : 0;
  const wasteScore = (1 - wastePercent) * 50;
  const savingsRate =
    inputs.totalSavingsGoals > 0
      ? inputs.savingsGoalsOnTrack / inputs.totalSavingsGoals
      : 0;
  const savingsScore = savingsRate * 30;
  const cleanBonus = Math.min(20, inputs.cleanDaysStreak * 2);

  return Math.min(100, Math.round(wasteScore + savingsScore + cleanBonus));
}

export function calcGrowth(inputs: GrowthInputs): number {
  const learningScore = inputs.learningLoggedToday ? 40 : 0;
  const milestoneScore = Math.min(40, inputs.milestonesHitThisWeek * 10);
  const reflectionScore = Math.min(20, inputs.reflectionEntries * 5);

  return Math.min(100, Math.round(learningScore + milestoneScore + reflectionScore));
}

export function getScoreLabel(score: number): { label: string; sanskrit: string } {
  if (score >= 93) return { label: 'Legendary', sanskrit: 'महान' };
  if (score >= 81) return { label: 'Elite', sanskrit: 'श्रेष्ठ' };
  if (score >= 66) return { label: 'Disciplined', sanskrit: 'अनुशासित' };
  if (score >= 41) return { label: 'Building', sanskrit: 'निर्माण' };
  return { label: 'Rebuilding', sanskrit: 'पुनर्निर्माण' };
}

export function getDailyDecay(lastLogDate: Date): number {
  const daysDiff = Math.floor((Date.now() - lastLogDate.getTime()) / 86400000);
  return daysDiff >= 2 ? Math.min(15, (daysDiff - 1) * 3) : 0;
}

export function getPillarColor(pillar: string): string {
  const map: Record<string, string> = {
    discipline: '#D4A853',
    health: '#52C97A',
    finance: '#4E8FD4',
    growth: '#7B5EA7',
  };

  return map[pillar] ?? '#D4A853';
}

export function calculateLifeScore(
  discipline: DisciplineInputs,
  health: HealthInputs,
  finance: FinanceInputs,
  growth: GrowthInputs,
  streak: number,
  previousScore?: number
): LifeScore {
  const d = calcDiscipline(discipline);
  const h = calcHealth(health);
  const f = calcFinance(finance);
  const g = calcGrowth(growth);
  const decay = getDailyDecay(new Date());

  const rawTotal = d * 0.35 + h * 0.25 + f * 0.2 + g * 0.2;
  const total = Math.max(0, Math.min(100, Math.round(rawTotal - decay)));
  const { label, sanskrit } = getScoreLabel(total);

  return {
    discipline: d,
    health: h,
    finance: f,
    growth: g,
    total,
    label,
    labelSanskrit: sanskrit,
    streak,
    change: previousScore ? total - previousScore : 0,
    lastUpdated: new Date(),
  };
}
