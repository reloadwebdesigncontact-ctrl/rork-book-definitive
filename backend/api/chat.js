// ============================================================
// Cover Scan — Backend Proxy API
// OWASP Top 10 mitigations applied:
// A01 Broken Access Control     → token auth + rate limit
// A03 Injection                 → body validation, no raw passthrough
// A04 Insecure Design           → max_tokens cap, model whitelist
// A05 Security Misconfiguration → security headers, HTTPS only
// A06 Vulnerable Components     → kept dependencies minimal
// A07 Auth Failures             → constant-time token comparison
// ============================================================

// In-memory rate limiter (resets on cold start — acceptable for Vercel hobby)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;        // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 15;         // 15 req/min per IP (slightly tightened)
const MAX_BODY_SIZE_BYTES = 5 * 1024 * 1024; // 5MB max body (images en base64)
const MAX_IMAGE_BASE64_SIZE = 4 * 1024 * 1024; // 4MB max par image base64
const ALLOWED_MODELS = new Set(['gpt-4o-mini', 'gpt-4o']);
const MAX_TOKENS_LIMIT = 4096;
const MAX_MESSAGES = 10;
const MAX_TEXT_CONTENT_LENGTH = 20_000; // caractères par message texte

// Constant-time string comparison pour éviter les timing attacks (A07)
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) {
    // Effectue quand même la comparaison pour éviter le timing attack sur la longueur
    let result = 1;
    const minLen = Math.min(a.length, b.length);
    for (let i = 0; i < minLen; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  entry.count += 1;
  return false;
}

// Nettoyage périodique de la map
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap.entries()) {
    if (now - val.windowStart > RATE_LIMIT_WINDOW_MS * 2) {
      rateLimitMap.delete(key);
    }
  }
}, RATE_LIMIT_WINDOW_MS * 5);

// Valide un seul message
function validateMessage(msg) {
  if (!msg || typeof msg !== 'object') return false;
  if (!['system', 'user', 'assistant'].includes(msg.role)) return false;

  if (typeof msg.content === 'string') {
    if (msg.content.length > MAX_TEXT_CONTENT_LENGTH) return false;
    return true;
  }

  if (Array.isArray(msg.content)) {
    for (const part of msg.content) {
      if (!part || typeof part !== 'object') return false;
      if (!['text', 'image_url'].includes(part.type)) return false;

      if (part.type === 'text') {
        if (typeof part.text !== 'string') return false;
        if (part.text.length > MAX_TEXT_CONTENT_LENGTH) return false;
      }

      if (part.type === 'image_url') {
        if (!part.image_url || typeof part.image_url.url !== 'string') return false;
        const url = part.image_url.url;
        // N'accepter que les data URLs base64 d'images
        if (!url.startsWith('data:image/')) return false;
        // Vérifier la taille de l'image base64
        if (url.length > MAX_IMAGE_BASE64_SIZE) return false;
        // Vérifier que le mime type est une image reconnue
        if (!/^data:image\/(jpeg|jpg|png|webp|gif);base64,/.test(url)) return false;
      }
    }
    return true;
  }

  return false;
}

export default async function handler(req, res) {
  // ── Security headers (A05) ──────────────────────────────────
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Cache-Control', 'no-store');
  // CORS: wildcard acceptable pour une app mobile (React Native n'envoie pas d'Origin)
  // La vraie protection = token x-api-token requis sur chaque requête
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── Authentication (A01, A07) ───────────────────────────────
  const clientToken = req.headers['x-api-token'];
  const expectedToken = process.env.API_SECRET_TOKEN;

  if (!expectedToken) {
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  if (!safeEqual(clientToken, expectedToken)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // ── Rate limiting (A04) ─────────────────────────────────────
  const clientIp =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown';

  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: 'Too many requests. Please wait before retrying.' });
  }

  // ── Body size check (A03) ───────────────────────────────────
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  if (contentLength > MAX_BODY_SIZE_BYTES) {
    return res.status(413).json({ error: 'Request body too large' });
  }

  // ── Input validation (A03) ──────────────────────────────────
  const body = req.body;
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  if (body.model && !ALLOWED_MODELS.has(body.model)) {
    return res.status(400).json({ error: 'Model not allowed' });
  }

  if (body.max_tokens && (typeof body.max_tokens !== 'number' || body.max_tokens > MAX_TOKENS_LIMIT || body.max_tokens < 1)) {
    return res.status(400).json({ error: `max_tokens must be between 1 and ${MAX_TOKENS_LIMIT}` });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return res.status(400).json({ error: 'messages must be a non-empty array' });
  }

  if (body.messages.length > MAX_MESSAGES) {
    return res.status(400).json({ error: `Too many messages (max ${MAX_MESSAGES})` });
  }

  for (const msg of body.messages) {
    if (!validateMessage(msg)) {
      return res.status(400).json({ error: 'Invalid message format or content' });
    }
  }

  // ── Build safe payload (A03 — no raw passthrough) ───────────
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  const safeBody = {
    model: typeof body.model === 'string' && ALLOWED_MODELS.has(body.model) ? body.model : 'gpt-4o-mini',
    messages: body.messages,
    temperature: typeof body.temperature === 'number'
      ? Math.min(Math.max(body.temperature, 0), 1.5) // Limite à 1.5 (2.0 génère des outputs imprévisibles)
      : 0.7,
    max_tokens: typeof body.max_tokens === 'number' ? body.max_tokens : 4096,
  };

  // ── Proxy to OpenAI ─────────────────────────────────────────
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(safeBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Backend] OpenAI error:', response.status);
      // Ne jamais retransmettre les détails d'erreur OpenAI au client
      return res.status(502).json({ error: 'AI service error' });
    }

    // Ne retransmettre que le champ choices (pas les métadonnées d'usage qui révèlent le modèle/tokens)
    return res.status(200).json({
      choices: data.choices,
    });
  } catch (error) {
    console.error('[Backend] Unexpected error:', error?.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
