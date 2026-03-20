import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import BrahmaCard from '../components/BrahmaCard';
import ChakraPillar from '../components/ChakraPillar';
import CosmosBackground from '../components/CosmosBackground';
import FlameGraph from '../components/FlameGraph';
import KarmaTask from '../components/KarmaTask';
import MandalaScore from '../components/MandalaScore';
import { colors } from '../constants/colors';
import { CINZEL, CORMORANT, CORMORANT_ITALIC, DM_MEDIUM } from '../constants/fonts';
import { LifeScore, Task } from '../constants/types';
import { useAuthContext } from '../context/AuthContext';
import useLifeScore from '../hooks/useLifeScore';
import { calculateLifeScore } from '../lib/scoreEngine';
import {
  getDailyLog,
  getFinanceLog,
  getLatestDailyLog,
  getMilestones,
  getTasks,
  saveLifeScore,
  saveTasks,
  updateTask,
} from '../lib/supabase';
import { generateDailyTasks } from '../lib/taskGenerator';

const FLAME_DATA = [
  { day: 'Mon', score: 58 },
  { day: 'Tue', score: 62 },
  { day: 'Wed', score: 56 },
  { day: 'Thu', score: 64 },
  { day: 'Fri', score: 63 },
  { day: 'Sat', score: 65 },
  { day: 'Today', score: 68 },
];

const FALLBACK_SCORE: LifeScore = {
  discipline: 55,
  health: 55,
  finance: 55,
  growth: 55,
  total: 55,
  label: 'Building',
  labelSanskrit: '\u0928\u093f\u0930\u094d\u092e\u093e\u0923',
  streak: 0,
  change: 0,
  lastUpdated: new Date(),
};

const getTodayIso = (): string => new Date().toISOString().slice(0, 10);
const getMonthKey = (): string => new Date().toISOString().slice(0, 7);

const formatDateTitle = (): string =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
    .format(new Date())
    .toUpperCase();

