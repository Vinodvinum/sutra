import { LifeScore, Task } from "./types";

const PILLAR_ORDER: Array<Task["pillar"]> = ["discipline", "health", "finance", "growth"];

interface TaskTemplate {
  title: string;
  meta: string;
}

const TEMPLATES: Record<Task["pillar"], TaskTemplate[]> = {
  discipline: [
    {
      title: "Deep work block - 90 minutes",
      meta: "Tapas (\u0924\u092a) - guard the morning karma window.",
    },
    {
      title: "No-distraction sprint before noon",
      meta: "Niyama - one sacred block without notifications.",
    },
    {
      title: "Evening planning ritual",
      meta: "Sankalpa - write tomorrow's first action clearly.",
    },
  ],
  health: [
    {
      title: "Sleep by your fixed cutoff time",
      meta: "\u0100rogya (\u0906\u0930\u094b\u0917\u094d\u092f) - protect circadian rhythm.",
    },
    {
      title: "20-minute movement session",
      meta: "Prana flow - walk, mobility, or yoga.",
    },
    {
      title: "Hydration + breath reset",
      meta: "Shuddhi - body clarity through small discipline.",
    },
  ],
  finance: [
    {
      title: "Log every expense today",
      meta: "Artha (\u0905\u0930\u094d\u0925) - awareness before judgment.",
    },
    {
      title: "Categorize spend: needs/wants/waste",
      meta: "Arthashastra lens - cut one waste trigger.",
    },
    {
      title: "Transfer to savings goal",
      meta: "Sanchaya - build reserve before discretionary spend.",
    },
  ],
  growth: [
    {
      title: "Read 20 minutes with notes",
      meta: "Vidy\u0101 (\u0935\u093f\u0926\u094d\u092f\u093e) grows by daily offering.",
    },
    {
      title: "Reflect in 5 lines before sleep",
      meta: "Svadhyaya - convert experience into wisdom.",
    },
    {
      title: "Learn one concept and teach it aloud",
      meta: "Jnana stabilizes when spoken and applied.",
    },
  ],
};

const getLowestPillar = (score: LifeScore): Task["pillar"] => {
  const values: Array<{ pillar: Task["pillar"]; value: number }> = [
    { pillar: "discipline", value: score.discipline },
    { pillar: "health", value: score.health },
    { pillar: "finance", value: score.finance },
    { pillar: "growth", value: score.growth },
  ];

  values.sort((left, right) => left.value - right.value);
  return values[0]?.pillar ?? "discipline";
};

const makeTaskId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const makeTask = (
  pillar: Task["pillar"],
  templateIndex: number,
  date: string,
  completed = false
): Task => {
  const templateSet = TEMPLATES[pillar];
  const template = templateSet[templateIndex % templateSet.length];

  return {
    id: makeTaskId(),
    title: template.title,
    pillar,
    completed,
    meta: template.meta,
    aiGenerated: true,
    date,
  };
};

export const generateDailyTasks = (lifeScore: LifeScore): Task[] => {
  const today = new Date().toISOString().slice(0, 10);
  const lowestPillar = getLowestPillar(lifeScore);

  const tasks: Task[] = [];
  tasks.push(makeTask(lowestPillar, 0, today));
  tasks.push(makeTask(lowestPillar, 1, today));

  PILLAR_ORDER.filter((pillar) => pillar !== lowestPillar).forEach((pillar, index) => {
    tasks.push(makeTask(pillar, index, today));
  });

  return tasks.slice(0, 5);
};

