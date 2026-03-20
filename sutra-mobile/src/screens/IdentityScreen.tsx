import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import CosmosBackground from '../components/CosmosBackground';
import { colors } from '../constants/colors';
import { CINZEL, CORMORANT, CORMORANT_ITALIC, DM } from '../constants/fonts';
import { LifeScore, Milestone } from '../constants/types';
import { useAuthContext } from '../context/AuthContext';
import useLifeScore from '../hooks/useLifeScore';
import { getMilestones } from '../lib/supabase';

interface PillarTile {
  key: 'discipline' | 'health' | 'finance' | 'growth';
  label: string;
  score: number;
  color: string;
}

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

const FALLBACK_MILESTONES: Milestone[] = [
  {
    id: 'm1',
    icon: '\u{1F525}',
    title: '12-Day Agni Streak',
    date: 'Personal best \u00b7 Today',
    type: 'streak',
  },
  {
    id: 'm2',
    icon: '\u{1F4B0}',
    title: 'Artha \u2014 7 Days Clean',
    date: 'March 11-18',
    type: 'finance',
  },
  {
    id: 'm3',
    icon: '\u26A1',
    title: 'First Score Above 65',
    date: 'March 10',
    type: 'score',
  },
  {
    id: 'm4',
    icon: '\u{1FAB7}',
    title: '30-Day Sadhak',
    date: 'February 2025',
    type: 'journey',
  },
  {
    id: 'm5',
    icon: '\u25CE',
    title: 'First Circle Created',
    date: 'February 15',
    type: 'circles',
  },
];

const getDayCount = (joinedDate: string | undefined, fallback: number | undefined): number => {
  if (typeof fallback === 'number' && fallback > 0) {
    return fallback;
  }

  if (!joinedDate) {
    return 1;
  }

  const parsed = new Date(joinedDate);

  if (Number.isNaN(parsed.getTime())) {
    return 1;
  }

  const diff = Date.now() - parsed.getTime();
  const days = Math.floor(diff / 86400000) + 1;

  return Math.max(1, days);
};

const formatMilestoneDate = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed);
};

