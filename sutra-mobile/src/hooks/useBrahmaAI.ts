import { useCallback, useState } from 'react';

import { ChatMessage, LifeScore } from '../constants/types';

interface OpenAIResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
  };
}

interface OpenAIRequestMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface UseBrahmaAIResult {
  isThinking: boolean;
  getResponse: (text: string, lifeScore: LifeScore, history: ChatMessage[]) => Promise<string>;
}

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4o-mini';

const buildSystemPrompt = (score: LifeScore): string =>
  `You are Brahma — the intelligent life guide within SUTRA, a Life OS app inspired by Sanatana Dharma. Speak with wisdom from the Bhagavad Gita, Chanakya Niti, and Arthashastra. You have the user's current data: Life Score: ${score.total}, Tapas: ${score.discipline}, Ārogya: ${score.health}, Artha: ${score.finance}, Vidyā: ${score.growth}, Agni Streak: ${score.streak} days. Keep responses under 60 words. Be direct, personal, and wise. Reference Sanskrit concepts naturally. Never be generic.`;

const toOpenAIHistory = (history: ChatMessage[]): OpenAIRequestMessage[] =>
  history.slice(-10).map((message) => ({
    role: message.role === 'ai' ? 'assistant' : 'user',
    content: message.text,
  }));

export default function useBrahmaAI(): UseBrahmaAIResult {
  const [isThinking, setIsThinking] = useState<boolean>(false);

  const getResponse = useCallback(
    async (text: string, lifeScore: LifeScore, history: ChatMessage[]): Promise<string> => {
      const trimmed = text.trim();
      if (!trimmed) {
        return '';
      }

      setIsThinking(true);

      try {
        const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
        if (!apiKey) {
          throw new Error('Missing EXPO_PUBLIC_OPENAI_API_KEY.');
        }

        const requestMessages: OpenAIRequestMessage[] = [
          {
            role: 'system',
            content: buildSystemPrompt(lifeScore),
          },
          ...toOpenAIHistory(history),
          {
            role: 'user',
            content: trimmed,
          },
        ];

        const response = await fetch(OPENAI_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: OPENAI_MODEL,
            max_tokens: 120,
            messages: requestMessages,
          }),
        });

        const data = (await response.json()) as OpenAIResponse;

        if (!response.ok) {
          const message = data.error?.message ?? 'Brahma could not respond right now.';
          throw new Error(message);
        }

        return (
          data.choices?.[0]?.message?.content?.trim() ??
          'Agni is unstable at the moment. Breathe, then ask again in a few moments.'
        );
      } catch {
        return 'Agni is unstable at the moment. Breathe, then ask again in a few moments.';
      } finally {
        setIsThinking(false);
      }
    },
    []
  );

  return {
    isThinking,
    getResponse,
  };
}
