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
import { signInWithGoogle, signUpWithEmail } from '../lib/firebaseAuth';
import { getProfile } from '../lib/supabase';
import { AuthStackParamList, RootStackParamList } from '../navigation/AppNavigator';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupScreen() {
  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const routeByProfile = async (uid: string): Promise<void> => {
    const profile = await getProfile(uid);
    const rootNav = navigation.getParent<NavigationProp<RootStackParamList>>();

    if (profile?.onboardingComplete) {
      rootNav?.navigate('MainTabs');
      return;
    }

    rootNav?.navigate('OnboardingStack');
  };

  const validateInputs = (): string | null => {
    if (!name.trim()) {
      return 'Please enter your name.';
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      return 'Please enter a valid email.';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters.';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }

    return null;
  };

  const handleSignup = async (): Promise<void> => {
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    const result = await signUpWithEmail(email.trim(), password, name.trim());
    if (result.error || !result.user) {
      setError(result.error ?? 'Account creation failed.');
      setLoading(false);
      return;
    }

    await routeByProfile(result.user.uid);
    setLoading(false);
  };

  const handleGoogleSignup = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    const result = await signInWithGoogle();
    if (result.error || !result.user) {
      setError(result.error ?? 'Google sign-up failed.');
      setLoading(false);
      return;
    }

    await routeByProfile(result.user.uid);
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.root}>
      <CosmosBackground />

      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.backBtn}
        onPress={() => navigation.navigate('WelcomeScreen')}
      >
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.topBlock}>
            <Text style={styles.title}>CREATE ACCOUNT</Text>
            <Text style={styles.subtitle}>आरंभ — The beginning</Text>
          </View>

          <View style={styles.form}>
            <AuthInput
              label="Full Name"
              placeholder="Your true name"
              value={name}
              onChangeText={setName}
            />
            <AuthInput
              label="Email Address"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
            />
            <AuthInput
              label="Password"
              placeholder="Min 8 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <AuthInput
              label="Confirm Password"
              placeholder="Repeat your key"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <GoldButton title="CREATE ACCOUNT" onPress={handleSignup} loading={loading} />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.dividerWrap}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.googleBtn}
              onPress={handleGoogleSignup}
              disabled={loading}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleText}>Sign up with Google</Text>
            </TouchableOpacity>

            <Text style={styles.footerText}>
              Already have an account?{' '}
              <Text style={styles.footerLink} onPress={() => navigation.navigate('LoginScreen')}>
                Login
              </Text>
            </Text>
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
    paddingTop: 64,
    paddingBottom: 24,
    zIndex: 1,
  },
  title: {
    fontFamily: CINZEL,
    fontSize: 22,
    letterSpacing: 3,
    color: colors.white,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: CORMORANT_ITALIC,
    fontSize: 15,
    color: colors.white3,
  },
  form: {
    marginTop: 12,
    zIndex: 1,
  },
  errorText: {
    fontFamily: DM,
    fontSize: 12,
    color: colors.red,
    textAlign: 'center',
    marginTop: 10,
  },
  dividerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border2,
  },
  dividerText: {
    fontFamily: CORMORANT_ITALIC,
    fontSize: 13,
    color: colors.white3,
  },
  googleBtn: {
    borderWidth: 1,
    borderColor: colors.border2,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  googleIcon: {
    color: colors.white2,
    fontSize: 16,
    fontFamily: DM,
  },
  googleText: {
    color: colors.white2,
    fontSize: 13,
    fontFamily: DM,
  },
  footerText: {
    marginTop: 16,
    textAlign: 'center',
    color: colors.white3,
    fontFamily: DM,
    fontSize: 13,
  },
  footerLink: {
    color: colors.gold,
  },
});
