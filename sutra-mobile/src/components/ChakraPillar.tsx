import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '../constants/colors';
import { CINZEL, CORMORANT_ITALIC } from '../constants/fonts';

type Pillar = 'discipline' | 'health' | 'finance' | 'growth';

interface ChakraPillarProps {
  pillar: Pillar;
  score: number;
}

interface PillarMeta {
  icon: string;
  name: string;
  sanskrit: string;
  color: string;
}

const PILLAR_META: Record<Pillar, PillarMeta> = {
  discipline: { icon: '🔱', name: 'Tapas', sanskrit: 'तप — Tapas', color: colors.gold },
  health: { icon: '💚', name: 'Ārogya', sanskrit: 'आरोग्य — Ārogya', color: colors.green },
  finance: { icon: '💫', name: 'Artha', sanskrit: 'अर्थ — Artha', color: colors.blue },
  growth: { icon: '🪷', name: 'Vidyā', sanskrit: 'विद्या — Vidyā', color: colors.sacred },
};

export default function ChakraPillar({ pillar, score }: ChakraPillarProps) {
  const meta = PILLAR_META[pillar];
  const clamped = Math.max(0, Math.min(100, score));

  const handlePress = (): void => {
    Alert.alert(meta.name, `${meta.sanskrit}\nScore: ${clamped}/100`);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={[styles.card, { borderColor: `${meta.color}33` }]}
    >
      <Text style={styles.icon}>{meta.icon}</Text>
      <Text style={[styles.score, { color: meta.color }]}>{Math.round(clamped)}</Text>
      <Text style={styles.name}>{meta.name}</Text>
      <Text style={[styles.sanskrit, { color: `${meta.color}AA` }]}>{meta.sanskrit}</Text>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: meta.color }]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    backgroundColor: 'rgba(17,22,32,0.72)',
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
  },
  icon: {
    fontSize: 26,
    marginBottom: 8,
  },
  score: {
    fontFamily: CINZEL,
    fontSize: 28,
    lineHeight: 30,
    marginBottom: 3,
  },
  name: {
    fontSize: 10,
    color: colors.white3,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 3,
  },
  sanskrit: {
    fontFamily: CORMORANT_ITALIC,
    fontSize: 12,
    marginBottom: 10,
  },
  track: {
    width: '100%',
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
});
