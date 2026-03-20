import { LifeScore, Task } from '../constants/types';

type Pillar = Task['pillar'];

interface TaskTemplate {
  title: string;
  meta: string;
}

const DISCIPLINE_TEMPLATES: TaskTemplate[] = [
  {
    title: 'Deep work block — 90 minutes',
    meta: 'Tapas ritual: act without distraction (कर्मयोग).',
  },
  {
    title: 'Plan tomorrow before sleep',
    meta: 'Niyama rhythm: clarity before rest (नियम).',
  },
  {
    title: 'Complete one hard task first',
    meta: 'Agni principle: strongest karma at first light (अग्नि).',
  },
];

const HEALTH_TEMPLATES: TaskTemplate[] = [
  {
    title: 'Sleep before 11 PM',
    meta: 'Ārogya dharma: restore the body temple (आरोग्य).',
  },
  {
    title: '30-minute movement session',
    meta: 'Prāṇa flow: move with breath awareness (प्राण).',
  },
  {
    title: 'Hydration + sunlight check-in',
    meta: 'Sattva balance: light, water, and steadiness (सत्त्व).',
  },
];

const FINANCE_TEMPLATES: TaskTemplate[] = [
  {
    title: 'Log every spend today',
    meta: 'Artha discipline: awareness before desire (अर्थ).',
  },
  {
    title: 'No waste purchase for 24 hours',
    meta: 'Aparigraha: reduce excess and leakage (अपरिग्रह).',
  },
  {
    title: 'Move money to a savings goal',
    meta: 'Sanchaya practice: preserve and compound (संचय).',
  },
];

const GROWTH_TEMPLATES: TaskTemplate[] = [
  {
    title: 'Read 20 minutes and note one insight',
    meta: 'Vidyā ritual: study with reflection (विद्या).',
  },
  {
    title: 'Journal one lesson from today',
    meta: 'Svādhyāya: self-study sharpens awareness (स्वाध्याय).',
  },
  {
    title: 'Practice one focused skill block',
    meta: 'Abhyāsa: repetition creates mastery (अभ्यास).',
  },
];

const TEMPLATE_MAP: Record<Pillar, TaskTemplate[]> = {
  discipline: DISCIPLINE_TEMPLATES,
  health: HEALTH_TEMPLATES,
  finance: FINANCE_TEMPLATES,
  growth: GROWTH_TEMPLATES,
};

const createId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

const pickTemplates = (pillar: Pillar, count: number, offset: number): TaskTemplate[] => {
  const templates = TEMPLATE_MAP[pillar];
  const picked: TaskTemplate[] = [];

  for (let index = 0; index < count; index += 1) {
    picked.push(templates[(offset + index) % templates.length]);
  }

  return picked;
};

const getLowestPillar = (score: LifeScore): Pillar => {
  const ordered = [
    { pillar: 'discipline' as const, value: score.discipline },
    { pillar: 'health' as const, value: score.health },
    { pillar: 'finance' as const, value: score.finance },
    { pillar: 'growth' as const, value: score.growth },
  ].sort((a, b) => a.value - b.value);

  return ordered[0].pillar;
};

export function generateDailyTasks(lifeScore: LifeScore): Task[] {
  const date = new Date().toISOString().slice(0, 10);
  const lowest = getLowestPillar(lifeScore);
  const allPillars: Pillar[] = ['discipline', 'health', 'finance', 'growth'];
  const others = allPillars.filter((pillar) => pillar !== lowest);
  const seed = new Date().getDate();

  const tasks: Task[] = [];

  pickTemplates(lowest, 2, seed).forEach((template) => {
    tasks.push({
      id: createId(),
      title: template.title,
      pillar: lowest,
      completed: false,
      meta: template.meta,
      aiGenerated: true,
      date,
    });
  });

  others.forEach((pillar, index) => {
    const template = pickTemplates(pillar, 1, seed + index)[0];
    tasks.push({
      id: createId(),
      title: template.title,
      pillar,
      completed: false,
      meta: template.meta,
      aiGenerated: true,
      date,
    });
  });

  return tasks;
}
