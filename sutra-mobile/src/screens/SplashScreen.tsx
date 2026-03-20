import React from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';

import CosmosBackground from '../components/CosmosBackground';
import { colors } from '../constants/colors';

export default function SplashScreen() {
  return (
    <SafeAreaView style={styles.root}>
      <CosmosBackground />
      <Text style={styles.om}>ॐ</Text>
      <Text style={styles.title}>SUTRA</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  om: {
    color: colors.gold,
    fontSize: 64,
    marginBottom: 10,
    zIndex: 1,
  },
  title: {
    color: colors.white,
    fontSize: 24,
    letterSpacing: 4,
    zIndex: 1,
  },
});

