export async function runInference({
  image,
  patientNumber = '',
  age = 45,
  symptomDur = 4,
  famHist = 'No',
  reproHist = 'Normal',
  query = 'What are the recommended next steps for this patient?',
} = {}) {
  if (!image) {
    throw new Error('An image is required for inference.');
  }

  const formData = new FormData();
  formData.append('image', image);
  formData.append('patient_number', String(patientNumber));
  formData.append('age', String(age));
  formData.append('symptom_dur', String(symptomDur));
  formData.append('fam_hist', String(famHist));
  formData.append('repro_hist', String(reproHist));
  formData.append('query', String(query));

  const response = await fetch('/api/inference', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data?.error || `Inference failed: ${response.status}`);
  }

  if (!data || typeof data !== 'object' || !data.classification) {
    throw new Error('Unexpected inference response from server.');
  }

  return {
    analysisType: 'api',
    patientNumber: String(patientNumber || ''),
    classification: data.classification,
    confidence: data.confidence,
    level: data.level,
    score: data.score,
    report: data.report,
    attentionMap: data.attentionMapUrl,
    hglcmFeatures: data.hglcmFeatures || [],
    textureInterpretation: data.textureInterpretation || '',
    riskProfile: data.riskProfile || '',
    reasoning: data.reasoning || '',
    urgency: data.urgency || '',
    actions: data.actions || [],
    guidelines: data.guidelines || [],
    ageNote: data.ageNote || '',
    raw: data,
  };
}
