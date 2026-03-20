import React, { useEffect, useRef } from 'react';
import { Animated, Easing, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Stop } from 'react-native-svg';

import CosmosBackground from '../components/CosmosBackground';
import GoldButton from '../components/GoldButton';
import { colors } from '../constants/colors';
import { CINZEL_BLACK, CORMORANT_ITALIC } from '../constants/fonts';
import { AuthStackParamList } from '../navigation/AppNavigator';

const PETAL_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

export default function WelcomeScreen() {
  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();

  const rotation = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const rotateLoop = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

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

    rotateLoop.start();
    pulseLoop.start();

    return () => {
      rotateLoop.stop();
      pulseLoop.stop();
    };
  }, [pulse, rotation]);

  const ringRotation = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.root}>
      <CosmosBackground />

      <View style={styles.content}>
        <View style={styles.mandalaWrap}>
          <Animated.View style={{ transform: [{ rotate: ringRotation }] }}>
            <Svg width={180} height={180} viewBox="0 0 180 180">
              <Defs>
                <LinearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor={colors.gold} />
                  <Stop offset="100%" stopColor={colors.gold2} />
                </LinearGradient>
              </Defs>

              <Circle
                cx={90}
                cy={90}
                r={82}
                fill="none"
                stroke="rgba(212,168,83,0.12)"
                strokeWidth={1}
                strokeDasharray="6 10"
              />
              <Circle
                cx={90}
                cy={90}
                r={70}
                fill="none"
                stroke="rgba(212,168,83,0.08)"
                strokeWidth={1}
                strokeDasharray="3 8"
              />
              <G opacity={0.2} x={90} y={90}>
                {PETAL_ANGLES.map((angle) => (
                  <Ellipse
                    key={angle}
                    rx={5}
                    ry={12}
                    fill={colors.gold}
                    transform={`rotate(${angle}) translate(0 -62)`}
                  />
                ))}
              </G>
              <Circle
                cx={90}
                cy={90}
                r={82}
                fill="none"
                stroke="url(#ringGrad)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeDasharray="200 315"
                transform="rotate(-90 90 90)"
                opacity={0.4}
              />
            </Svg>
          </Animated.View>

          <Animated.Text style={[styles.om, { transform: [{ scale: pulse }] }]}>ॐ</Animated.Text>
        </View>

        <Text style={styles.logo}>SUTRA</Text>
        <Text style={styles.tagline}>dharma • karma • moksha</Text>
      </View>

      <View style={styles.footerButtons}>
        <GoldButton
          title="BEGIN YOUR JOURNEY"
          onPress={() => navigation.navigate('SignupScreen')}
        />
        <GoldButton
          outline
          title="I HAVE AN ACCOUNT"
          onPress={() => navigation.navigate('LoginScreen')}
        />
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
    paddingHorizontal: 32,
    zIndex: 1,
  },
  mandalaWrap: {
    width: 180,
    height: 180,
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  om: {
    position: 'absolute',
    color: colors.gold,
    fontSize: 64,
    lineHeight: 72,
    textShadowColor: 'rgba(212,168,83,0.7)',
    textShadowRadius: 20,
  },
  logo: {
    fontFamily: CINZEL_BLACK,
    fontSize: 44,
    letterSpacing: 8,
    color: colors.gold,
    marginBottom: 6,
    textShadowColor: 'rgba(212,168,83,0.3)',
    textShadowRadius: 12,
  },
  tagline: {
    fontFamily: CORMORANT_ITALIC,
    fontSize: 15,
    letterSpacing: 2,
    color: colors.white3,
  },
  footerButtons: {
    zIndex: 1,
    paddingHorizontal: 32,
    paddingBottom: 32,
    gap: 12,
  },
});
