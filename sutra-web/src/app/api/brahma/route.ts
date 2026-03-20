import { NextResponse } from "next/server";

interface LifeScorePayload {
  total: number;
  discipline: number;
  health: number;
  finance: number;
  growth: number;
  streak: number;
}

interface RequestBody {
  message: string;
  lifeScore: LifeScorePayload;
}

interface OpenAIResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const endpoint = "https://api.openai.com/v1/chat/completions";

const buildPrompt = (score: LifeScorePayload): string =>
  `You are Brahma - the intelligent life guide within SUTRA, inspired by Sanatana Dharma. Speak with wisdom from the Bhagavad Gita, Chanakya Niti, and Arthashastra. Keep responses under 60 words, direct and personal. User data: Life Score ${score.total}, Tapas ${score.discipline}, Arogya ${score.health}, Artha ${score.finance}, Vidya ${score.growth}, Agni Streak ${score.streak}.`;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        response:
          "Act without anxiety for outcomes. Your strongest karmic window is still the morning. Protect it, and your score will rise again.",
      });
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 120,
        messages: [
          { role: "system", content: buildPrompt(body.lifeScore) },
          { role: "user", content: body.message },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({
        response:
          "Breathe. Even pause has dharma. Ask again and we will continue with clarity.",
      });
    }

    const data = (await response.json()) as OpenAIResponse;
    const text =
      data.choices?.[0]?.message?.content?.trim() ??
      "Karma first, noise later. Anchor your action in one clear next step.";

    return NextResponse.json({ response: text });
  } catch {
    return NextResponse.json({
      response: "Agni is unstable right now. Ask once more in a moment.",
    });
  }
}
