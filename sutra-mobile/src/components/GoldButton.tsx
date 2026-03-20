import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../constants/colors';
import { CINZEL } from '../constants/fonts';

interface GoldButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  outline?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function GoldButton({
  title,
  onPress,
  loading = false,
  outline = false,
  style,
}: GoldButtonProps) {
  const buttonText = loading ? 'PROCESSING...' : title;

  if (outline) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        disabled={loading}
        onPress={onPress}
        style={[styles.baseButton, styles.outlineButton, loading ? styles.disabled : null, style]}
      >
        <View style={styles.innerRow}>
          {loading ? <ActivityIndicator color={colors.gold} size="small" /> : null}
          <Text style={[styles.baseText, styles.outlineText]}>{buttonText}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      disabled={loading}
      onPress={onPress}
      style={[styles.baseButton, loading ? styles.disabled : null, style]}
    >
      <LinearGradient colors={[colors.gold, colors.gold2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
        <View style={styles.innerRow}>
          {loading ? <ActivityIndicator color={colors.bg} size="small" /> : null}
          <Text style={[styles.baseText, styles.filledText]}>{buttonText}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: 16,
    paddingVertical: 17,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: colors.border2,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  baseText: {
    fontFamily: CINZEL,
    fontSize: 12,
    letterSpacing: 2.5,
  },
  filledText: {
    color: colors.bg,
  },
  outlineText: {
    color: colors.gold,
  },
  disabled: {
    opacity: 0.85,
  },
});