export default function IdentityScreen() {
  const { user, profile } = useAuthContext();
  const { lifeScore } = useLifeScore(user?.uid ?? null);
  const [milestones, setMilestones] = useState<Milestone[]>(FALLBACK_MILESTONES);
  const milestoneAnimValues = useRef<Animated.Value[]>([]);

  const activeScore = lifeScore ?? FALLBACK_SCORE;

  const pillars: PillarTile[] = useMemo(
    () => [
      { key: 'discipline', label: 'Tapas', score: activeScore.discipline, color: colors.gold },
      { key: 'health', label: 'Arogya', score: activeScore.health, color: colors.green },
      { key: 'finance', label: 'Artha', score: activeScore.finance, color: colors.blue },
      { key: 'growth', label: 'Vidya', score: activeScore.growth, color: colors.sacred },
    ],
    [activeScore.discipline, activeScore.finance, activeScore.growth, activeScore.health]
  );

  const userName = profile?.name ?? 'Sadhak';
  const userEmoji = profile?.emoji ?? '\u{1F9D8}';
  const dayCount = useMemo(
    () => getDayCount(profile?.joinedDate, profile?.dayCount),
    [profile?.dayCount, profile?.joinedDate]
  );

  const loadMilestones = useCallback(async (): Promise<void> => {
    if (!user?.uid) {
      setMilestones(FALLBACK_MILESTONES);
      return;
    }

    const dbMilestones = await getMilestones(user.uid);
    if (dbMilestones.length === 0) {
      setMilestones(FALLBACK_MILESTONES);
      return;
    }

    setMilestones(dbMilestones);
  }, [user?.uid]);

  useEffect(() => {
    void loadMilestones();
  }, [loadMilestones]);

  useEffect(() => {
    milestoneAnimValues.current = milestones.map(
      (_, index) => milestoneAnimValues.current[index] ?? new Animated.Value(0)
    );

    milestoneAnimValues.current.forEach((anim) => anim.setValue(0));

    const sequence = Animated.stagger(
      80,
      milestoneAnimValues.current.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true,
        })
      )
    );

    sequence.start();
  }, [milestones]);

  const completionRatio = milestones.length > 0 ? Math.min(99, 70 + milestones.length * 3) : 82;

  return (
    <SafeAreaView style={styles.root}>
      <CosmosBackground />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['rgba(212,168,83,0.20)', 'rgba(123,94,167,0.20)', 'rgba(17,22,32,0.92)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroLeft}>
            <View style={styles.avatarGlowWrap}>
              <Text style={styles.avatar}>{userEmoji}</Text>
            </View>

            <Text style={styles.name}>{userName}</Text>
            <Text style={styles.subtitle}>
              {`\u0938\u093e\u0927\u0915 \u2014 Seeker \u00b7 Day ${dayCount.toString()}`}
            </Text>
          </View>

          <View style={styles.heroRight}>
            <Text style={styles.heroScore}>{activeScore.total}</Text>
            <Text style={styles.heroLabel}>{activeScore.label}</Text>
          </View>
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>CHAKRA BALANCE</Text>

          <View style={styles.pillarGrid}>
            {pillars.map((pillar) => (
              <View key={pillar.key} style={styles.pillarCell}>
                <Text style={[styles.pillarScore, { color: pillar.color }]}>{pillar.score}</Text>
                <Text style={styles.pillarName}>{pillar.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>REPUTATION</Text>

          <View style={styles.repRow}>
            <Text style={styles.repLabel}>Trust Score</Text>
            <Text style={styles.repValue}>{Math.max(50, Math.min(99, Math.round(activeScore.total + 16)))}</Text>
          </View>

          <View style={styles.repRow}>
            <Text style={styles.repLabel}>Check-in Reliability</Text>
            <Text style={styles.repValue}>{Math.max(60, Math.min(99, completionRatio)).toString()}%</Text>
          </View>

          <View style={styles.repRow}>
            <Text style={styles.repLabel}>Karma Completion</Text>
            <Text style={styles.repValue}>{Math.max(55, Math.min(98, activeScore.discipline)).toString()}%</Text>
          </View>

          <View style={styles.repRow}>
            <Text style={styles.repLabel}>Active Circles</Text>
            <Text style={styles.repValue}>1</Text>
          </View>

          <View style={styles.repRowLast}>
            <Text style={styles.repLabel}>Days on SUTRA</Text>
            <Text style={styles.repValue}>{dayCount.toString()}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{`MILESTONES — \u0909\u092a\u0932\u092c\u094d\u0927\u093f\u092f\u093e\u0901`}</Text>

        {milestones.map((milestone, index) => {
          const animation = milestoneAnimValues.current[index] ?? new Animated.Value(1);

          return (
            <Animated.View
              key={milestone.id}
              style={[
                styles.milestoneCard,
                {
                  opacity: animation,
                  transform: [
                    {
                      translateY: animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.milestoneIcon}>{milestone.icon}</Text>

              <View style={styles.milestoneCopy}>
                <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                <Text style={styles.milestoneDate}>{formatMilestoneDate(milestone.date)}</Text>
              </View>
            </Animated.View>
          );
        })}

        <View style={styles.footerSpace} />
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
    zIndex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 34,
  },
  heroCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border2,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroLeft: {
    flex: 1,
  },
  avatarGlowWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: colors.gold,
    backgroundColor: colors.golddim,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.gold,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 14,
    elevation: 8,
    marginBottom: 10,
  },
  avatar: {
    fontSize: 38,
  },
  name: {
    fontFamily: CINZEL,
    fontSize: 26,
    letterSpacing: 2,
    color: colors.white,
  },
  subtitle: {
    marginTop: 3,
    fontFamily: CORMORANT_ITALIC,
    fontSize: 16,
    color: colors.white2,
  },
  heroRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  heroScore: {
    fontFamily: CINZEL,
    fontSize: 68,
    lineHeight: 70,
    color: colors.gold,
    textShadowColor: 'rgba(212,168,83,0.40)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  heroLabel: {
    marginTop: 2,
    fontFamily: CORMORANT_ITALIC,
    fontSize: 16,
    color: colors.white3,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(17,22,32,0.82)',
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: CINZEL,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.gold,
    marginBottom: 12,
  },
  pillarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  pillarCell: {
    width: '50%',
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  pillarScore: {
    fontFamily: CINZEL,
    fontSize: 30,
    lineHeight: 32,
  },
  pillarName: {
    marginTop: 2,
    fontFamily: CORMORANT,
    fontSize: 16,
    color: colors.white2,
  },
  repRow: {
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  repRowLast: {
    paddingTop: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  repLabel: {
    fontFamily: CORMORANT,
    fontSize: 17,
    color: colors.white2,
  },
  repValue: {
    fontFamily: CINZEL,
    fontSize: 18,
    color: colors.gold,
  },
  sectionTitle: {
    fontFamily: CINZEL,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.white,
    marginTop: 4,
    marginBottom: 10,
  },
  milestoneCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(17,22,32,0.8)',
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  milestoneIcon: {
    fontSize: 26,
  },
  milestoneCopy: {
    flex: 1,
  },
  milestoneTitle: {
    fontFamily: CORMORANT,
    fontSize: 20,
    color: colors.white,
  },
  milestoneDate: {
    marginTop: 2,
    fontFamily: DM,
    fontSize: 12,
    color: colors.white3,
  },
  footerSpace: {
    height: 8,
  },
});

