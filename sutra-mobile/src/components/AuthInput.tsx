import React, { useMemo, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors } from '../constants/colors';
import { CINZEL, DM } from '../constants/fonts';

interface AuthInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
}

export default function AuthInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  error,
}: AuthInputProps) {
  const [focused, setFocused] = useState<boolean>(false);
  const [hidden, setHidden] = useState<boolean>(secureTextEntry);

  const inputStyle = useMemo(
    () => [styles.input, focused ? styles.inputFocused : null, secureTextEntry ? styles.inputPadded : null],
    [focused, secureTextEntry]
  );

  const keyboardProps: Pick<TextInputProps, 'autoCapitalize' | 'keyboardType'> = placeholder
    .toLowerCase()
    .includes('email')
    ? { autoCapitalize: 'none', keyboardType: 'email-address' }
    : { autoCapitalize: 'sentences' };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.fieldWrap}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.white3}
          secureTextEntry={secureTextEntry ? hidden : false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={inputStyle}
          selectionColor={colors.gold}
          {...keyboardProps}
        />
        {secureTextEntry ? (
          <TouchableOpacity
            accessibilityRole="button"
            style={styles.eyeBtn}
            onPress={() => setHidden((prev) => !prev)}
          >
            <Text style={styles.eyeText}>{hidden ? '👁' : '🙈'}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontFamily: CINZEL,
    fontSize: 9,
    letterSpacing: 2,
    color: colors.gold,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  fieldWrap: {
    position: 'relative',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border2,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 15,
    color: colors.white,
    fontSize: 14,
    fontFamily: DM,
  },
  inputPadded: {
    paddingRight: 48,
  },
  inputFocused: {
    borderColor: 'rgba(212,168,83,0.5)',
    shadowColor: colors.gold,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    ...(Platform.OS === 'android' ? { elevation: 2 } : null),
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  eyeText: {
    color: colors.white3,
    fontSize: 14,
  },
  error: {
    marginTop: 8,
    color: colors.red,
    fontFamily: DM,
    fontSize: 12,
  },
});
