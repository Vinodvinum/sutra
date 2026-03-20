import React, { useState } from 'react';
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
import { resetPassword } from '../lib/firebaseAuth';
import { AuthStackParamList } from '../navigation/AppNavigator';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();

  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [sent, setSent] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (): Promise<void> => {
    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await resetPassword(email.trim());
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.root}>
      <CosmosBackground />

      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.backBtn}
        onPress={() => navigation.navigate('LoginScreen')}
      >
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.topBlock}>
            <Text style={styles.keyIcon}>🔑</Text>
            <Text style={styles.title}>RESET YOUR PATH</Text>
            <Text style={styles.subtitle}>We will send a sacred reset link to your email.</Text>
          </View>

          {!sent ? (
            <View style={styles.form}>
              <AuthInput
                label="Email Address"
                placeholder="your@email.com"
                value={email}
                onChangeText={setEmail}
              />

              <GoldButton title="SEND RESET LINK" onPress={handleSend} loading={loading} />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
          ) : (
            <View style={styles.successWrap}>
              <Text style={styles.mailIcon}>✉️</Text>
              <Text style={styles.successTitle}>LINK SENT</Text>
              <Text style={styles.successText}>
                Check your email. The reset link will guide you back to your path.
              </Text>

              <GoldButton
                outline
                title="BACK TO LOGIN"
                onPress={() => navigation.navigate('LoginScreen')}
                style={styles.successBtn}
              />
            </View>
          )}
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
  backBtn: {
    position: 'absolute',
    top: 52,
    left: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    zIndex: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    color: colors.gold,
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  topBlock: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 32,
    zIndex: 1,
  },
  keyIcon: {
    fontSize: 44,
    marginBottom: 16,
  },
  title: {
    fontFamily: CINZEL,
    fontSize: 22,
    letterSpacing: 3,
    color: colors.white,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: CORMORANT_ITALIC,
    fontSize: 14,
    color: colors.white3,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    zIndex: 1,
  },
  errorText: {
    fontFamily: DM,
    fontSize: 12,
    color: colors.red,
    textAlign: 'center',
    marginTop: 10,
  },
  successWrap: {
    alignItems: 'center',
    paddingTop: 20,
    zIndex: 1,
  },
  mailIcon: {
    fontSize: 52,
    marginBottom: 16,
  },
  successTitle: {
    fontFamily: CINZEL,
    fontSize: 18,
    letterSpacing: 2,
    color: colors.green,
    marginBottom: 8,
  },
  successText: {
    fontFamily: CORMORANT_ITALIC,
    fontSize: 15,
    color: colors.white2,
    textAlign: 'center',
    lineHeight: 24,
  },
  successBtn: {
    marginTop: 24,
    alignSelf: 'stretch',
  },
});
