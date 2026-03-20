import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import CosmosBackground from '../components/CosmosBackground';
import { colors } from '../constants/colors';
import { CINZEL, CORMORANT, CORMORANT_ITALIC, DM, DM_MEDIUM } from '../constants/fonts';
import { ChatMessage, LifeScore } from '../constants/types';
import { useAuthContext } from '../context/AuthContext';
import useBrahmaAI from '../hooks/useBrahmaAI';
import useLifeScore from '../hooks/useLifeScore';

const SUGGESTIONS = [
  'Why is my score dropping?',
  'How to fix my sleep?',
  'Best time to study today?',
  'My finance review',
  'Give me a mantra for today',
] as const;

const FALLBACK_SCORE: LifeScore = {
  discipline: 55,
  health: 55,
  finance: 55,
  growth: 55,
  total: 55,
  label: 'Building',
  labelSanskrit: '\u0928\u093f\u0930\u094d\u092e\u093e\u0923',
  streak: 0,
  change: 0,
  lastUpdated: new Date(),
};

const createId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export default function BrahmaScreen() {
  const { user, profile } = useAuthContext();
  const { lifeScore } = useLifeScore(user?.uid ?? null);
  const { isThinking, getResponse } = useBrahmaAI();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: createId(),
      role: 'ai',
      text: 'Ask with sincerity. I will answer from dharma, not distraction.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState<string>('');
  const chatRef = useRef<ScrollView>(null);
  const dotAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const activeLifeScore = useMemo(() => lifeScore ?? FALLBACK_SCORE, [lifeScore]);

  const scrollToBottom = (): void => {
    requestAnimationFrame(() => {
      chatRef.current?.scrollToEnd({ animated: true });
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  useEffect(() => {
    if (!isThinking) {
      dotAnims.forEach((anim) => {
        anim.stopAnimation();
        anim.setValue(0);
      });
      return;
    }

    const loops: Animated.CompositeAnimation[] = dotAnims.map((anim, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 200),
          Animated.timing(anim, {
            toValue: 1,
            duration: 420,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 420,
            useNativeDriver: true,
          }),
        ])
      )
    );

    loops.forEach((loop) => loop.start());

    return () => {
      loops.forEach((loop) => loop.stop());
    };
  }, [dotAnims, isThinking]);

  const submitMessage = async (text: string): Promise<void> => {
    const trimmed = text.trim();
    if (!trimmed || isThinking) {
      return;
    }

    const userMessage: ChatMessage = {
      id: createId(),
      role: 'user',
      text: trimmed,
      timestamp: new Date(),
    };

    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);

    const aiText = await getResponse(trimmed, activeLifeScore, nextHistory);
    if (!aiText) {
      return;
    }

    const aiMessage: ChatMessage = {
      id: createId(),
      role: 'ai',
      text: aiText,
      timestamp: new Date(),
    };

    setMessages((previous) => [...previous, aiMessage]);
  };

  const handleSend = (): void => {
    const outgoing = input;
    setInput('');
    void submitMessage(outgoing);
  };

  const handleSuggestionPress = (suggestion: string): void => {
    void submitMessage(suggestion);
  };

  return (
    <SafeAreaView style={styles.root}>
      <CosmosBackground />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{'\u{1F531} BRAHMA AI'}</Text>
            <Text style={styles.headerSubtitle}>Your intelligent life guide</Text>
            <Text style={styles.metaLabel}>
              LIFE SCORE {activeLifeScore.total} \u00b7 AGNI {activeLifeScore.streak}D
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {SUGGESTIONS.map((chip) => (
              <TouchableOpacity
                key={chip}
                style={styles.chip}
                activeOpacity={0.85}
                onPress={() => handleSuggestionPress(chip)}
              >
                <Text style={styles.chipText}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView
            ref={chatRef}
            style={styles.chatScroll}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToBottom}
          >
            {messages.map((message) =>
              message.role === 'ai' ? (
                <View key={message.id} style={styles.aiRow}>
                  <View style={styles.aiAvatar}>
                    <Text style={styles.aiAvatarText}>{'\u{1F531}'}</Text>
                  </View>

                  <View style={styles.aiColumn}>
                    <Text style={styles.aiLabel}>BRAHMA</Text>
                    <View style={styles.aiBubble}>
                      <Text style={styles.aiText}>{message.text}</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View key={message.id} style={styles.userRow}>
                  <View style={styles.userColumn}>
                    <View style={styles.userBubble}>
                      <Text style={styles.userText}>{message.text}</Text>
                    </View>
                  </View>

                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>{profile?.emoji ?? '\u{1F9D8}'}</Text>
                  </View>
                </View>
              )
            )}

            {isThinking ? (
              <View style={styles.aiRow}>
                <View style={styles.aiAvatar}>
                  <Text style={styles.aiAvatarText}>{'\u{1F531}'}</Text>
                </View>

                <View style={styles.aiColumn}>
                  <Text style={styles.aiLabel}>BRAHMA</Text>
                  <View style={styles.thinkingBubble}>
                    {dotAnims.map((anim, index) => (
                      <Animated.View
                        key={`dot-${index.toString()}`}
                        style={[
                          styles.thinkingDot,
                          {
                            opacity: anim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.4, 1],
                            }),
                            transform: [
                              {
                                scale: anim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0.8, 1.1],
                                }),
                              },
                            ],
                          },
                        ]}
                      />
                    ))}
                  </View>
                </View>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.inputWrap}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask Brahma..."
              placeholderTextColor={colors.white3}
              style={styles.input}
              multiline
              maxLength={220}
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                (!input.trim() || isThinking) && styles.sendButtonDisabled,
              ]}
              activeOpacity={0.85}
              disabled={!input.trim() || isThinking}
              onPress={handleSend}
            >
              <Text style={styles.sendText}>{'\u2191'}</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  content: {
    flex: 1,
    zIndex: 1,
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 10,
  },
  headerTitle: {
    fontFamily: CINZEL,
    fontSize: 20,
    letterSpacing: 2,
    color: colors.white,
  },
  headerSubtitle: {
    marginTop: 4,
    fontFamily: CORMORANT_ITALIC,
    fontSize: 15,
    color: colors.white3,
  },
  metaLabel: {
    marginTop: 6,
    fontFamily: CINZEL,
    fontSize: 8,
    letterSpacing: 1.5,
    color: colors.gold,
  },
  chipsRow: {
    paddingHorizontal: 18,
    paddingBottom: 8,
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border2,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    fontFamily: CINZEL,
    fontSize: 9,
    letterSpacing: 0.5,
    color: colors.white2,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 18,
    paddingBottom: 14,
    gap: 12,
  },
  aiRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border2,
    backgroundColor: colors.golddim,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  aiAvatarText: {
    fontSize: 16,
  },
  aiColumn: {
    maxWidth: '82%',
  },
  aiLabel: {
    fontFamily: CINZEL,
    fontSize: 8,
    letterSpacing: 2,
    color: colors.gold,
    marginBottom: 5,
    marginLeft: 6,
  },
  aiBubble: {
    borderWidth: 1,
    borderColor: colors.border2,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  aiText: {
    fontFamily: CORMORANT,
    fontSize: 15,
    color: colors.white2,
    lineHeight: 21,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    gap: 10,
  },
  userColumn: {
    maxWidth: '82%',
    alignItems: 'flex-end',
  },
  userBubble: {
    borderWidth: 1,
    borderColor: colors.border2,
    backgroundColor: colors.golddim,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  userText: {
    fontFamily: DM,
    fontSize: 14,
    color: colors.white,
    lineHeight: 20,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 16,
  },
  thinkingBubble: {
    borderWidth: 1,
    borderColor: colors.border2,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 7,
  },
  thinkingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.gold,
  },
  inputWrap: {
    borderTopWidth: 1,
    borderTopColor: colors.border2,
    backgroundColor: 'rgba(5,6,10,0.95)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border2,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: colors.surface,
    fontFamily: DM,
    fontSize: 13,
    color: colors.white,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gold,
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
  sendText: {
    fontFamily: DM_MEDIUM,
    fontSize: 20,
    lineHeight: 22,
    color: colors.bg,
  },
});
