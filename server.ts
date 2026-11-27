import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { PRODUCTS } from './src/data/catalog.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.post('/api/mood-recommendations', async (req, res) => {
  const rawMood = typeof req.body?.mood === 'string' ? req.body.mood.trim() : '';

  if (!rawMood) {
    res.status(400).json({ error: 'Please enter how you are feeling today.' });
    return;
  }

  if (rawMood.length > 300) {
    res.status(400).json({ error: 'Mood description must be 300 characters or fewer.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: 'GEMINI_API_KEY is not configured in Settings > Secrets.',
    });
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const catalogSummary = PRODUCTS.map((p) => ({
      id: p.id,
      title: p.title,
      brand: p.brand,
      category: p.category,
      description: p.description,
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: `User mood: "${rawMood}"\n\nAvailable Amazon.sg catalog:\n${JSON.stringify(catalogSummary)}`,
      config: {
        systemInstruction:
          'You are a warm, supportive shopping curator for Amazon.sg. Given the user mood, provide: (1) a short, genuine daily positive affirmation (1-2 sentences), (2) a brief 1-sentence summary connecting their mood to the curated picks, and (3) exactly 4 product recommendations chosen strictly from the provided catalog product IDs with a concise 1-sentence reason for each.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            affirmation: {
              type: Type.STRING,
              description: 'A warm, encouraging daily positive affirmation tailored to the mood.',
            },
            summary: {
              type: Type.STRING,
              description: 'One concise sentence summarizing the curated selection.',
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  productId: {
                    type: Type.STRING,
                    description: 'Exact product id from the provided catalog.',
                  },
                  reason: {
                    type: Type.STRING,
                    description: 'Short 1-sentence explanation of why this item fits the mood.',
                  },
                },
                required: ['productId', 'reason'],
              },
            },
          },
          required: ['affirmation', 'summary', 'recommendations'],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim());
    const validIds = new Set(PRODUCTS.map((p) => p.id));
    const recommendations = Array.isArray(parsed.recommendations)
      ? parsed.recommendations
          .filter(
            (r: unknown): r is { productId: string; reason: string } =>
              Boolean(
                r &&
                  typeof r === 'object' &&
                  typeof (r as { productId?: unknown }).productId === 'string' &&
                  validIds.has((r as { productId: string }).productId) &&
                  typeof (r as { reason?: unknown }).reason === 'string',
              ),
          )
          .slice(0, 4)
      : [];

    res.json({
      affirmation:
        typeof parsed.affirmation === 'string' && parsed.affirmation.trim()
          ? parsed.affirmation.trim()
          : 'Take a gentle breath—today is yours to move at your own pace.',
      summary:
        typeof parsed.summary === 'string' && parsed.summary.trim()
          ? parsed.summary.trim()
          : 'Here are thoughtful picks matched to your mood today.',
      recommendations,
    });
  } catch (err) {
    console.error('Mood recommendation error:', err);
    res.status(502).json({
      error: 'Could not load mood recommendations right now. Please try again.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
