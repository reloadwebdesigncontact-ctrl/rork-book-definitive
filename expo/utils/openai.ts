const GOOGLE_AI_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY || "";

const MODELS = ["gemini-2.0-flash", "gemini-1.5-flash"];

function getApiUrl(model: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_AI_API_KEY}`;
}

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

function extractBase64Data(dataUri: string): { mimeType: string; data: string } {
  const match = dataUri.match(/^data:([^;]+);base64,(.+)$/s);
  if (match) {
    return { mimeType: match[1], data: match[2] };
  }
  if (dataUri.startsWith("data:")) {
    const simpleMatch = dataUri.match(/^data:([^,]+),(.+)$/s);
    if (simpleMatch) {
      return { mimeType: simpleMatch[1].replace(";base64", ""), data: simpleMatch[2] };
    }
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
        const { mimeType, data } = extractBase64Data(part.image);
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

async function callGeminiApi(
  model: string,
  contents: GeminiContent[],
  retryCount: number = 0
): Promise<string> {
  const url = getApiUrl(model);

  console.log(`[GoogleAI] Calling model: ${model}, retry: ${retryCount}`);

  let response: Response;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);

    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
  } catch (networkError: unknown) {
    const errMsg = networkError instanceof Error ? networkError.message : String(networkError);
    console.error(`[GoogleAI] Network error (${model}):`, errMsg);

    if (retryCount < 2) {
      console.log(`[GoogleAI] Retrying in ${(retryCount + 1)}s...`);
      await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)));
      return callGeminiApi(model, contents, retryCount + 1);
    }
    throw new Error(`Erreur réseau. Vérifiez votre connexion internet. (${errMsg})`);
  }

  let responseText = "";
  try {
    responseText = await response.text();
  } catch {
    console.error("[GoogleAI] Failed to read response text");
  }

  if (!response.ok) {
    console.error(`[GoogleAI] HTTP ${response.status} from ${model}:`, responseText.substring(0, 500));

    if (response.status === 429 && retryCount < 2) {
      await new Promise(r => setTimeout(r, 3000 * (retryCount + 1)));
      return callGeminiApi(model, contents, retryCount + 1);
    }
    if (response.status >= 500 && retryCount < 2) {
      await new Promise(r => setTimeout(r, 2000 * (retryCount + 1)));
      return callGeminiApi(model, contents, retryCount + 1);
    }
    if (response.status === 400) {
      console.error(`[GoogleAI] Bad request details:`, responseText.substring(0, 1000));
      throw new Error(`Requête invalide (400). Détails: ${responseText.substring(0, 200)}`);
    }
    if (response.status === 403) {
      throw new Error("Clé API Google AI invalide ou non autorisée (403).");
    }
    throw new Error(`Erreur API Google AI: ${response.status}`);
  }

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(responseText);
  } catch {
    console.error("[GoogleAI] Failed to parse JSON response:", responseText.substring(0, 300));
    if (retryCount < 1) {
      await new Promise(r => setTimeout(r, 1500));
      return callGeminiApi(model, contents, retryCount + 1);
    }
    throw new Error("Impossible de lire la réponse de l'IA.");
  }

  console.log("[GoogleAI] Response keys:", Object.keys(data));

  const error = data.error as { message?: string } | undefined;
  if (error?.message) {
    console.error("[GoogleAI] API error:", error.message);
    throw new Error(`Erreur Google AI: ${error.message}`);
  }

  const promptFeedback = data.promptFeedback as { blockReason?: string } | undefined;
  if (promptFeedback?.blockReason) {
    console.error("[GoogleAI] Blocked:", promptFeedback.blockReason);
    throw new Error(`Requête bloquée par Google AI: ${promptFeedback.blockReason}`);
  }

  const candidates = data.candidates as Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }> | undefined;

  const candidate = candidates?.[0];
  if (!candidate) {
    console.error("[GoogleAI] No candidates in response:", JSON.stringify(data).substring(0, 500));
    if (retryCount < 1) {
      await new Promise(r => setTimeout(r, 1500));
      return callGeminiApi(model, contents, retryCount + 1);
    }
    throw new Error("L'IA n'a retourné aucune réponse.");
  }

  if (candidate.finishReason === "SAFETY") {
    console.warn("[GoogleAI] Response blocked for safety reasons");
    throw new Error("La réponse a été bloquée pour des raisons de sécurité.");
  }

  const result = candidate.content?.parts
    ?.map((p) => p.text || "")
    .join("") ?? "";

  if (!result.trim()) {
    console.error("[GoogleAI] Empty response text. Full:", JSON.stringify(data).substring(0, 500));
    if (retryCount < 1) {
      await new Promise(r => setTimeout(r, 1000));
      return callGeminiApi(model, contents, retryCount + 1);
    }
    throw new Error("L'IA a retourné une réponse vide.");
  }

  console.log(`[GoogleAI] Success from ${model}, length: ${result.length}`);
  return result;
}

export async function generateText(input: GenerateTextInput): Promise<string> {
  if (!GOOGLE_AI_API_KEY) {
    console.error("[GoogleAI] EXPO_PUBLIC_GOOGLE_AI_API_KEY is not set!");
    throw new Error("Clé API Google AI non configurée. Ajoutez EXPO_PUBLIC_GOOGLE_AI_API_KEY.");
  }

  console.log("[GoogleAI] API key present, length:", GOOGLE_AI_API_KEY.length);

  const contents = buildGeminiContents(input);
  const hasImage = contents.some(c => c.parts.some(p => !!p.inlineData));
  console.log("[GoogleAI] Request has image:", hasImage, "| contents count:", contents.length);

  for (let i = 0; i < MODELS.length; i++) {
    const model = MODELS[i];
    try {
      console.log(`[GoogleAI] Trying model: ${model} (${i + 1}/${MODELS.length})`);
      const result = await callGeminiApi(model, contents);
      return result;
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.warn(`[GoogleAI] Model ${model} failed: ${errMsg}`);

      if (
        errMsg.includes("non configurée") ||
        errMsg.includes("invalide") ||
        errMsg.includes("403") ||
        errMsg.includes("bloquée") ||
        errMsg.includes("sécurité")
      ) {
        throw error;
      }

      if (i < MODELS.length - 1) {
        console.log(`[GoogleAI] Falling back to next model...`);
        continue;
      }
      throw error;
    }
  }

  throw new Error("Tous les modèles IA ont échoué. Réessayez plus tard.");
}
