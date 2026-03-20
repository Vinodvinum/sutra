import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import CosmosBackground from '../components/CosmosBackground';
import { colors } from '../constants/colors';
import { CINZEL, CORMORANT, CORMORANT_ITALIC } from '../constants/fonts';

type InsightKind = 'pattern' | 'risk' | 'win' | 'focus';

interface InsightItem {
  type: InsightKind;
  badge: string;
  title: string;
  description: string;
}

const INSIGHTS: InsightItem[] = [
  {
    type: 'pattern',
    badge: '⚡ PATTERN — TAPAS',
    title: 'You peak between 9–11 AM',
    description: 'Your brahma muhurta — three weeks confirm this.',
  },
  {
    type: 'risk',
    badge: '⚠️ RISK — ĀROGYA',
    title: 'The body is sending a warning',
    description: 'Three nights poor sleep. Restore tonight.',
  },
  {
    type: 'win',
    badge: '✅ VICTORY — ARTHA',
    title: 'Seven days of financial dharma',
    description: 'Zero waste spending. Arthashastra wisdom in action.',
  },
  {
    type: 'focus',
    badge: '🪷 FOCUS — VIDYĀ',
    title: 'Knowledge is being neglected',
    description: 'Vidyā — 20 minutes daily transforms growth.',
  },
];

const badgeColor = (type: InsightKind): string => {
  if (type === 'pattern') {
    return colors.gold;
  }

  if (type === 'risk') {
    return colors.red;
  }

  if (type === 'win') {
    return colors.green;
  }

  return colors.sacred;
};

const borderTint = (type: InsightKind): string => {
  if (type === 'pattern') {
    return `${colors.gold}44`;
  }

  if (type === 'risk') {
    return `${colors.red}44`;
  }

  if (type === 'win') {
    return `${colors.green}44`;
  }

  return `${colors.sacred}44`;
};

export default function IntelligenceScreen() {
  return (
    <SafeAreaView style={styles.root}>
      <CosmosBackground />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>INTELLIGENCE</Text>
          <Text style={styles.subtitle}>Brahmic wisdom</Text>
        </View>

        <LinearGradient
          colors={['rgba(212,168,83,0.10)', 'rgba(212,168,83,0.03)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.reportCard}
        >
          <Text style={styles.reportLabel}>WEEK 12 REPORT</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>68</Text>
              <Text style={styles.statText}>LIFE SCORE</Text>
              <Text style={styles.statUp}>↑ +5</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statNum}>84%</Text>
              <Text style={styles.statText}>KARMA DONE</Text>
              <Text style={styles.statUp}>↑ +11%</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statNum}>12d</Text>
              <Text style={styles.statText}>AGNI STREAK</Text>
              <Text style={styles.statDown}>↓ -</Text>
            </View>
          </View>
        </LinearGradient>

        <Text style={styles.sectionTitle}>BRAHMIC INSIGHTS</Text>

        {INSIGHTS.map((insight) => (
          <View
            key={insight.type}
            style={[styles.insightCard, { borderColor: borderTint(insight.type) }]}
          >
            <Text style={[styles.insightBadge, { color: badgeColor(insight.type) }]}>
              {insight.badge}
            </Text>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightText}>{insight.description}</Text>
          </View>
        ))}

        <View style={{ height: 8 }} />
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
  header: {
    marginBottom: 12,
  },
  title: {
    fontFamily: CINZEL,
    fontSize: 20,
    color: colors.white,
    letterSpacing: 2,
  },
  subtitle: {
    marginTop: 3,
    fontFamily: CORMORANT_ITALIC,
    fontSize: 14,
    color: colors.white3,
  },
  reportCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212,168,83,0.18)',
    backgroundColor: 'rgba(17,22,32,0.8)',
    padding: 18,
    marginBottom: 16,
  },
  reportLabel: {
    fontFamily: CINZEL,
    fontSize: 9,
    letterSpacing: 2,
    color: colors.gold,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontFamily: CINZEL,
    fontSize: 30,
    lineHeight: 34,
    color: colors.white,
    marginBottom: 4,
  },
  statText: {
    fontFamily: CINZEL,
    fontSize: 9,
    letterSpacing: 1,
    color: colors.white3,
    marginBottom: 3,
    textAlign: 'center',
  },
  statUp: {
    fontFamily: CORMORANT,
    fontSize: 11,
    color: colors.green,
  },
  statDown: {
    fontFamily: CORMORANT,
    fontSize: 11,
    color: colors.red,
  },
  sectionTitle: {
    fontFamily: CINZEL,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.gold,
    marginBottom: 10,
  },
  insightCard: {
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: 'rgba(17,22,32,0.8)',
    padding: 20,
    marginBottom: 12,
  },
  insightBadge: {
    fontFamily: CINZEL,
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  insightTitle: {
    fontFamily: CORMORANT,
    fontSize: 20,
    color: colors.white,
    marginBottom: 6,
  },
  insightText: {
    fontFamily: CORMORANT,
    fontSize: 14,
    color: colors.white2,
    lineHeight: 22,
  },
});
