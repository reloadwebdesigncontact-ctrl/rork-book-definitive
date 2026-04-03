const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || "";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

type TextPart = { type: "text"; text: string };
type ImagePart = { type: "image"; image: string };
type UserMessage = { role: "user"; content: string | (TextPart | ImagePart)[] };
type AssistantMessage = { role: "assistant"; content: string | TextPart[] };

type GenerateTextInput =
  | string
  | { messages: (UserMessage | AssistantMessage)[] };

function buildOpenAIMessages(input: GenerateTextInput): Array<{
  role: string;
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}> {
  if (typeof input === "string") {
    return [{ role: "user", content: input }];
  }

  return input.messages.map((msg) => {
    if (typeof msg.content === "string") {
      return { role: msg.role, content: msg.content };
    }

    const parts: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];

    for (const part of msg.content) {
      if (part.type === "text") {
        parts.push({ type: "text", text: part.text });
      } else if (part.type === "image") {
        const imageUrl = part.image.startsWith("data:")
          ? part.image
          : part.image;
        parts.push({
          type: "image_url",
          image_url: { url: imageUrl },
        });
      }
    }

    return { role: msg.role, content: parts };
  });
}

export async function generateText(input: GenerateTextInput): Promise<string> {
  const messages = buildOpenAIMessages(input);

  console.log("[OpenAI] Sending request with", messages.length, "message(s)");

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages,
      max_tokens: 4096,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Unknown error");
    console.error("[OpenAI] API error:", response.status, errorBody);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const result = data?.choices?.[0]?.message?.content ?? "";

  console.log("[OpenAI] Response received, length:", result.length);

  return result;
}
