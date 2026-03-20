import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
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
import { signInWithEmail, signInWithGoogle } from '../lib/firebaseAuth';
import { getProfile } from '../lib/supabase';
import { AuthStackParamList, RootStackParamList } from '../navigation/AppNavigator';

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
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

  const routeByProfile = async (uid: string): Promise<void> => {
    const profile = await getProfile(uid);
    const rootNav = navigation.getParent<NavigationProp<RootStackParamList>>();

    if (profile?.onboardingComplete) {
      rootNav?.navigate('MainTabs');
      return;
    }

    rootNav?.navigate('OnboardingStack');
  };

  const handleEmailSignIn = async (): Promise<void> => {
    setError(null);
    setLoading(true);

    const result = await signInWithEmail(email.trim(), password);
    if (result.error || !result.user) {
      setError(result.error ?? 'Incorrect email or password. Try again.');
      setLoading(false);
      return;
    }

    await routeByProfile(result.user.uid);
    setLoading(false);
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    setError(null);
    setLoading(true);

    const result = await signInWithGoogle();
    if (result.error || !result.user) {
      setError(result.error ?? 'Google sign in failed. Please try again.');
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
            <Animated.Text style={[styles.topOm, { transform: [{ scale: pulse }] }]}>ॐ</Animated.Text>
            <Text style={styles.title}>WELCOME BACK</Text>
            <Text style={styles.subtitle}>पुनरागमन — Return to the path</Text>
          </View>

          <View style={styles.form}>
            <AuthInput
              label="Email Address"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
            />

            <AuthInput
              label="Password"
              placeholder="Your sacred key"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPasswordScreen')}
              style={styles.forgotLinkWrap}
            >
              <Text style={styles.forgotLink}>Forgot Password?</Text>
            </TouchableOpacity>

            <GoldButton title="SIGN IN TO SUTRA" onPress={handleEmailSignIn} loading={loading} />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.dividerWrap}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.googleBtn}
              onPress={handleGoogleSignIn}
              disabled={loading}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleText}>Continue with Google</Text>
            </TouchableOpacity>

            <Text style={styles.footerText}>
              New to SUTRA?{' '}
              <Text style={styles.footerLink} onPress={() => navigation.navigate('SignupScreen')}>
                Begin your journey
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
    paddingBottom: 28,
    zIndex: 1,
  },
  topOm: {
    fontSize: 28,
    color: colors.gold,
    marginBottom: 14,
    textShadowColor: 'rgba(212,168,83,0.6)',
    textShadowRadius: 10,
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
    marginTop: 24,
    zIndex: 1,
  },
  forgotLinkWrap: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 4,
  },
  forgotLink: {
    fontFamily: DM,
    fontSize: 12,
    color: colors.gold,
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
    marginTop: 20,
    textAlign: 'center',
    color: colors.white3,
    fontFamily: DM,
    fontSize: 13,
  },
  footerLink: {
    color: colors.gold,
  },
});
