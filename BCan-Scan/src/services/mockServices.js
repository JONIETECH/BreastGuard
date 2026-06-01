// Mock service for risk prediction
import { colors } from '../utils/colors.js';

export const predictRisk = async (factors) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const age = parseInt(factors.age) || 0;
      const hasFamily = factors.familyHistory === 'yes';
      const tumorSize = parseFloat(factors.tumorSize) || 0;

      let score = 0;
      if (age > 50) score += 30;
      if (age > 60) score += 20;
      if (hasFamily) score += 35;
      if (tumorSize > 20) score += 30;

      const risk =
        score > 70
          ? { level: 'High', score, color: colors.danger }
          : score > 40
            ? { level: 'Medium', score, color: colors.warning }
            : { level: 'Low', score, color: colors.success };

      resolve(risk);
    }, 1500);
  });
};

// Mock service for image classification
export const classifyImage = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const isMemoryTest = Math.random();
      const result = {
        classification: isMemoryTest > 0.5 ? 'Benign' : 'Malignant',
        confidence: Math.round((Math.random() * 20 + 80) * 100) / 100,
        heatmap:
          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23ff0000" opacity="0.3"/%3E%3C/svg%3E',
      };
      resolve(result);
    }, 2000);
  });
};

// Mock service for AI chat responses
export const getChatResponse = async (message) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const responses = {
        malignant:
          'Malignant means the cells are cancerous and can spread to other parts of the body. Medical treatment is typically required.',
        benign:
          'Benign refers to non-cancerous tumors or growths that are generally not harmful and do not spread.',
        symptoms:
          'Common symptoms of breast cancer include lumps in the breast, changes in breast shape, skin dimpling, nipple discharge, and pain.',
        screening:
          'Regular breast cancer screening is important. Methods include mammography, ultrasound, MRI, and clinical examination.',
        after:
          'After screening, follow your healthcare provider\'s recommendations. If results are concerning, additional tests or consultations may be needed.',
        treatment:
          'Treatment options may include surgery, radiation therapy, chemotherapy, or hormone therapy depending on the type and stage of cancer.',
        prevention:
          'Prevention strategies include regular exercise, maintaining healthy weight, limiting alcohol, avoiding smoking, and regular screening.',
      };

      const lowerMessage = message.toLowerCase();
      let response =
        'I\'m here to help with breast cancer screening information. Could you ask me more specifically about symptoms, screening, or treatment options?';

      if (
        lowerMessage.includes('malignant') ||
        lowerMessage.includes('cancer')
      ) {
        response = responses.malignant;
      } else if (lowerMessage.includes('benign')) {
        response = responses.benign;
      } else if (
        lowerMessage.includes('symptom') ||
        lowerMessage.includes('sign')
      ) {
        response = responses.symptoms;
      } else if (lowerMessage.includes('screening')) {
        response = responses.screening;
      } else if (
        lowerMessage.includes('after') ||
        lowerMessage.includes('result')
      ) {
        response = responses.after;
      } else if (lowerMessage.includes('treatment')) {
        response = responses.treatment;
      } else if (lowerMessage.includes('prevent')) {
        response = responses.prevention;
      }

      resolve(response);
    }, 800);
  });
};

// Load history from localStorage
export const loadHistory = () => {
  try {
    const stored = localStorage.getItem('bcanscan_history');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save history to localStorage
export const saveHistory = (history) => {
  try {
    localStorage.setItem('bcanscan_history', JSON.stringify(history));
  } catch {
    console.error('Failed to save history');
  }
};
