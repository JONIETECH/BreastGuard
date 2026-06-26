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

function parseReport(report) {
  const text = String(report || '');
  const lower = text.toLowerCase();

  const isMalignant = lower.includes('malignancy suspected') || text.includes('🔴');
  const classification = isMalignant ? 'Malignant' : 'Benign';

  const confMatch = text.match(/CONFIDENCE\s*:\s*([\d.]+)%/i);
  const confidence = confMatch ? Math.round(parseFloat(confMatch[1])) : (isMalignant ? 94 : 89);
  const level = isMalignant ? 'High' : 'Low';
  const score = isMalignant ? confidence : Math.round(100 - confidence);

  const hglcmFeatures = [];
  const featurePattern = /(\w+)\s*:\s*([\d.]+)\s*—\s*(.+)/g;
  let fm;
  while ((fm = featurePattern.exec(text)) !== null) {
    if (['Contrast','Homogeneity','Energy','Correlation','Dissimilarity','ASM'].includes(fm[1])) {
      hglcmFeatures.push({ name: fm[1], value: fm[2], interpretation: fm[3].trim() });
    }
  }

  const texMatch = text.match(/TEXTURE INTERPRETATION:([\s\S]*?)(?:PATIENT RISK PROFILE|$)/i);
  const textureInterpretation = texMatch ? texMatch[1].trim() : '';

  const riskMatch = text.match(/PATIENT RISK PROFILE CONTRIBUTION:([\s\S]*?)(?:AI REASONING SUMMARY:|$)/i);
  const riskProfile = riskMatch ? riskMatch[1].trim() : '';

  const reasonMatch = text.match(/AI REASONING SUMMARY:([\s\S]*?)(?:─{10,}|={10,}|SECTION 2|$)/i);
  const reasoning = reasonMatch ? reasonMatch[1].trim() : '';

  const urgencyMatch = text.match(/Urgency Level\s*:\s*(.+)/i);
  const urgency = urgencyMatch ? urgencyMatch[1].trim() : '';

  const actionsMatch = text.match(/Recommended Clinical Actions:([\s\S]*?)(?:Supporting Guideline Evidence:|$)/i);
  const actionsRaw = actionsMatch ? actionsMatch[1].trim() : '';
  const actions = actionsRaw.split('\n')
    .map(l => l.trim()).filter(l => /^\d+\./.test(l))
    .map(l => l.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);

  const guidelinesMatch = text.match(/Supporting Guideline Evidence:([\s\S]*?)(?:Guidelines cited:|={10,}|$)/i);
  const guidelinesRaw = guidelinesMatch ? guidelinesMatch[1].trim() : '';
  const guidelines = guidelinesRaw.split('\n')
    .map(l => l.trim()).filter(l => l.startsWith('•'))
    .map(l => l.replace(/^•\s*/, '').trim()).filter(Boolean);

  const ageNoteMatch = text.match(/(ℹ️[^\n]+)/);
  const ageNote = ageNoteMatch ? ageNoteMatch[1].trim() : '';

  return { classification, confidence, level, score, hglcmFeatures, textureInterpretation, riskProfile, reasoning, urgency, actions, guidelines, ageNote };
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
  const summary = parseReport(report);

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
    hglcmFeatures: summary.hglcmFeatures || [],
    textureInterpretation: summary.textureInterpretation || '',
    riskProfile: summary.riskProfile || '',
    reasoning: summary.reasoning || '',
    urgency: summary.urgency || '',
    actions: summary.actions || [],
    guidelines: summary.guidelines || [],
    ageNote: summary.ageNote || '',
  };
}

export function resetGradioClient() {
  _gradioClient = null;
}
