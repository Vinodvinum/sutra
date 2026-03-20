import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Stop } from 'react-native-svg';

import { colors } from '../constants/colors';
import { CINZEL, DM } from '../constants/fonts';

interface MandalaScoreProps {
  score: number;
  size?: number;
}

const PETAL_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

export default function MandalaScore({ score, size = 170 }: MandalaScoreProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const center = size / 2;
  const scoreRadius = size * 0.382;
  const circumference = 2 * Math.PI * scoreRadius;

  const [dashOffset, setDashOffset] = useState<number>(circumference);
  const animatedOffset = useRef(new Animated.Value(circumference)).current;

  const gradientId = useMemo(
    () => `mandala-grad-${Math.round(Math.random() * 1000000)}`,
    []
  );

  useEffect(() => {
    const target = circumference - (clamped / 100) * circumference;

    const listenerId = animatedOffset.addListener(({ value }) => {
      setDashOffset(value);
    });

    Animated.timing(animatedOffset, {
      toValue: target,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    return () => {
      animatedOffset.removeListener(listenerId);
    };
  }, [animatedOffset, circumference, clamped]);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}> 
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={colors.gold} />
            <Stop offset="100%" stopColor={colors.gold2} />
          </LinearGradient>
        </Defs>

        <Circle
          cx={center}
          cy={center}
          r={size * 0.46}
          fill="none"
          stroke="rgba(212,168,83,0.08)"
          strokeWidth={1}
          strokeDasharray="6 10"
        />

        <Circle
          cx={center}
          cy={center}
          r={size * 0.40}
          fill="none"
          stroke="rgba(212,168,83,0.06)"
          strokeWidth={1}
          strokeDasharray="3 8"
        />

        <Circle
          cx={center}
          cy={center}
          r={size * 0.31}
          fill="none"
          stroke="rgba(212,168,83,0.04)"
          strokeWidth={1}
          strokeDasharray="2 6"
        />

        <G opacity={0.15} x={center} y={center}>
          {PETAL_ANGLES.map((angle) => (
            <Ellipse
              key={angle}
              rx={size * 0.028}
              ry={size * 0.067}
              fill={colors.gold}
              transform={`rotate(${angle}) translate(0 ${-size * 0.35})`}
            />
          ))}
        </G>

        <Circle
          cx={center}
          cy={center}
          r={scoreRadius}
          fill="none"
          stroke="rgba(212,168,83,0.08)"
          strokeWidth={8}
        />

        <Circle
          cx={center}
          cy={center}
          r={scoreRadius}
          fill="none"
          stroke="rgba(212,168,83,0.22)"
          strokeWidth={10}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          opacity={0.6}
        />

        <Circle
          cx={center}
          cy={center}
          r={scoreRadius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={8}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>

      <View style={styles.centerInfo}>
        <Text style={styles.score}>{Math.round(clamped)}</Text>
        <Text style={styles.denom}>/100</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerInfo: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontFamily: CINZEL,
    fontSize: 46,
    color: colors.gold,
    lineHeight: 50,
    textShadowColor: 'rgba(212,168,83,0.5)',
    textShadowRadius: 10,
  },
  denom: {
    marginTop: 2,
    fontFamily: DM,
    fontSize: 11,
    color: colors.white3,
    letterSpacing: 1,
  },
});
