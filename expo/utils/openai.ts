const GOOGLE_AI_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY || "";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

type TextPart = { type: "text"; text: string };
type ImagePart = { type: "image"; image: string };
type UserMessage = { role: "user"; content: string | (TextPart | ImagePart)[] };
type AssistantMessage = { role: "assistant"; content: string | TextPart[] };

type GenerateTextInput =
  | string
  | { messages: (UserMessage | AssistantMessage)[] };

interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

interface GeminiContent {
  role: string;
  parts: GeminiPart[];
}

function extractBase64Info(dataUri: string): { mimeType: string; data: string } {
  const match = dataUri.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], data: match[2] };
  }
  return { mimeType: "image/jpeg", data: dataUri };
}

function buildGeminiContents(input: GenerateTextInput): GeminiContent[] {
  if (typeof input === "string") {
    return [{ role: "user", parts: [{ text: input }] }];
  }

  return input.messages.map((msg) => {
    const role = msg.role === "assistant" ? "model" : "user";

    if (typeof msg.content === "string") {
      return { role, parts: [{ text: msg.content }] };
    }

    const parts: GeminiPart[] = [];

    for (const part of msg.content) {
      if (part.type === "text") {
        parts.push({ text: part.text });
      } else if (part.type === "image") {
        const { mimeType, data } = extractBase64Info(part.image);
        parts.push({
          inlineData: {
            mimeType,
            data,
          },
        });
      }
    }

    return { role, parts };
  });
}

export async function generateText(input: GenerateTextInput): Promise<string> {
  if (!GOOGLE_AI_API_KEY) {
    console.error("[GoogleAI] API key is missing! Set EXPO_PUBLIC_GOOGLE_AI_API_KEY.");
    throw new Error("Google AI API key is not configured.");
  }

  const contents = buildGeminiContents(input);

  console.log("[GoogleAI] Sending request with", contents.length, "content(s)");
  console.log("[GoogleAI] API key present:", GOOGLE_AI_API_KEY.length > 0, "length:", GOOGLE_AI_API_KEY.length);

  const url = `${GEMINI_API_URL}?key=${GOOGLE_AI_API_KEY}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
      }),
    });
  } catch (networkError) {
    console.error("[GoogleAI] Network error:", networkError);
    throw new Error("Network error while contacting Google AI. Check your connection.");
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Unknown error");
    console.error("[GoogleAI] API error:", response.status, errorBody);
    if (response.status === 400) {
      console.error("[GoogleAI] Bad request. Check your API key and request format.");
      throw new Error("Google AI bad request. Check API key format.");
    }
    if (response.status === 403) {
      throw new Error("Google AI API key invalid or not authorized.");
    }
    if (response.status === 429) {
      throw new Error("Google AI rate limit exceeded. Please wait and try again.");
    }
    throw new Error(`Google AI API error: ${response.status} - ${errorBody.substring(0, 200)}`);
  }

  let data: {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
    error?: { message?: string };
  };

  try {
    data = await response.json();
  } catch (parseError) {
    console.error("[GoogleAI] Failed to parse response JSON:", parseError);
    throw new Error("Failed to parse Google AI response.");
  }

  console.log("[GoogleAI] Raw response keys:", Object.keys(data));

  if (data.error) {
    console.error("[GoogleAI] API returned error:", data.error.message);
    throw new Error(`Google AI error: ${data.error.message}`);
  }

  const result = data?.candidates?.[0]?.content?.parts
    ?.map((p) => p.text || "")
    .join("") ?? "";

  if (!result) {
    console.error("[GoogleAI] Empty response from API. Full data:", JSON.stringify(data).substring(0, 500));
    throw new Error("Google AI returned an empty response.");
  }

  console.log("[GoogleAI] Response received, length:", result.length);

  return result;
}
