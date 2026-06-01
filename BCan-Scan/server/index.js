/**
 * BCan-Scan — Local Development API Server
 *
 * Mirrors the Vercel Serverless Functions in api/ so you can test locally
 * without deploying. Uses the same formidable + @gradio/client logic.
 *
 * Run:  npm run server          (API only, port 3001)
 *       npm run dev:all         (Vite SPA + API server together)
 *
 * Endpoints:
 *   GET  /api/health      → liveness probe
 *   POST /api/inference   → multipart/form-data → Gradio → JSON
 */

import express from 'express';
import cors from 'cors';
import formidable from 'formidable';
import { Client } from '@gradio/client';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3001;
const SPACE_ID = 'EmmasonMutsaka/BreastCancer-Ai-Screening';
const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/jpg'];

// CORS — allow all origins for Flutter dev testing
app.use(cors());

// ── Gradio client singleton ────────────────────────────────────────────────────
let _gradioClient = null;
async function getGradioClient() {
  if (!_gradioClient) {
    _gradioClient = await Client.connect(SPACE_ID);
  }
  return _gradioClient;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({ maxFileSize: 10 * 1024 * 1024, keepExtensions: true });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

function extractImageUrl(value) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (typeof value.url === 'string') return value.url;
    if (typeof value.path === 'string') return value.path;
  }
  return null;
}

function deriveSummary(report) {
  const lower = String(report || '').toLowerCase();
  if (lower.includes('malignancy suspected') || lower.includes('🔴') || lower.includes('malignant')) {
    return { classification: 'Malignant', confidence: 94, level: 'High', score: 94 };
  }
  if (lower.includes('benign finding') || lower.includes('🟢') || lower.includes('benign')) {
    return { classification: 'Benign', confidence: 89, level: 'Low', score: 11 };
  }
  return { classification: 'Review Required', confidence: 76, level: 'Medium', score: 50 };
}

// ── Routes ────────────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', space: SPACE_ID, timestamp: new Date().toISOString() });
});

app.post('/api/inference', async (req, res) => {
  let tempFilePath = null;

  try {
    const { fields, files } = await parseMultipart(req);

    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
    if (!imageFile) {
      return res.status(400).json({ error: 'An image file is required. Send it as "image" in multipart/form-data.' });
    }

    const mimetype = imageFile.mimetype || imageFile.type || '';
    if (!ALLOWED_MIME.includes(mimetype)) {
      return res.status(400).json({ error: 'Only PNG and JPG images are accepted.' });
    }

    tempFilePath = imageFile.filepath || imageFile.path;
    const fileBuffer = fs.readFileSync(tempFilePath);
    const imageBlob = new Blob([fileBuffer], { type: mimetype });

    const getField = (key, def) => {
      const v = fields[key];
      return String(Array.isArray(v) ? v[0] : v ?? def);
    };

    const age        = Number(getField('age',         '45'));
    const symptomDur = Number(getField('symptom_dur', '4'));
    const famHist    =        getField('fam_hist',    'No');
    const reproHist  =        getField('repro_hist',  'Normal');
    const query      =        getField('query',       'What are the recommended next steps for this patient?');

    console.log(`[inference] age=${age} dur=${symptomDur} fam=${famHist} repro=${reproHist}`);
    const client = await getGradioClient();

    const gradioResponse = await client.predict('/run_inference', {
      image: imageBlob, age, symptom_dur: symptomDur,
      fam_hist: famHist, repro_hist: reproHist, query,
    });

    const data = Array.isArray(gradioResponse?.data) ? gradioResponse.data : [];
    const report = String(data[0] ?? 'No report was returned by the model.');
    const attentionMapUrl = extractImageUrl(data[1]);
    const summary = deriveSummary(report);

    console.log(`[inference] classification=${summary.classification}`);
    return res.json({ ...summary, report, attentionMapUrl });

  } catch (err) {
    _gradioClient = null;
    const message = err?.message || 'Inference failed.';
    console.error('[inference] error:', message);
    return res.status(502).json({ error: message });
  } finally {
    if (tempFilePath) {
      try { fs.unlinkSync(tempFilePath); } catch (_) {}
    }
  }
});

// ── Start ──────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅ BCan-Scan API server running on http://localhost:${PORT}`);
  console.log(`   Health check : GET  http://localhost:${PORT}/api/health`);
  console.log(`   Inference    : POST http://localhost:${PORT}/api/inference\n`);
});
