import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../constants/colors';
import { CINZEL } from '../constants/fonts';

interface FlameDatum {
  day: string;
  score: number;
}

type FlameRange = '7D' | '30D' | '1Y';

interface FlameGraphProps {
  data: FlameDatum[];
  activeTab: FlameRange;
}

const TABS: FlameRange[] = ['7D', '30D', '1Y'];

const selectData = (data: FlameDatum[], range: FlameRange): FlameDatum[] => {
  if (data.length <= 7) {
    return data;
  }

  if (range === '7D') {
    return data.slice(-7);
  }

  if (range === '30D') {
    const month = data.slice(-30);
    const step = Math.max(1, Math.floor(month.length / 7));
    const sampled = month.filter((_, index) => index % step === 0);
    return sampled.slice(-7);
  }

  const year = data.slice(-365);
  const step = Math.max(1, Math.floor(year.length / 7));
  const sampled = year.filter((_, index) => index % step === 0);
  return sampled.slice(-7);
};

export default function FlameGraph({ data, activeTab }: FlameGraphProps) {
  const [selectedRange, setSelectedRange] = useState<FlameRange>(activeTab);

  useEffect(() => {
    setSelectedRange(activeTab);
  }, [activeTab]);

  const visibleData = useMemo(() => selectData(data, selectedRange), [data, selectedRange]);

  const animatedHeights = useRef<Animated.Value[]>([]);
  if (animatedHeights.current.length !== visibleData.length) {
    animatedHeights.current = visibleData.map(() => new Animated.Value(0));
  }

  useEffect(() => {
    const maxScore = Math.max(...visibleData.map((item) => item.score), 1);

    const animations = visibleData.map((item, index) =>
      Animated.spring(animatedHeights.current[index], {
        toValue: (item.score / maxScore) * 84,
        useNativeDriver: false,
        friction: 8,
        tension: 80,
      })
    );

    Animated.stagger(45, animations).start();
  }, [visibleData]);

  return (
    <View>
      <View style={styles.tabsRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            activeOpacity={0.9}
            onPress={() => setSelectedRange(tab)}
            style={[styles.tabPill, selectedRange === tab ? styles.tabPillActive : null]}
          >
            <Text style={[styles.tabText, selectedRange === tab ? styles.tabTextActive : null]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.chartWrap}>
        {visibleData.map((item, index) => {
          const isToday = index === visibleData.length - 1;
          return (
            <View key={`${item.day}-${index}`} style={styles.colWrap}>
              <Text style={[styles.valueLabel, isToday ? styles.todayValue : null]}>{item.score}</Text>

              <View style={styles.barShell}>
                <Animated.View
                  style={[
                    styles.bar,
                    {
                      height: animatedHeights.current[index],
                      shadowColor: isToday ? colors.gold : 'transparent',
                      shadowOpacity: isToday ? 0.4 : 0,
                      shadowRadius: isToday ? 10 : 0,
                      shadowOffset: { width: 0, height: 0 },
                    },
                  ]}
                >
                  {isToday ? (
                    <LinearGradient
                      colors={[colors.gold2, colors.gold]}
                      start={{ x: 0.5, y: 0 }}
                      end={{ x: 0.5, y: 1 }}
                      style={StyleSheet.absoluteFillObject}
                    />
                  ) : (
                    <View style={styles.inactiveFill} />
                  )}
                </Animated.View>
              </View>

              <Text style={[styles.dayLabel, isToday ? styles.todayDay : null]}>{item.day}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  tabPill: {
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tabPillActive: {
    backgroundColor: colors.golddim,
    borderColor: colors.border2,
  },
  tabText: {
    fontFamily: CINZEL,
    fontSize: 9,
    letterSpacing: 1.5,
    color: colors.white3,
  },
  tabTextActive: {
    color: colors.gold,
  },
  chartWrap: {
    height: 130,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    paddingBottom: 4,
  },
  colWrap: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
  },
  valueLabel: {
    fontSize: 9,
    color: colors.white3,
    position: 'absolute',
    top: -16,
  },
  todayValue: {
    color: colors.gold,
    fontWeight: '600',
  },
  barShell: {
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    flex: 1,
  },
  bar: {
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    overflow: 'hidden',
  },
  inactiveFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.golddim,
  },
  dayLabel: {
    fontSize: 9,
    color: colors.white3,
  },
  todayDay: {
    color: colors.gold,
  },
});
