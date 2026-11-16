import type { IncomingMessage, ServerResponse } from 'node:http';
import { callClaudeForFreelancers } from '../lib/claudeMatch.ts';
import type { Language, PlatformFilter } from '../src/types.ts';

interface VercelLikeRequest extends IncomingMessage {
  body?: unknown;
}

function sendJson(res: ServerResponse, statusCode: number, data: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

async function readBody(req: VercelLikeRequest): Promise<Record<string, unknown>> {
  if (req.body && typeof req.body === 'object') {
    return req.body as Record<string, unknown>;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export default async function handler(req: VercelLikeRequest, res: ServerResponse) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    sendJson(res, 500, { error: 'ANTHROPIC_API_KEY is not configured on the server.' });
    return;
  }

  const body = await readBody(req);
  const pitch = typeof body.pitch === 'string' ? body.pitch.trim() : '';
  const lang: Language = body.lang === 'en' ? 'en' : 'fr';
  const platform: PlatformFilter =
    body.platform === 'fiverr' || body.platform === 'malt' ? body.platform : 'both';

  if (pitch.length < 5) {
    sendJson(res, 400, {
      error:
        lang === 'fr'
          ? 'Décris ton idée un peu plus en détail (au moins quelques mots).'
          : 'Please describe your idea in a bit more detail.',
    });
    return;
  }

  try {
    const result = await callClaudeForFreelancers(pitch, lang, platform, apiKey);
    sendJson(res, 200, result);
  } catch (err) {
    console.error('Match error:', err);
    sendJson(res, 502, {
      error:
        lang === 'fr'
          ? 'La recherche IA a rencontré une erreur temporaire. Réessaie dans un instant.'
          : 'The AI search encountered a temporary error. Please try again shortly.',
    });
  }
}
