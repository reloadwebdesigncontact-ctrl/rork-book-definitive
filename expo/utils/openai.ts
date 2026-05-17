const OPENAI_API_KEY = "";

const MODEL = "gpt-4o-mini";
const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL
  ? `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/chat`
  : "https://api.openai.com/v1/chat/completions";

const API_SECRET_TOKEN = process.env.EXPO_PUBLIC_API_SECRET_TOKEN || "";

type TextPart = { type: "text"; text: string };
type ImagePart = { type: "image"; image: string };
type UserMessage = { role: "user"; content: string | (TextPart | ImagePart)[] };
type AssistantMessage = { role: "assistant"; content: string | TextPart[] };
type SystemMessage = { role: "system"; content: string };

type GenerateTextInput =
  | string
  | { messages: (UserMessage | AssistantMessage | SystemMessage)[] };

interface OpenAIContentPart {
  type: "text" | "image_url";
  text?: string;
  image_url?: { url: string };
}

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string | OpenAIContentPart[];
}

function normalizeImageUrl(image: string): string {
  if (image.startsWith("data:")) return image;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return `data:image/jpeg;base64,${image}`;
}

function buildOpenAIMessages(input: GenerateTextInput): OpenAIMessage[] {
  if (typeof input === "string") {
    return [{ role: "user", content: input }];
  }

  return input.messages.map((msg): OpenAIMessage => {
    if (msg.role === "system") {
      return { role: "system", content: typeof msg.content === "string" ? msg.content : "" };
    }

    if (typeof msg.content === "string") {
      return { role: msg.role, content: msg.content };
    }

    const parts: OpenAIContentPart[] = [];
    for (const part of msg.content) {
      if (part.type === "text") {
        parts.push({ type: "text", text: part.text });
      } else if (part.type === "image") {
        parts.push({ type: "image_url", image_url: { url: normalizeImageUrl(part.image) } });
      }
    }

    return { role: msg.role, content: parts };
  });
}

async function callOpenAIApi(
  messages: OpenAIMessage[],
  retryCount: number = 0
): Promise<string> {
  console.log(`[OpenAI] Calling model: ${MODEL}, retry: ${retryCount}`);

  let response: Response;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);

    response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(API_URL.includes("openai.com") && { Authorization: `Bearer ${OPENAI_API_KEY}` }),
        ...(API_SECRET_TOKEN && { "x-api-token": API_SECRET_TOKEN }),
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 4096,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
  } catch (networkError: unknown) {
    const errMsg = networkError instanceof Error ? networkError.message : String(networkError);
    console.error(`[OpenAI] Network error:`, errMsg);

    if (retryCount < 2) {
      console.log(`[OpenAI] Retrying in ${(retryCount + 1) * 2}s...`);
      await new Promise((r) => setTimeout(r, 2000 * (retryCount + 1)));
      return callOpenAIApi(messages, retryCount + 1);
    }
    throw new Error(`Erreur réseau. Vérifiez votre connexion internet. (${errMsg})`);
  }

  let responseText = "";
  try {
    responseText = await response.text();
  } catch {
    console.error("[OpenAI] Failed to read response text");
  }

  console.log(`[OpenAI] HTTP status: ${response.status}, response length: ${responseText.length}`);

  if (!response.ok) {
    console.error(`[OpenAI] HTTP ${response.status}:`, responseText.substring(0, 500));

    if (response.status === 429) {
      if (retryCount < 2) {
        await new Promise((r) => setTimeout(r, 3000 * (retryCount + 1)));
        return callOpenAIApi(messages, retryCount + 1);
      }
      throw new Error("Limite de requêtes OpenAI atteinte. Réessayez dans un instant.");
    }
    if (response.status === 401) {
      throw new Error("Clé API OpenAI invalide ou non autorisée (401).");
    }
    if (response.status === 403) {
      throw new Error("Accès refusé par OpenAI (403).");
    }
    if (response.status >= 500 && retryCount < 2) {
      await new Promise((r) => setTimeout(r, 2000 * (retryCount + 1)));
      return callOpenAIApi(messages, retryCount + 1);
    }
    if (response.status === 400) {
      throw new Error(`Requête invalide (400): ${responseText.substring(0, 200)}`);
    }
    throw new Error(`Erreur API OpenAI: HTTP ${response.status}`);
  }

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(responseText);
  } catch {
    console.error("[OpenAI] Failed to parse JSON:", responseText.substring(0, 300));
    if (retryCount < 1) {
      await new Promise((r) => setTimeout(r, 2000));
      return callOpenAIApi(messages, retryCount + 1);
    }
    throw new Error("Impossible de lire la réponse de l'IA.");
  }

  const error = data.error as { message?: string; code?: string } | undefined;
  if (error?.message) {
    console.error("[OpenAI] API error:", error.code, error.message);
    throw new Error(`Erreur OpenAI: ${error.message}`);
  }

  const choices = data.choices as Array<{
    message?: { content?: string };
    finish_reason?: string;
  }> | undefined;

  const content = choices?.[0]?.message?.content ?? "";

  if (!content.trim()) {
    console.error("[OpenAI] Empty response:", JSON.stringify(data).substring(0, 500));
    if (retryCount < 1) {
      await new Promise((r) => setTimeout(r, 1500));
      return callOpenAIApi(messages, retryCount + 1);
    }
    throw new Error("L'IA a retourné une réponse vide.");
  }

  console.log(`[OpenAI] Success, length: ${content.length}`);
  return content;
}

export async function generateText(input: GenerateTextInput): Promise<string> {
  const messages = buildOpenAIMessages(input);
  const hasImage = messages.some(
    (m) => Array.isArray(m.content) && m.content.some((p) => p.type === "image_url")
  );
  console.log("[OpenAI] Request has image:", hasImage, "| messages count:", messages.length);
  return callOpenAIApi(messages);
}
