import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../constants/colors';
import { CINZEL, CORMORANT } from '../constants/fonts';

type BrahmaCardType = 'insight' | 'risk' | 'win';

interface BrahmaCardProps {
  type: BrahmaCardType;
  icon: string;
  label: string;
  text: string;
}

const TYPE_TINTS: Record<BrahmaCardType, [string, string]> = {
  insight: ['rgba(212,168,83,0.22)', 'rgba(212,168,83,0.08)'],
  risk: ['rgba(212,92,92,0.20)', 'rgba(212,92,92,0.08)'],
  win: ['rgba(82,201,122,0.20)', 'rgba(82,201,122,0.08)'],
};

export default function BrahmaCard({ type, icon, label, text }: BrahmaCardProps) {
  const tint = TYPE_TINTS[type];

  return (
    <LinearGradient
      colors={tint}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.outer}
    >
      <View style={styles.inner}>
        <Text style={styles.icon}>{icon}</Text>

        <View style={styles.copyWrap}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.body}>{text}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: 18,
    padding: 1,
    marginBottom: 14,
  },
  inner: {
    borderRadius: 17,
    backgroundColor: 'rgba(17,22,32,0.85)',
    padding: 18,
    flexDirection: 'row',
    gap: 14,
  },
  icon: {
    fontSize: 22,
    marginTop: 2,
  },
  copyWrap: {
    flex: 1,
  },
  label: {
    fontFamily: CINZEL,
    fontSize: 9,
    letterSpacing: 2,
    color: colors.gold,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  body: {
    fontFamily: CORMORANT,
    fontSize: 15,
    color: colors.white2,
    lineHeight: 24,
  },
});
