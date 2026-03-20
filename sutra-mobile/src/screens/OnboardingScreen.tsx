import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import CosmosBackground from '../components/CosmosBackground';
import { colors } from '../constants/colors';
import { CINZEL, DM } from '../constants/fonts';

export default function OnboardingScreen() {
  return (
    <SafeAreaView style={styles.root}>
      <CosmosBackground />
      <View style={styles.content}>
        <Text style={styles.title}>ONBOARDING</Text>
        <Text style={styles.subtitle}>This legacy screen is superseded by setup stack screens.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    paddingHorizontal: 24,
  },
  title: {
    color: colors.white,
    fontFamily: CINZEL,
    fontSize: 24,
    letterSpacing: 2,
  },
  subtitle: {
    marginTop: 8,
    color: colors.white2,
    fontFamily: DM,
    textAlign: 'center',
  },
});