export default function HomeScreen() {
  const { user, profile } = useAuthContext();
  const { lifeScore: hookScore, refresh: refreshLifeScore } = useLifeScore(user?.uid ?? null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lifeScore, setLifeScore] = useState<LifeScore | null>(hookScore);
  const [loading, setLoading] = useState<boolean>(true);

  const score = lifeScore ?? hookScore ?? FALLBACK_SCORE;

  const syncTodayData = useCallback(async (): Promise<void> => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const today = getTodayIso();
    const month = getMonthKey();

    let todayTasks = await getTasks(user.uid, today);
    if (todayTasks.length === 0) {
      const latestForGeneration = (await getLatestDailyLog(user.uid, today)) ?? FALLBACK_SCORE;
      const generated = generateDailyTasks(latestForGeneration);
      await saveTasks(user.uid, today, generated);
      todayTasks = await getTasks(user.uid, today);
    }

    setTasks(todayTasks);

    let todayScore = await getDailyLog(user.uid, today);
    if (!todayScore) {
      const previousLog = await getLatestDailyLog(user.uid, today);
      const finance = await getFinanceLog(user.uid, month);
      const milestones = await getMilestones(user.uid);

      const tasksCompleted = todayTasks.filter((task) => task.completed).length;
      const tasksTotal = todayTasks.length;
      const milestonesThisWeek = milestones.filter((milestone) => {
        const achieved = new Date(milestone.date);
        return Date.now() - achieved.getTime() <= 7 * 86400000;
      }).length;

      const computed = calculateLifeScore(
        {
          tasksCompleted,
          tasksTotal,
          streakDays: previousLog?.streak ?? 0,
          circleCheckinRate: tasksTotal > 0 ? tasksCompleted / tasksTotal : 0,
        },
        {
          sleepHours: 7,
          sleepConsistency: true,
          movementLogged: todayTasks.some((task) => task.pillar === 'health' && task.completed),
          daysSinceLastLog: previousLog ? 0 : 1,
        },
        {
          needsAmount: finance?.needs ?? 0,
          wantsAmount: finance?.wants ?? 0,
          wasteAmount: finance?.waste ?? 0,
          totalAmount: finance?.total ?? 0,
          savingsGoalsOnTrack: 0,
          totalSavingsGoals: 0,
          cleanDaysStreak: finance && finance.waste === 0 ? 1 : 0,
        },
        {
          learningLoggedToday: todayTasks.some(
            (task) => task.pillar === 'growth' && task.completed
          ),
          milestonesHitThisWeek: milestonesThisWeek,
          reflectionEntries: todayTasks.some((task) => task.pillar === 'growth') ? 1 : 0,
        },
        previousLog ? previousLog.streak + (tasksCompleted > 0 ? 1 : 0) : tasksCompleted > 0 ? 1 : 0,
        previousLog?.total
      );

      await saveLifeScore(user.uid, computed);
      todayScore = computed;
    }

    setLifeScore(todayScore);
    await refreshLifeScore();
    setLoading(false);
  }, [refreshLifeScore, user?.uid]);

  React.useEffect(() => {
    void syncTodayData();
  }, [syncTodayData]);

  const handleToggleTask = (id: string): void => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    );

    const target = tasks.find((task) => task.id === id);
    if (!target) {
      return;
    }

    void (async () => {
      await updateTask(id, !target.completed);
      await syncTodayData();
    })();
  };

  return (
    <SafeAreaView style={styles.root}>
      <CosmosBackground />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.dateText}>{formatDateTitle()}</Text>
            <Text style={styles.greetText}>Namaste, {profile?.name ?? 'Sadhak'}</Text>
          </View>

          <View style={styles.avatarCircle}>
            <Text style={styles.avatar}>{profile?.emoji ?? '\u{1F9D8}'}</Text>
          </View>
        </View>

        <View style={styles.scoreCard}>
          <View style={styles.scoreGlow} />

          <MandalaScore score={score.total} size={160} />

          <View style={styles.scoreCopy}>
            <Text style={styles.scoreLabel}>{score.label}</Text>
            <Text style={styles.scoreChange}>
              {score.change >= 0 ? '\u2191' : '\u2193'} {Math.abs(score.change)} from yesterday
            </Text>
            <Text style={styles.insightQuote}>
              Yoga is excellence in action. Your mornings now carry real tapas.
            </Text>

            <View style={styles.streakPill}>
              <Text style={styles.streakText}>{"\u{1F525}"} {score.streak} Day Agni Streak</Text>
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillarRow}
        >
          <ChakraPillar pillar="discipline" score={score.discipline} />
          <ChakraPillar pillar="health" score={score.health} />
          <ChakraPillar pillar="finance" score={score.finance} />
          <ChakraPillar pillar="growth" score={score.growth} />
        </ScrollView>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>YAGNA GRAPH</Text>
          <FlameGraph data={FLAME_DATA} activeTab="7D" />
        </View>

        <BrahmaCard
          type="insight"
          icon={'\u{1F531}'}
          label="BRAHMA INSIGHT"
          text="Your strongest window remains 9–11 AM. Guard it like sacred fire, and do your hardest karma there."
        />

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>TODAY'S DHARMA</Text>
          <Text style={styles.sectionAction}>AI Generated</Text>
        </View>

        <View style={styles.card}>
          {loading ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator color={colors.gold} />
              <Text style={styles.loaderText}>Syncing your daily dharma...</Text>
            </View>
          ) : tasks.length === 0 ? (
            <Text style={styles.loaderText}>No tasks found for today.</Text>
          ) : (
            tasks.map((task) => (
              <KarmaTask key={task.id} task={task} onToggle={handleToggleTask} />
            ))
          )}
        </View>

        <TouchableOpacity activeOpacity={0.9} style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 36,
    zIndex: 1,
  },
  headerRow: {
    marginTop: 4,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontFamily: CINZEL,
    fontSize: 11,
    color: colors.white3,
    letterSpacing: 1,
    marginBottom: 4,
  },
  greetText: {
    fontFamily: CINZEL,
    fontSize: 18,
    color: colors.white,
    letterSpacing: 1,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.border2,
    backgroundColor: colors.golddim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    fontSize: 20,
  },
  scoreCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(17,22,32,0.86)',
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
  },
  scoreGlow: {
    position: 'absolute',
    top: -70,
    right: -70,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.goldglow,
    opacity: 0.45,
  },
  scoreCopy: {
    flex: 1,
  },
  scoreLabel: {
    fontFamily: CORMORANT_ITALIC,
    fontSize: 22,
    color: colors.gold2,
    marginBottom: 4,
  },
  scoreChange: {
    fontFamily: DM_MEDIUM,
    fontSize: 13,
    color: colors.green,
    marginBottom: 8,
  },
  insightQuote: {
    fontFamily: CORMORANT_ITALIC,
    fontSize: 14,
    color: colors.white2,
    lineHeight: 22,
    marginBottom: 12,
  },
  streakPill: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border2,
    backgroundColor: colors.golddim,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  streakText: {
    fontFamily: CINZEL,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.gold,
  },
  pillarRow: {
    gap: 10,
    paddingBottom: 2,
    marginBottom: 14,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(17,22,32,0.82)',
    padding: 18,
    marginBottom: 14,
  },
  cardLabel: {
    fontFamily: CINZEL,
    fontSize: 9,
    letterSpacing: 2,
    color: colors.white3,
    marginBottom: 14,
  },
  sectionHead: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: CINZEL,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.white,
  },
  sectionAction: {
    fontFamily: CORMORANT,
    fontSize: 13,
    color: colors.gold,
  },
  loaderWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  loaderText: {
    fontFamily: CORMORANT,
    fontSize: 14,
    color: colors.white3,
  },
  bottomSpacer: {
    height: 10,
  },
});
