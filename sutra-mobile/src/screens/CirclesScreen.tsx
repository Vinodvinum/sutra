import React from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import CosmosBackground from '../components/CosmosBackground';
import { colors } from '../constants/colors';
import { CINZEL, CORMORANT, CORMORANT_ITALIC, DM, DM_MEDIUM } from '../constants/fonts';
import { Circle, CircleMember } from '../constants/types';

const MOCK_CIRCLES: Circle[] = [
  {
    id: 'c1',
    name: 'Warriors ⚔️',
    avgScore: 68,
    daysTogether: 24,
    inviteCode: 'WG-241',
    members: [
      {
        id: 'm1',
        name: 'Arjun',
        emoji: '🧘',
        role: 'Sadhak',
        streak: 12,
        checkedIn: true,
        trustScore: 92,
        lifeScore: 68,
      },
      {
        id: 'm2',
        name: 'Mira',
        emoji: '🪷',
        role: 'Niyam Guardian',
        streak: 21,
        checkedIn: true,
        trustScore: 96,
        lifeScore: 74,
      },
      {
        id: 'm3',
        name: 'Dev',
        emoji: '🔥',
        role: 'Tapas Brother',
        streak: 7,
        checkedIn: false,
        trustScore: 61,
        lifeScore: 55,
      },
    ],
  },
  {
    id: 'c2',
    name: 'Rishi Circle 🕉️',
    avgScore: 72,
    daysTogether: 40,
    inviteCode: 'RS-108',
    members: [
      {
        id: 'm4',
        name: 'Ira',
        emoji: '🌿',
        role: 'Ārogya Keeper',
        streak: 18,
        checkedIn: true,
        trustScore: 84,
        lifeScore: 71,
      },
      {
        id: 'm5',
        name: 'Kabir',
        emoji: '💫',
        role: 'Artha Sentinel',
        streak: 4,
        checkedIn: false,
        trustScore: 58,
        lifeScore: 49,
      },
    ],
  },
];

const getTrustColor = (trustScore: number): string => {
  if (trustScore >= 80) {
    return colors.gold;
  }

  if (trustScore >= 60) {
    return colors.white2;
  }

  return colors.red;
};

const memberCountSanskrit = (count: number): string => `${count} सदस्य`;

const handleSupport = (): void => {
  Alert.alert('Dharma Support', 'Send a silent support signal to your circle?', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Send',
      style: 'destructive',
      onPress: () => {
        Alert.alert('Signal Sent', 'Your circle has been notified.');
      },
    },
  ]);
};

const renderMember = (member: CircleMember, index: number, isLast: boolean) => (
  <View key={`${member.id}-${index}`} style={[styles.memberRow, !isLast ? styles.memberDivider : null]}>
    <View style={styles.memberAvatar}>
      <Text style={styles.memberAvatarEmoji}>{member.emoji}</Text>
    </View>

    <View style={styles.memberNameWrap}>
      <Text style={styles.memberName}>{member.name}</Text>
      <Text style={styles.memberRole}>{member.role}</Text>
    </View>

    <Text style={styles.memberStreak}>{member.checkedIn ? `🔥 ${member.streak}d` : `💔 ${member.streak}d`}</Text>
    <Text style={styles.memberCheck}>{member.checkedIn ? '✅' : '❌'}</Text>
    <Text style={styles.memberScore}>{member.lifeScore}</Text>
    <Text style={[styles.memberTrust, { color: getTrustColor(member.trustScore) }]}>
      {member.trustScore}
    </Text>
  </View>
);

