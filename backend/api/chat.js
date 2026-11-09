// ============================================================
// Summshine — Backend Proxy API
// OWASP Top 10 mitigations applied:
// A01 Broken Access Control     → token auth + dual rate limit (IP + token)
// A03 Injection                 → body validation, no raw passthrough
// A04 Insecure Design           → max_tokens cap, model whitelist
// A05 Security Misconfiguration → security headers, CSP, HTTPS only
// A06 Vulnerable Components     → kept dependencies minimal
// A07 Auth Failures             → constant-time token comparison
// ============================================================

// In-memory rate limiters (reset on cold start — acceptable for Vercel hobby)
const ipRateLimitMap   = new Map(); // par IP
const tokRateLimitMap  = new Map(); // par token (défense en profondeur si token fuite)

const RATE_LIMIT_WINDOW_MS     = 60_000; // 1 minute
const IP_RATE_LIMIT_MAX        = 15;     // 15 req/min par IP
const TOKEN_RATE_LIMIT_MAX     = 60;     // 60 req/min pour tout le token (toutes IPs)
const MAX_BODY_SIZE_BYTES      = 5 * 1024 * 1024;  // 5 MB
const MAX_IMAGE_BASE64_SIZE    = 4 * 1024 * 1024;  // 4 MB par image
const ALLOWED_MODELS           = new Set(['gpt-4o-mini', 'gpt-4o']);
const MAX_TOKENS_LIMIT         = 4096;
const MAX_MESSAGES             = 10;
const MAX_TEXT_CONTENT_LENGTH  = 20_000;

// ── Utilitaires ─────────────────────────────────────────────

/** Comparaison en temps constant — évite les timing attacks (OWASP A07) */
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) {
    let r = 1;
    const minLen = Math.min(a.length, b.length);
    for (let i = 0; i < minLen; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

function checkRateLimit(map, key, max) {
  const now = Date.now();
  const entry = map.get(key);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    map.set(key, { windowStart: now, count: 1 });
    return false;
  }
  if (entry.count >= max) return true;
  entry.count += 1;
  return false;
}

// Nettoyage périodique des maps
setInterval(() => {
  const now = Date.now();
  const cutoff = RATE_LIMIT_WINDOW_MS * 2;
  for (const map of [ipRateLimitMap, tokRateLimitMap]) {
    for (const [key, val] of map.entries()) {
      if (now - val.windowStart > cutoff) map.delete(key);
    }
  }
}, RATE_LIMIT_WINDOW_MS * 5);

/** Valide un seul message OpenAI */
function validateMessage(msg) {
  if (!msg || typeof msg !== 'object') return false;
  if (!['system', 'user', 'assistant'].includes(msg.role)) return false;

  if (typeof msg.content === 'string') {
    return msg.content.length <= MAX_TEXT_CONTENT_LENGTH;
  }

  if (Array.isArray(msg.content)) {
    for (const part of msg.content) {
      if (!part || typeof part !== 'object') return false;
      if (!['text', 'image_url'].includes(part.type)) return false;

      if (part.type === 'text') {
        if (typeof part.text !== 'string' || part.text.length > MAX_TEXT_CONTENT_LENGTH) return false;
      }

      if (part.type === 'image_url') {
        if (!part.image_url || typeof part.image_url.url !== 'string') return false;
        const url = part.image_url.url;
        if (!url.startsWith('data:image/')) return false;
        if (url.length > MAX_IMAGE_BASE64_SIZE) return false;
        if (!/^data:image\/(jpeg|jpg|png|webp|gif);base64,/.test(url)) return false;
      }
    }
    return true;
  }

  return false;
}

// ── Handler principal ────────────────────────────────────────

export default async function handler(req, res) {

  // ── Security headers (A05) ──────────────────────────────────
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', "default-src 'none'");
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // CORS : wildcard acceptable pour app mobile (React Native n'envoie pas d'Origin)
  // Protection réelle = token x-api-token requis sur chaque requête
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-token');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── Authentication (A01, A07) ───────────────────────────────
  const clientToken  = req.headers['x-api-token'];
  const expectedToken = process.env.API_SECRET_TOKEN;

  if (!expectedToken) {
    console.error('[Backend] API_SECRET_TOKEN not configured');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  if (!safeEqual(clientToken, expectedToken)) {
    // Délai artificiel pour ralentir le brute-force (50-150ms aléatoire)
    await new Promise(r => setTimeout(r, 50 + Math.floor(Math.random() * 100)));
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // ── Rate limiting double (IP + token) ───────────────────────
  const clientIp =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown';

  if (checkRateLimit(ipRateLimitMap, clientIp, IP_RATE_LIMIT_MAX)) {
    return res.status(429).json({ error: 'Too many requests from your IP. Please wait.' });
  }

  // Limite globale par token (prévient les abus si le token est partagé/fuité)
  const tokenKey = clientToken ? clientToken.slice(-8) : 'none'; // on stocke seulement les 8 derniers chars
  if (checkRateLimit(tokRateLimitMap, tokenKey, TOKEN_RATE_LIMIT_MAX)) {
    return res.status(429).json({ error: 'Service overloaded. Please try again later.' });
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

  if (body.max_tokens !== undefined) {
    if (typeof body.max_tokens !== 'number' || body.max_tokens > MAX_TOKENS_LIMIT || body.max_tokens < 1) {
      return res.status(400).json({ error: `max_tokens must be between 1 and ${MAX_TOKENS_LIMIT}` });
    }
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
    console.error('[Backend] OPENAI_API_KEY not configured');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  const safeBody = {
    model: (typeof body.model === 'string' && ALLOWED_MODELS.has(body.model))
      ? body.model
      : 'gpt-4o-mini',
    messages: body.messages,
    temperature: typeof body.temperature === 'number'
      ? Math.min(Math.max(body.temperature, 0), 1.5)
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
      // Ne jamais retransmettre les détails d'erreur OpenAI au client
      console.error('[Backend] OpenAI error status:', response.status);
      return res.status(502).json({ error: 'AI service error. Please try again.' });
    }

    // Ne retransmettre que les choices (pas les métadonnées d'usage)
    return res.status(200).json({ choices: data.choices });

  } catch (error) {
    console.error('[Backend] Unexpected error:', error?.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
