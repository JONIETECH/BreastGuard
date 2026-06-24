/**
 * Vercel Serverless Function — POST /api/inference
 *
 * Accepts multipart/form-data from the Flutter app, passes the image and
 * patient parameters to the HuggingFace Gradio space, and returns a
 * normalized JSON response.
 *
 * Fields:
 *   image        File    required  PNG or JPG histopathology image (max 10 MB)
 *   age          string  optional  default "45"
 *   symptom_dur  string  optional  default "4"
 *   fam_hist     string  optional  "Yes" | "No", default "No"
 *   repro_hist   string  optional  "Normal" | "Early Menarche" | "Nulliparous"
 *   query        string  optional  clinical query text
 *
 * Response 200:
 *   { classification, confidence, level, score, report, attentionMapUrl }
 *
 * Response 4xx/5xx:
 *   { error: "<message>" }
 */

import { Client } from '@gradio/client';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

const SPACE_ID = 'EmmasonMutsaka/BreastCancer-Ai-Screening';
const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/jpg'];

// Disable Vercel's automatic body parsing so formidable can handle multipart.
export const config = {
  api: {
    bodyParser: false,
  },
};

// Gradio client singleton — reused across warm lambda invocations.
let _gradioClient = null;

async function getGradioClient() {
  if (!_gradioClient) {
    _gradioClient = await Client.connect(SPACE_ID);
  }
  return _gradioClient;
}

/**
 * Parse multipart/form-data from a Vercel request using formidable.
 * Returns { fields, files } where files.image is the uploaded file.
 */
function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10 MB
      keepExtensions: true,
      multiples: false,
    });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

/**
 * Extract a URL string from a Gradio image output value.
 */
function extractImageUrl(value) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (typeof value.url === 'string') return value.url;
    if (typeof value.path === 'string') return value.path;
  }
  return null;
}

/**
 * Derive a structured summary from the raw Gradio report text.
 */
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

export default async function handler(req, res) {
  // CORS — allow all origins so Flutter (any device) can reach this endpoint.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  let tempFilePath = null;

  try {
    // ── Parse multipart form ──────────────────────────────────────────────────
    const { fields, files } = await parseMultipart(req);

    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
    if (!imageFile) {
      return res.status(400).json({
        error: 'An image file is required. Send it as "image" in multipart/form-data.',
      });
    }

    const mimetype = imageFile.mimetype || imageFile.type || '';
    if (!ALLOWED_MIME.includes(mimetype)) {
      return res.status(400).json({ error: 'Only PNG and JPG images are accepted.' });
    }

    // ── Build image Blob from temp file ───────────────────────────────────────
    tempFilePath = imageFile.filepath || imageFile.path;
    const fileBuffer = fs.readFileSync(tempFilePath);
    const imageBlob = new Blob([fileBuffer], { type: mimetype });

    // ── Parse text parameters ─────────────────────────────────────────────────
    const getField = (key, def) => {
      const v = fields[key];
      return String(Array.isArray(v) ? v[0] : v ?? def);
    };

    const age           = Number(getField('age',           '45'));
    const symptomDur    = Number(getField('symptom_dur',   '4'));
    const famHist       =        getField('fam_hist',      'No');
    const reproHist     =        getField('repro_hist',    'Normal');
    const query         =        getField('query',         'What are the recommended next steps for this patient?');
    const patientNumber =        getField('patient_number', '');

    // ── Call Gradio ────────────────────────────────────────────────────────────
    console.log(`[inference] age=${age} dur=${symptomDur} fam=${famHist} repro=${reproHist}`);
    const client = await getGradioClient();

    const gradioResponse = await client.predict('/run_inference', {
      image:       imageBlob,
      age:         age,
      symptom_dur: symptomDur,
      fam_hist:    famHist,
      repro_hist:  reproHist,
      query:       query,
    });

    // ── Parse and return result ────────────────────────────────────────────────
    const data           = Array.isArray(gradioResponse?.data) ? gradioResponse.data : [];
    const report         = String(data[0] ?? 'No report was returned by the model.');
    const attentionMapUrl = extractImageUrl(data[1]);
    const summary        = deriveSummary(report);

    console.log(`[inference] classification=${summary.classification}`);

    return res.status(200).json({ ...summary, report, attentionMapUrl, patientNumber });

  } catch (err) {
    // Reset client on error so the next invocation gets a fresh connection.
    _gradioClient = null;

    const message = err?.message || 'Inference failed. Please try again.';
    console.error('[inference] error:', message);
    return res.status(502).json({ error: message });

  } finally {
    // Clean up the temp file formidable wrote to disk.
    if (tempFilePath) {
      try { fs.unlinkSync(tempFilePath); } catch (_) {}
    }
  }
}
