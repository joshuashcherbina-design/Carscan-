import express from 'express';
import OpenAI from 'openai';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: '12mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, aiConfigured: Boolean(process.env.OPENAI_API_KEY) });
});

app.post('/api/identify', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: 'CarScan is online, but its AI key has not been configured by the site owner yet.' });
    }
    const image = req.body?.image;
    if (typeof image !== 'string' || !/^data:image\/(jpeg|jpg|png|webp|gif);base64,/.test(image)) {
      return res.status(400).json({ error: 'Please upload a supported image (JPEG, PNG, or WebP).' });
    }
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You identify automobiles from photos. Return only JSON with keys: is_car (boolean), make (string), model (string), year (string), trim (string), name (string), confidence (string), notes (string). Do not guess a precise year or trim if not visually supportable; use "Unknown". name should be a short readable label such as "2022 Porsche 911 Carrera". If no car is visible, set is_car false and name to "No car detected". Explain uncertainty briefly in notes. Never identify people.' },
        { role: 'user', content: [
          { type: 'text', text: 'Identify the car shown. Estimate the model year only when there are visual clues. Keep unknown details as Unknown.' },
          { type: 'image_url', image_url: { url: image, detail: 'high' } }
        ] }
      ]
    });
    const raw = response.choices?.[0]?.message?.content;
    const result = JSON.parse(raw || '{}');
    if (result.is_car === false) return res.status(422).json({ error: 'No car detected in this photo. Try a clear picture of a car.' });
    res.json({
      name: typeof result.name === 'string' ? result.name : 'Identified car',
      make: result.make || 'Unknown', model: result.model || 'Unknown',
      year: result.year || 'Unknown', trim: result.trim || 'Unknown',
      confidence: result.confidence || 'Not specified', notes: result.notes || ''
    });
  } catch (err) {
    console.error('Car identification failed:', err?.message || err);
    res.status(500).json({ error: 'Car identification failed. Please try again in a moment.' });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, '0.0.0.0', () => console.log(`CarScan running at http://localhost:${port}`));
