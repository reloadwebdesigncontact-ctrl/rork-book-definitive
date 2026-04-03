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
  content: string | Array<{ type: string; text?: string; image_url?: { url: string; detail?: string } }>;
}> {
  if (typeof input === "string") {
    return [{ role: "user", content: input }];
  }

  return input.messages.map((msg) => {
    if (typeof msg.content === "string") {
      return { role: msg.role, content: msg.content };
    }

    const parts: Array<{ type: string; text?: string; image_url?: { url: string; detail?: string } }> = [];

    for (const part of msg.content) {
      if (part.type === "text") {
        parts.push({ type: "text", text: part.text });
      } else if (part.type === "image") {
        parts.push({
          type: "image_url",
          image_url: { url: part.image, detail: "low" },
        });
      }
    }

    return { role: msg.role, content: parts };
  });
}

export async function generateText(input: GenerateTextInput): Promise<string> {
  if (!OPENAI_API_KEY) {
    console.error("[OpenAI] API key is missing! Set EXPO_PUBLIC_OPENAI_API_KEY.");
    throw new Error("OpenAI API key is not configured.");
  }

  const messages = buildOpenAIMessages(input);

  console.log("[OpenAI] Sending request with", messages.length, "message(s)");
  console.log("[OpenAI] API key present:", OPENAI_API_KEY.length > 0, "length:", OPENAI_API_KEY.length);

  let response: Response;
  try {
    response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 4096,
        temperature: 0.7,
      }),
    });
  } catch (networkError) {
    console.error("[OpenAI] Network error:", networkError);
    throw new Error("Network error while contacting OpenAI. Check your connection.");
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Unknown error");
    console.error("[OpenAI] API error:", response.status, errorBody);
    if (response.status === 401) {
      throw new Error("Invalid OpenAI API key. Please check your configuration.");
    }
    if (response.status === 429) {
      throw new Error("OpenAI rate limit exceeded. Please wait and try again.");
    }
    if (response.status === 402 || response.status === 403) {
      throw new Error("OpenAI billing issue. Check your account credits.");
    }
    throw new Error(`OpenAI API error: ${response.status} - ${errorBody.substring(0, 200)}`);
  }

  let data: { choices?: Array<{ message?: { content?: string } }> };
  try {
    data = await response.json();
  } catch (parseError) {
    console.error("[OpenAI] Failed to parse response JSON:", parseError);
    throw new Error("Failed to parse OpenAI response.");
  }

  const result = data?.choices?.[0]?.message?.content ?? "";

  if (!result) {
    console.error("[OpenAI] Empty response from API. Full data:", JSON.stringify(data).substring(0, 500));
    throw new Error("OpenAI returned an empty response.");
  }

  console.log("[OpenAI] Response received, length:", result.length);

  return result;
}
