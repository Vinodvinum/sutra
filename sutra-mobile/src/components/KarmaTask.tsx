import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Task } from '../constants/types';
import { colors } from '../constants/colors';
import { CORMORANT_ITALIC, DM, DM_MEDIUM } from '../constants/fonts';

interface KarmaTaskProps {
  task: Task;
  onToggle: (id: string) => void;
}

const PILLAR_BADGES: Record<Task['pillar'], { label: string; bg: string; text: string }> = {
  discipline: { label: 'TAPAS', bg: 'rgba(212,168,83,0.12)', text: colors.gold },
  health: { label: 'ĀROGYA', bg: 'rgba(82,201,122,0.10)', text: colors.green },
  finance: { label: 'ARTHA', bg: 'rgba(78,143,212,0.10)', text: colors.blue },
  growth: { label: 'VIDYĀ', bg: 'rgba(123,94,167,0.12)', text: colors.sacred },
};

export default function KarmaTask({ task, onToggle }: KarmaTaskProps) {
  const checkProgress = useRef(new Animated.Value(task.completed ? 1 : 0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(checkProgress, {
      toValue: task.completed ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [checkProgress, task.completed]);

  const handlePress = (): void => {
    Animated.sequence([
      Animated.timing(pressScale, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.timing(pressScale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();

    onToggle(task.id);
  };

  const badge = PILLAR_BADGES[task.pillar];

  const checkBg = checkProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(212,168,83,0)', colors.gold],
  });

  const checkBorder = checkProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border2, colors.gold],
  });

  const checkMarkColor = checkProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(5,6,10,0)', colors.bg],
  });

  return (
    <Animated.View style={[styles.wrap, { transform: [{ scale: pressScale }], opacity: task.completed ? 0.4 : 1 }]}> 
      <TouchableOpacity activeOpacity={0.9} onPress={handlePress} style={styles.row}>
        <Animated.View style={[styles.check, { backgroundColor: checkBg, borderColor: checkBorder }]}> 
          <Animated.Text style={[styles.checkMark, { color: checkMarkColor }]}>✓</Animated.Text>
        </Animated.View>

        <View style={styles.textWrap}>
          <Text style={[styles.title, task.completed ? styles.titleDone : null]}>{task.title}</Text>
          <Text style={styles.meta}>{task.meta}</Text>
        </View>

        <View style={[styles.badge, { backgroundColor: badge.bg }]}> 
          <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 13,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontSize: 11,
    fontFamily: DM_MEDIUM,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: colors.white,
    fontFamily: DM_MEDIUM,
    fontSize: 14,
    marginBottom: 2,
  },
  titleDone: {
    textDecorationLine: 'line-through',
  },
  meta: {
    color: colors.white3,
    fontFamily: CORMORANT_ITALIC,
    fontSize: 12,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: DM,
    fontSize: 9,
    letterSpacing: 0.5,
  },
});
