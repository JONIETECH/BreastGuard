import { Client } from '@gradio/client';
import { prisma } from './prisma.js';

const SPACE_ID = process.env.SPACE_ID || 'EmmasonMutsaka/BreastCancer-Ai-Screening';
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

let _gradioClient = null;

async function getGradioClient() {
  if (!_gradioClient) {
    _gradioClient = await Client.connect(SPACE_ID);
  }
  return _gradioClient;
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
  // Prioritize explicit benign markers first. Benign reports often mention
  // "malignant" only in a negative context (e.g. "no malignant cells"), so
  // matching "malignant" too early would misclassify them.
  if (lower.includes('benign finding') || lower.includes('�')) {
    return { classification: 'Benign', confidence: 89, level: 'Low', score: 11 };
  }
  if (lower.includes('malignancy suspected') || lower.includes('🔴')) {
    return { classification: 'Malignant', confidence: 94, level: 'High', score: 94 };
  }
  if (lower.includes('benign')) {
    return { classification: 'Benign', confidence: 89, level: 'Low', score: 11 };
  }
  if (lower.includes('malignant')) {
    return { classification: 'Malignant', confidence: 94, level: 'High', score: 94 };
  }
  return { classification: 'Review Required', confidence: 76, level: 'Medium', score: 50 };
}

function getField(fields, key, def) {
  const v = fields[key];
  return String(Array.isArray(v) ? v[0] : v ?? def);
}

function normalizeReproHist(value) {
  const normalized = String(value || 'Normal').trim();
  const map = {
    normal: 'Normal',
    'early menarche': 'Early Menarche',
    'early_menarche': 'Early Menarche',
    nulliparous: 'Nulliparous',
  };
  return map[normalized.toLowerCase()] || normalized;
}

async function fileToBase64(filePath) {
  const { readFile } = await import('fs/promises');
  const buffer = await readFile(filePath);
  return buffer.toString('base64');
}

async function fetchImageAsBase64(url) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    return buffer.toString('base64');
  } catch (e) {
    console.error('[inference] failed to fetch Grad-CAM image:', e.message);
    return null;
  }
}

export async function runInferenceAndSave({ fields, files, userId }) {
  const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
  if (!imageFile) {
    throw Object.assign(new Error('An image file is required.'), { statusCode: 400 });
  }

  const mimetype = imageFile.mimetype || imageFile.type || '';
  const allowedMime = ['image/png', 'image/jpeg', 'image/jpg'];
  if (!allowedMime.includes(mimetype)) {
    throw Object.assign(new Error('Only PNG and JPG images are accepted.'), { statusCode: 400 });
  }

  const tempFilePath = imageFile.filepath || imageFile.path;
  const { readFile, stat } = await import('fs/promises');
  const fileStats = await stat(tempFilePath);
  if (fileStats.size > MAX_IMAGE_BYTES) {
    throw Object.assign(new Error('Image exceeds 10 MB limit.'), { statusCode: 413 });
  }

  const fileBuffer = await readFile(tempFilePath);
  const imageBlob = new Blob([fileBuffer], { type: mimetype });

  const age = Number(getField(fields, 'age', '45'));
  const symptomDur = Number(getField(fields, 'symptom_dur', '4'));
  const famHist = getField(fields, 'fam_hist', 'No');
  const reproHist = normalizeReproHist(getField(fields, 'repro_hist', 'Normal'));
  const query = getField(fields, 'query', 'What are the recommended next steps for this patient?');
  const patientNumber = getField(fields, 'patient_number', '').trim();

  console.log(`[inference] user=${userId} age=${age} dur=${symptomDur} fam=${famHist} repro=${reproHist} patient=${patientNumber}`);

  const client = await getGradioClient();
  const gradioResponse = await client.predict('/run_inference', {
    image: imageBlob,
    age,
    symptom_dur: symptomDur,
    fam_hist: famHist,
    repro_hist: reproHist,
    query,
  });

  const data = Array.isArray(gradioResponse?.data) ? gradioResponse.data : [];
  const report = String(data[0] ?? 'No report was returned by the model.');
  const attentionMapUrl = extractImageUrl(data[1]);
  const summary = deriveSummary(report);

  console.log(`[inference] classification=${summary.classification}`);

  const [imageBase64, gradCamBase64] = await Promise.all([
    fileToBase64(tempFilePath),
    fetchImageAsBase64(attentionMapUrl),
  ]);

  const scan = await prisma.scan.create({
    data: {
      userId,
      patientNumber: patientNumber || 'Unnamed Patient',
      classification: summary.classification,
      confidence: summary.confidence,
      level: summary.level,
      score: summary.score,
      report,
      imageBase64,
      gradCamBase64,
    },
  });

  return {
    ...summary,
    report,
    attentionMapUrl,
    patientNumber: patientNumber || 'Unnamed Patient',
    scanId: scan.id,
  };
}

export function resetGradioClient() {
  _gradioClient = null;
}
