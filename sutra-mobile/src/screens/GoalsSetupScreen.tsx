import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';

import AuthInput from '../components/AuthInput';
import CosmosBackground from '../components/CosmosBackground';
import GoldButton from '../components/GoldButton';
import { colors } from '../constants/colors';
import { CINZEL, CORMORANT_ITALIC, DM } from '../constants/fonts';
import { useAuthContext } from '../context/AuthContext';
import supabase from '../lib/supabase';
import { OnboardingStackParamList } from '../navigation/AppNavigator';

type PillarKey = 'discipline' | 'health' | 'finance' | 'growth';

interface PillarChip {
  key: PillarKey;
  title: string;
  subtitle: string;
  icon: string;
}

const PILLARS: PillarChip[] = [
  { key: 'discipline', title: 'TAPAS', subtitle: 'Discipline', icon: '🔱' },
  { key: 'health', title: 'ĀROGYA', subtitle: 'Health', icon: '💚' },
  { key: 'finance', title: 'ARTHA', subtitle: 'Finance', icon: '💫' },
  { key: 'growth', title: 'VIDYĀ', subtitle: 'Growth', icon: '🪷' },
];

export default function GoalsSetupScreen() {
  const navigation = useNavigation<NavigationProp<OnboardingStackParamList>>();
  const { user } = useAuthContext();

  const [goal1, setGoal1] = useState<string>('');
  const [goal2, setGoal2] = useState<string>('');
  const [goal3, setGoal3] = useState<string>('');
  const [selectedPillars, setSelectedPillars] = useState<PillarKey[]>(['discipline', 'health']);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const goals = useMemo(
    () => [goal1.trim(), goal2.trim(), goal3.trim()].filter((goal) => goal.length > 0),
    [goal1, goal2, goal3]
  );

  const togglePillar = (key: PillarKey): void => {
    setSelectedPillars((prev) => {
      if (prev.includes(key)) {
        if (prev.length <= 2) {
          return prev;
        }
        return prev.filter((item) => item !== key);
      }

      return [...prev, key];
    });
  };

  const handleNext = async (): Promise<void> => {
    if (!goal1.trim()) {
      setError('Please enter at least your primary mission.');
      return;
    }

    if (selectedPillars.length < 2) {
      setError('Please select at least 2 pillars to track.');
      return;
    }

    if (!user) {
      setError('Session missing. Please sign in again.');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        goals,
        selected_pillars: selectedPillars,
      })
      .eq('id', user.uid);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    navigation.navigate('BaselineWeekScreen');
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.root}>
      <CosmosBackground />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.stepWrap}>
            <View style={[styles.stepDot, styles.stepDotActive]} />
            <View style={styles.stepDot} />
          </View>

          <Text style={styles.title}>YOUR DHARMA GOALS</Text>
          <Text style={styles.subtitle}>What are you here to master?</Text>

          <View style={styles.formWrap}>
            <AuthInput
              label="Goal 1 — Primary Mission *"
              placeholder="e.g. Build unbreakable discipline"
              value={goal1}
              onChangeText={setGoal1}
            />
            <AuthInput
              label="Goal 2 — Second Focus"
              placeholder="e.g. Reach financial freedom"
              value={goal2}
              onChangeText={setGoal2}
            />
            <AuthInput
              label="Goal 3 — Third Commitment"
              placeholder="e.g. Master a new skill"
              value={goal3}
              onChangeText={setGoal3}
            />

            <Text style={styles.pillarLabel}>SELECT YOUR PILLARS</Text>
            <Text style={styles.pillarHint}>Choose at least 2</Text>

            <View style={styles.pillarGrid}>
              {PILLARS.map((pillar) => {
                const selected = selectedPillars.includes(pillar.key);

                return (
                  <TouchableOpacity
                    key={pillar.key}
                    activeOpacity={0.9}
                    style={[
                      styles.pillarChip,
                      selected ? styles.pillarChipSelected : styles.pillarChipDefault,
                    ]}
                    onPress={() => togglePillar(pillar.key)}
                  >
                    <Text style={styles.chipIcon}>{pillar.icon}</Text>
                    <Text style={[styles.chipTitle, selected ? styles.chipTitleSelected : null]}>
                      {pillar.title}
                    </Text>
                    <Text
                      style={[styles.chipSubtitle, selected ? styles.chipSubtitleSelected : null]}
                    >
                      {pillar.subtitle}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <GoldButton title="NEXT — BASELINE WEEK" onPress={handleNext} loading={loading} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 44,
    paddingBottom: 40,
  },
  stepWrap: {
    alignSelf: 'center',
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
  stepDotActive: {
    backgroundColor: colors.gold,
  },
  title: {
    textAlign: 'center',
    fontFamily: CINZEL,
    fontSize: 22,
    letterSpacing: 3,
    color: colors.white,
    marginBottom: 6,
  },
  subtitle: {
    textAlign: 'center',
    fontFamily: CORMORANT_ITALIC,
    fontSize: 15,
    color: colors.white3,
    marginBottom: 24,
  },
  formWrap: {
    zIndex: 1,
  },
  pillarLabel: {
    fontFamily: CINZEL,
    fontSize: 9,
    letterSpacing: 2,
    color: colors.gold,
    marginTop: 6,
    marginBottom: 4,
  },
  pillarHint: {
    fontFamily: DM,
    fontSize: 11,
    color: colors.white3,
    marginBottom: 12,
  },
  pillarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
    marginBottom: 16,
  },
  pillarChip: {
    width: '48.8%',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  pillarChipDefault: {
    backgroundColor: colors.surface,
    borderColor: colors.border2,
  },
  pillarChipSelected: {
    backgroundColor: colors.golddim,
    borderColor: colors.gold,
  },
  chipIcon: {
    fontSize: 18,
    marginBottom: 5,
  },
  chipTitle: {
    fontFamily: CINZEL,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.white3,
  },
  chipTitleSelected: {
    color: colors.gold,
  },
  chipSubtitle: {
    marginTop: 2,
    fontFamily: CORMORANT_ITALIC,
    fontSize: 12,
    color: colors.white3,
  },
  chipSubtitleSelected: {
    color: colors.gold2,
  },
  errorText: {
    fontFamily: DM,
    fontSize: 12,
    color: colors.red,
    textAlign: 'center',
    marginBottom: 12,
  },
});
