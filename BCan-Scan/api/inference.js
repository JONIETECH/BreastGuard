/**
 * Vercel Serverless Function — POST /api/inference
 *
 * Accepts multipart/form-data from the Flutter app, passes the image and
 * patient parameters to the HuggingFace Gradio space, and returns a
 * normalized JSON response. The result is persisted in the database
 * for the authenticated user so it is available across devices.
 *
 * Fields:
 *   image          File    required  PNG or JPG histopathology image (max 10 MB)
 *   patient_number string  required
 *   age            string  optional  default "45"
 *   symptom_dur    string  optional  default "4"
 *   fam_hist       string  optional  "Yes" | "No", default "No"
 *   repro_hist     string  optional  "Normal" | "Early Menarche" | "Nulliparous"
 *   query          string  optional  clinical query text
 *
 * Response 200:
 *   { classification, confidence, level, score, report, attentionMapUrl, patientNumber, scanId }
 *
 * Response 4xx/5xx:
 *   { error: "<message>" }
 */

import formidable from 'formidable';
import { setCorsHeaders } from '../server/lib/auth.js';
import { runInferenceAndSave, resetGradioClient } from '../server/lib/inference.js';

// Disable Vercel's automatic body parsing so formidable can handle multipart.
export const config = {
  api: {
    bodyParser: false,
  },
};

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

export default async function handler(req, res) {
  setCorsHeaders(res, req);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { getUserFromRequest } = await import('../server/lib/auth.js');
    const { prisma } = await import('../server/lib/prisma.js');
    const user = await getUserFromRequest(req, prisma);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { fields, files } = await parseMultipart(req);
    const result = await runInferenceAndSave({ fields, files, userId: user.id });

    return res.status(200).json(result);
  } catch (err) {
    resetGradioClient();

    const statusCode = err?.statusCode || 502;
    const message = err?.message || 'Inference failed. Please try again.';
    console.error('[inference] error:', message);
    return res.status(statusCode).json({ error: message });
  }
}
