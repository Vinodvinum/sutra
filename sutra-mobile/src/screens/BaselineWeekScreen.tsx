import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';

import CosmosBackground from '../components/CosmosBackground';
import GoldButton from '../components/GoldButton';
import { colors } from '../constants/colors';
import { CINZEL, CORMORANT_ITALIC } from '../constants/fonts';
import { useAuthContext } from '../context/AuthContext';
import supabase from '../lib/supabase';
import { RootStackParamList } from '../navigation/AppNavigator';

interface TrackingItem {
  icon: string;
  title: string;
  meta: string;
}

const TRACKING_ITEMS: TrackingItem[] = [
  { icon: '🔱', title: 'Discipline patterns', meta: 'task completion, focus time' },
  { icon: '💚', title: 'Sleep and movement', meta: 'hours, consistency, exercise' },
  { icon: '💫', title: 'Spending behavior', meta: 'needs, wants, waste' },
  { icon: '🪷', title: 'Learning habits', meta: 'reading, courses, reflection' },
];

export default function BaselineWeekScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuthContext();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.08,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulse]);

  const handleBegin = async (): Promise<void> => {
    if (!user) {
      setError('Session missing. Please sign in again.');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ onboarding_complete: true, baseline_complete: true })
      .eq('id', user.uid);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    navigation.navigate('MainTabs');
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.root}>
      <CosmosBackground />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.stepWrap}>
          <View style={[styles.stepDot, styles.stepDotDone]} />
          <View style={[styles.stepDot, styles.stepDotActive]} />
        </View>

        <Animated.Text style={[styles.om, { transform: [{ scale: pulse }] }]}>ॐ</Animated.Text>
        <Text style={styles.title}>THE WATCHING WEEK</Text>
        <Text style={styles.subtitle}>पर्यवेक्षण काल</Text>

        <Text style={styles.bigSeven}>7</Text>
        <Text style={styles.sevenLabel}>DAYS OF SILENCE</Text>

        <Text style={styles.description}>
          SUTRA will observe your patterns silently for 7 days before calculating your first Life
          Score. Log your daily activities. Your dharmic journey begins now.
        </Text>

        <View style={styles.trackingList}>
          {TRACKING_ITEMS.map((item) => (
            <View key={item.title} style={styles.trackingCard}>
              <Text style={styles.trackingIcon}>{item.icon}</Text>
              <View>
                <Text style={styles.trackingTitle}>{item.title}</Text>
                <Text style={styles.trackingMeta}>{item.meta}</Text>
              </View>
            </View>
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <GoldButton title="I UNDERSTAND — BEGIN ✦" onPress={handleBegin} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 44,
    paddingBottom: 40,
    alignItems: 'center',
  },
  stepWrap: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white3,
  },
  stepDotDone: {
    backgroundColor: colors.green,
  },
  stepDotActive: {
    backgroundColor: colors.gold,
  },
  om: {
    fontSize: 40,
    color: colors.gold,
    marginBottom: 20,
    textShadowColor: 'rgba(212,168,83,0.7)',
    textShadowRadius: 16,
  },
  title: {
    fontFamily: CINZEL,
    fontSize: 18,
    letterSpacing: 3,
    color: colors.white,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: CORMORANT_ITALIC,
    fontSize: 13,
    color: colors.white3,
    marginBottom: 24,
  },
  bigSeven: {
    fontFamily: CINZEL,
    fontSize: 96,
    color: colors.gold,
    lineHeight: 106,
    textShadowColor: 'rgba(212,168,83,0.5)',
    textShadowRadius: 20,
  },
  sevenLabel: {
    fontFamily: CINZEL,
    fontSize: 11,
    letterSpacing: 3,
    color: colors.white3,
    marginBottom: 24,
  },
  description: {
    maxWidth: 300,
    textAlign: 'center',
    fontFamily: CORMORANT_ITALIC,
    fontSize: 15,
    color: colors.white2,
    lineHeight: 26,
    marginBottom: 28,
  },
  trackingList: {
    alignSelf: 'stretch',
    marginBottom: 28,
  },
  trackingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
  },
  trackingIcon: {
    fontSize: 20,
  },
  trackingTitle: {
    fontFamily: CORMORANT_ITALIC,
    fontSize: 15,
    color: colors.white2,
  },
  trackingMeta: {
    marginTop: 1,
    fontFamily: CORMORANT_ITALIC,
    fontSize: 11,
    color: colors.white3,
  },
  errorText: {
    fontFamily: CORMORANT_ITALIC,
    fontSize: 13,
    color: colors.red,
    marginBottom: 10,
  },
});
