import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import BrahmaCard from '../components/BrahmaCard';
import CosmosBackground from '../components/CosmosBackground';
import GoldButton from '../components/GoldButton';
import { colors } from '../constants/colors';
import { CINZEL, CORMORANT, CORMORANT_ITALIC, DM, DM_MEDIUM } from '../constants/fonts';
import { FinanceLog, SavingsGoal } from '../constants/types';
import { useAuthContext } from '../context/AuthContext';
import { getFinanceLog, saveFinanceEntry } from '../lib/supabase';

type SpendCategory = 'needs' | 'wants' | 'waste';

interface SpendMeta {
  key: SpendCategory;
  label: string;
  sanskrit: string;
  color: string;
}

const SPEND_TYPES: SpendMeta[] = [
  {
    key: 'needs',
    label: 'Needs',
    sanskrit: '\u0906\u0935\u0936\u094d\u092f\u0915\u0924\u093e',
    color: colors.green,
  },
  { key: 'wants', label: 'Wants', sanskrit: '\u0907\u091a\u094d\u091b\u093e', color: colors.gold },
  { key: 'waste', label: 'Waste', sanskrit: '\u0935\u094d\u092f\u0930\u094d\u0925', color: colors.red },
];

const INITIAL_LOG: FinanceLog = {
  needs: 0,
  wants: 0,
  waste: 0,
  total: 0,
  month: new Date().toISOString().slice(0, 7),
  score: 0,
};

const INITIAL_GOALS: SavingsGoal[] = [
  {
    id: 'g1',
    title: 'Emergency Fund',
    saved: 65000,
    target: 120000,
    currency: 'INR',
  },
  {
    id: 'g2',
    title: 'Laptop Upgrade',
    saved: 28000,
    target: 60000,
    currency: 'INR',
  },
  {
    id: 'g3',
    title: 'Pilgrimage Reserve',
    saved: 12000,
    target: 50000,
    currency: 'INR',
  },
];