export default function CirclesScreen() {
  return (
    <SafeAreaView style={styles.root}>
      <CosmosBackground />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>CIRCLES</Text>
          <Text style={styles.subtitle}>Sacred accountability</Text>
        </View>

        {MOCK_CIRCLES.map((circle) => (
          <View key={circle.id} style={styles.circleCard}>
            <View style={styles.circleHead}>
              <View>
                <Text style={styles.circleName}>{circle.name}</Text>
                <Text style={styles.circleSub}>
                  {memberCountSanskrit(circle.members.length)} · Day {circle.daysTogether}
                </Text>
              </View>

              <View style={styles.avgBadge}>
                <Text style={styles.avgBadgeText}>{circle.avgScore}</Text>
              </View>
            </View>

            <View style={styles.memberHead}>
              <Text style={styles.memberHeadLabel}>MEMBER</Text>
              <Text style={styles.memberHeadLabel}>STREAK</Text>
              <Text style={styles.memberHeadLabel}>CHECK</Text>
              <Text style={styles.memberHeadLabel}>LIFE</Text>
              <Text style={styles.memberHeadLabel}>TRUST</Text>
            </View>

            <View style={styles.memberTable}>
              {circle.members.map((member, index) =>
                renderMember(member, index, index === circle.members.length - 1)
              )}
            </View>
          </View>
        ))}

        <TouchableOpacity activeOpacity={0.9} onPress={handleSupport} style={styles.sosCard}>
          <Text style={styles.sosIcon}>🚨</Text>
          <View style={styles.sosCopy}>
            <Text style={styles.sosTitle}>I'M NOT OKAY — DHARMA SUPPORT</Text>
            <Text style={styles.sosSub}>
              Sends a silent signal to your circle. No words needed.
            </Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 10 }} />
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
  circleCard: {
    marginBottom: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(17,22,32,0.8)',
    overflow: 'hidden',
  },
  circleHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: 'rgba(212,168,83,0.05)',
  },
  circleName: {
    fontFamily: CINZEL,
    fontSize: 17,
    color: colors.white,
    letterSpacing: 1,
  },
  circleSub: {
    marginTop: 3,
    fontFamily: CORMORANT_ITALIC,
    fontSize: 13,
    color: colors.white3,
  },
  avgBadge: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border2,
    backgroundColor: colors.golddim,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  avgBadgeText: {
    fontFamily: CINZEL,
    fontSize: 12,
    color: colors.gold,
    letterSpacing: 1,
  },
  memberHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  memberHeadLabel: {
    fontFamily: CINZEL,
    fontSize: 8,
    letterSpacing: 1.4,
    color: colors.white3,
  },
  memberTable: {
    paddingHorizontal: 18,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  memberDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  memberAvatarEmoji: {
    fontSize: 15,
  },
  memberNameWrap: {
    flex: 1,
  },
  memberName: {
    fontFamily: DM_MEDIUM,
    fontSize: 14,
    color: colors.white,
  },
  memberRole: {
    fontFamily: CORMORANT_ITALIC,
    fontSize: 11,
    color: colors.white3,
  },
  memberStreak: {
    width: 76,
    textAlign: 'center',
    color: colors.white2,
    fontFamily: DM,
    fontSize: 12,
  },
  memberCheck: {
    width: 52,
    textAlign: 'center',
    fontSize: 16,
  },
  memberScore: {
    width: 50,
    textAlign: 'center',
    fontFamily: CINZEL,
    color: colors.white3,
    fontSize: 12,
  },
  memberTrust: {
    width: 56,
    textAlign: 'center',
    fontFamily: CINZEL,
    fontSize: 14,
  },
  sosCard: {
    marginTop: 2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212,92,92,0.18)',
    backgroundColor: 'rgba(212,92,92,0.06)',
    paddingVertical: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  sosIcon: {
    fontSize: 24,
  },
  sosCopy: {
    flex: 1,
  },
  sosTitle: {
    fontFamily: CINZEL,
    fontSize: 13,
    letterSpacing: 1,
    color: colors.red,
  },
  sosSub: {
    marginTop: 3,
    fontFamily: CORMORANT_ITALIC,
    fontSize: 13,
    color: colors.white3,
    lineHeight: 20,
  },
});
