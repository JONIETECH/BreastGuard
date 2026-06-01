import { Client } from '@gradio/client';

const SPACE_ID = 'EmmasonMutsaka/BreastCancer-Ai-Screening';

let clientPromise = null;

async function getClient() {
  if (!clientPromise) {
    clientPromise = Client.connect(SPACE_ID);
  }

  return clientPromise;
}

async function toBlob(image) {
  if (!image) {
    throw new Error('An image is required for inference.');
  }

  if (typeof Blob !== 'undefined' && image instanceof Blob) {
    return image;
  }

  if (typeof File !== 'undefined' && image instanceof File) {
    return image;
  }

  if (typeof image === 'string') {
    if (image.startsWith('data:')) {
      const response = await fetch(image);
      return response.blob();
    }

    const response = await fetch(image);
    if (!response.ok) {
      throw new Error('Unable to load the selected image.');
    }

    return response.blob();
  }

  if (image?.data) {
    return toBlob(image.data);
  }

  throw new Error('Unsupported image input.');
}

function toImageSource(value) {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof Blob !== 'undefined' && value instanceof Blob) {
    return URL.createObjectURL(value);
  }

  if (typeof value === 'object') {
    if (typeof value.url === 'string') {
      return value.url;
    }

    if (typeof value.path === 'string') {
      return value.path;
    }
  }

  return null;
}

function deriveSummary(report) {
  const normalized = String(report || '').toLowerCase();

  if (normalized.includes('malignancy suspected') || normalized.includes('malignant')) {
    return {
      classification: 'Malignant',
      confidence: 94,
      level: 'High',
      score: 94,
    };
  }

  if (normalized.includes('benign finding') || normalized.includes('benign')) {
    return {
      classification: 'Benign',
      confidence: 89,
      level: 'Low',
      score: 11,
    };
  }

  return {
    classification: 'Review Required',
    confidence: 76,
    level: 'Medium',
    score: 50,
  };
}

export async function runInference({
  image,
  age = 45,
  symptomDur = 4,
  famHist = 'No',
  reproHist = 'Normal',
  query = 'What are the recommended next steps for this patient?',
} = {}) {
  const client = await getClient();
  const preparedImage = await toBlob(image);

  const response = await client.predict('/run_inference', {
    image: preparedImage,
    age: Number(age),
    symptom_dur: Number(symptomDur),
    fam_hist: famHist,
    repro_hist: reproHist,
    query,
  });

  const data = Array.isArray(response?.data) ? response.data : [];
  const report = String(data[0] ?? 'No report was returned by the model.');
  const attentionMap = toImageSource(data[1]);
  const summary = deriveSummary(report);

  return {
    analysisType: 'api',
    report,
    attentionMap,
    raw: response?.data ?? response,
    ...summary,
  };
}