const formatInr = (amount: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

export default function FinanceScreen() {
  const { user } = useAuthContext();

  const [financeLog, setFinanceLog] = useState<FinanceLog>(INITIAL_LOG);
  const [goals] = useState<SavingsGoal[]>(INITIAL_GOALS);
  const [loading, setLoading] = useState<boolean>(true);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [entryAmount, setEntryAmount] = useState<string>('');
  const [entryCategory, setEntryCategory] = useState<SpendCategory>('needs');
  const [entryDescription, setEntryDescription] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const monthKey = useMemo(() => new Date().toISOString().slice(0, 7), []);

  const loadFinance = useCallback(async (): Promise<void> => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const financeData = await getFinanceLog(user.uid, monthKey);
    setFinanceLog(financeData ?? { ...INITIAL_LOG, month: monthKey });
    setLoading(false);
  }, [monthKey, user?.uid]);

  useEffect(() => {
    void loadFinance();
  }, [loadFinance]);

  const spendRows = useMemo(
    () =>
      SPEND_TYPES.map((type) => {
        const amount = financeLog[type.key];
        const percentage =
          financeLog.total > 0 ? Math.round((amount / financeLog.total) * 100) : 0;

        return {
          ...type,
          amount,
          percentage,
        };
      }),
    [financeLog]
  );

  const resetModal = (): void => {
    setEntryAmount('');
    setEntryCategory('needs');
    setEntryDescription('');
    setFormError(null);
  };

  const openModal = (): void => {
    resetModal();
    setIsModalOpen(true);
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
  };

  const saveEntry = async (): Promise<void> => {
    const amount = Number(entryAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError('Enter a valid amount.');
      return;
    }

    if (!user?.uid) {
      setFormError('Please sign in to save entries.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const today = new Date().toISOString().slice(0, 10);
      await saveFinanceEntry(
        user.uid,
        today,
        amount,
        entryCategory,
        entryDescription.trim()
      );

      await loadFinance();
      closeModal();
      resetModal();
    } catch {
      setFormError('Unable to save entry right now. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <CosmosBackground />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>FINANCE</Text>
          <Text style={styles.subtitle}>{'\u0905\u0930\u094d\u0925 \u0927\u0930\u094d\u092e'}</Text>
        </View>

        <View style={styles.scoreCard}>
          <View style={styles.blueGlow} />

          <Text style={styles.scoreNumber}>{financeLog.score}</Text>
          <Text style={styles.scoreSubtitle}>Artha Discipline</Text>

          <View style={styles.spendingRows}>
            {spendRows.map((row) => (
              <View key={row.key} style={styles.spendingRow}>
                <View style={styles.spendingLeft}>
                  <View style={[styles.spendingDot, { backgroundColor: row.color }]} />
                  <View>
                    <Text style={styles.spendingLabel}>{row.label}</Text>
                    <Text style={styles.spendingSanskrit}>{row.sanskrit}</Text>
                  </View>
                </View>

                <View style={styles.spendingRight}>
                  <Text style={styles.spendingAmount}>{formatInr(row.amount)}</Text>
                  <Text style={styles.spendingPercent}>{row.percentage}%</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.segmentWrap}>
            {spendRows.map((row) => (
              <View
                key={`segment-${row.key}`}
                style={[
                  styles.segment,
                  {
                    backgroundColor: row.color,
                    flex: Math.max(0.1, row.percentage / 100),
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>{`SAVINGS - \u0938\u0902\u091a\u092f`}</Text>
          <TouchableOpacity activeOpacity={0.85}>
            <Text style={styles.sectionAction}>+ Add Goal</Text>
          </TouchableOpacity>
        </View>

        {goals.map((goal) => {
          const progress = goal.target > 0 ? Math.min(1, goal.saved / goal.target) : 0;

          return (
            <View key={goal.id} style={styles.goalCard}>
              <View style={styles.goalRow}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Text style={styles.goalPercent}>{Math.round(progress * 100)}%</Text>
              </View>

              <View style={styles.goalTrack}>
                <LinearGradient
                  colors={[colors.blue, colors.teal]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.goalFill, { width: `${Math.max(4, progress * 100)}%` }]}
                />
              </View>

              <View style={styles.goalMetaRow}>
                <Text style={styles.goalMeta}>{formatInr(goal.saved)} saved</Text>
                <Text style={styles.goalMeta}>Target {formatInr(goal.target)}</Text>
              </View>
            </View>
          );
        })}

        <BrahmaCard
          type="insight"
          icon={'\u{1F4AB}'}
          label="BRAHMA FINANCE INSIGHT"
          text="Your Artha rises when wants stay below one-third of total spend. Protect savings first, then spend with intention."
        />

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator color={colors.gold} />
            <Text style={styles.loaderText}>Syncing your finance logs...</Text>
          </View>
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <TouchableOpacity style={styles.fab} activeOpacity={0.86} onPress={openModal}>
        <Text style={styles.fabText}>+ Add Entry</Text>
      </TouchableOpacity>

      <Modal visible={isModalOpen} transparent animationType="slide" onRequestClose={closeModal}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity style={styles.modalScrim} activeOpacity={1} onPress={closeModal} />

          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>NEW ENTRY</Text>

            <Text style={styles.modalLabel}>Amount</Text>
            <TextInput
              value={entryAmount}
              onChangeText={setEntryAmount}
              placeholder="0"
              placeholderTextColor={colors.white3}
              keyboardType="numeric"
              style={styles.modalInput}
            />

            <Text style={styles.modalLabel}>Category</Text>
            <View style={styles.categoryRow}>
              {SPEND_TYPES.map((category) => (
                <TouchableOpacity
                  key={category.key}
                  activeOpacity={0.85}
                  onPress={() => setEntryCategory(category.key)}
                  style={[
                    styles.categoryChip,
                    entryCategory === category.key && styles.categoryChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      entryCategory === category.key && styles.categoryTextActive,
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Description (optional)</Text>
            <TextInput
              value={entryDescription}
              onChangeText={setEntryDescription}
              placeholder="Brief note"
              placeholderTextColor={colors.white3}
              style={styles.modalInput}
            />

            {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

            <GoldButton title="SAVE ENTRY" onPress={() => void saveEntry()} loading={isSaving} />
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingTop: 8,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontFamily: CINZEL,
    fontSize: 20,
    letterSpacing: 2,
    color: colors.white,
  },
  subtitle: {
    marginTop: 3,
    fontFamily: CORMORANT_ITALIC,
    fontSize: 15,
    color: colors.white3,
  },
  scoreCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(17,22,32,0.85)',
    padding: 18,
    marginBottom: 16,
    overflow: 'hidden',
  },
  blueGlow: {
    position: 'absolute',
    top: -70,
    right: -50,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(78,143,212,0.25)',
  },
  scoreNumber: {
    fontFamily: CINZEL,
    fontSize: 52,
    lineHeight: 56,
    color: colors.blue,
    textShadowColor: 'rgba(78,143,212,0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
    marginBottom: 6,
  },
  scoreSubtitle: {
    fontFamily: CORMORANT_ITALIC,
    fontSize: 20,
    color: colors.white2,
    marginBottom: 14,
  },
  spendingRows: {
    gap: 10,
  },
  spendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  spendingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  spendingDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  spendingLabel: {
    fontFamily: CORMORANT,
    fontSize: 16,
    color: colors.white,
  },
  spendingSanskrit: {
    marginTop: -2,
    fontFamily: CORMORANT_ITALIC,
    fontSize: 12,
    color: colors.white3,
  },
  spendingRight: {
    alignItems: 'flex-end',
  },
  spendingAmount: {
    fontFamily: CINZEL,
    fontSize: 15,
    color: colors.white,
  },
  spendingPercent: {
    marginTop: 2,
    fontFamily: DM,
    fontSize: 11,
    color: colors.white3,
  },
  segmentWrap: {
    marginTop: 14,
    height: 8,
    borderRadius: 6,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: colors.surface2,
  },
  segment: {
    height: 8,
  },
  sectionRow: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: CINZEL,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.white,
  },
  sectionAction: {
    fontFamily: DM_MEDIUM,
    fontSize: 12,
    color: colors.gold,
  },
  goalCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(17,22,32,0.82)',
    padding: 16,
    marginBottom: 10,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  goalTitle: {
    fontFamily: CORMORANT,
    fontSize: 20,
    color: colors.white,
  },
  goalPercent: {
    fontFamily: CINZEL,
    fontSize: 20,
    color: colors.blue,
  },
  goalTrack: {
    height: 8,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: colors.surface2,
    marginBottom: 8,
  },
  goalFill: {
    height: 8,
    borderRadius: 6,
  },
  goalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalMeta: {
    fontFamily: DM,
    fontSize: 12,
    color: colors.white3,
  },
  loaderWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  loaderText: {
    fontFamily: CORMORANT,
    fontSize: 14,
    color: colors.white3,
  },
  bottomSpacer: {
    height: 14,
  },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    backgroundColor: colors.gold,
    borderRadius: 999,
    paddingHorizontal: 16,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  fabText: {
    fontFamily: CINZEL,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.bg,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalCard: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.border2,
    backgroundColor: colors.bg2,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 22,
    zIndex: 2,
  },
  modalTitle: {
    fontFamily: CINZEL,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.gold,
    marginBottom: 12,
  },
  modalLabel: {
    fontFamily: CINZEL,
    fontSize: 9,
    letterSpacing: 1.5,
    color: colors.white2,
    marginBottom: 7,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border2,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontFamily: DM,
    fontSize: 14,
    color: colors.white,
    backgroundColor: colors.surface,
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  categoryChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border2,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  categoryChipActive: {
    borderColor: colors.gold,
    backgroundColor: colors.golddim,
  },
  categoryText: {
    fontFamily: DM_MEDIUM,
    fontSize: 12,
    color: colors.white2,
  },
  categoryTextActive: {
    color: colors.gold,
  },
  errorText: {
    fontFamily: DM,
    fontSize: 12,
    color: colors.red,
    marginBottom: 8,
  },
});
