import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { callClaudeForFreelancers } from './lib/claudeMatch.ts';
import type { Language, PlatformFilter } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/match-freelancers', async (req, res) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured on the server.' });
      return;
    }

    const pitch = typeof req.body?.pitch === 'string' ? req.body.pitch.trim() : '';
    const lang: Language = req.body?.lang === 'en' ? 'en' : 'fr';
    const platform: PlatformFilter =
      req.body?.platform === 'fiverr' || req.body?.platform === 'malt' ? req.body.platform : 'both';

    if (pitch.length < 5) {
      res.status(400).json({
        error:
          lang === 'fr'
            ? 'Décris ton idée un peu plus en détail (au moins quelques mots).'
            : 'Please describe your idea in a bit more detail.',
      });
      return;
    }

    try {
      const result = await callClaudeForFreelancers(pitch, lang, platform, apiKey);
      res.json(result);
    } catch (err) {
      console.error('Match error:', err);
      res.status(502).json({
        error:
          lang === 'fr'
            ? 'La recherche IA a rencontré une erreur temporaire. Réessaie dans un instant.'
            : 'The AI search encountered a temporary error. Please try again shortly.',
      });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexPath = path.join(distDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Build not found');
      }
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Placki server running at http://localhost:${port}`);
  });
}

startServer();
