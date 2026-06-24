import { create } from 'zustand';
import { getScans, deleteScan } from '../services/scanApi.js';

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

export const useAppStore = create((set) => ({
  // Risk Assessment
  riskFactors: {
    age: '',
    familyHistory: '',
    tumorSize: '',
    reproductiveHistory: '',
    obesityStatus: '',
    lifestyleFactors: '',
  },
  setRiskFactors: (factors) =>
    set(() => ({
      riskFactors: factors,
    })),

  // Image Upload
  uploadedImages: [],
  addImage: (image) =>
    set((state) => ({
      uploadedImages: [...state.uploadedImages, image],
    })),
  removeImage: (id) =>
    set((state) => ({
      uploadedImages: state.uploadedImages.filter((img) => img.id !== id),
    })),
  clearImages: () => set(() => ({ uploadedImages: [] })),

  // Scans (loaded from API)
  scans: [],
  scansLoading: false,
  scansError: null,
  setScans: (scans) => set(() => ({ scans, scansError: null })),
  loadScans: async () => {
    set(() => ({ scansLoading: true, scansError: null }));
    try {
      const data = await getScans();
      set(() => ({ scans: data.scans || [], scansLoading: false }));
    } catch (err) {
      set(() => ({ scansError: err.message, scansLoading: false }));
    }
  },
  removeScan: async (id) => {
    await deleteScan(id);
    set((state) => ({ scans: state.scans.filter((s) => s.id !== id) }));
  },

  // Chat Messages
  chatMessages: [],
  addMessage: (message) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    })),
  clearChat: () => set(() => ({ chatMessages: [] })),

  // Predictions kept for transient UI state; persisted scans are the source of truth
  predictions: [],
  addPrediction: (prediction) =>
    set((state) => ({
      predictions: [
        ...state.predictions,
        { id: generateId(), timestamp: new Date(), ...prediction },
      ],
    })),

  // Local history for quick reference (scans are the persistent source of truth)
  history: [],
  addToHistory: (entry) =>
    set((state) => ({
      history: [{ id: generateId(), timestamp: new Date(), ...entry }, ...state.history],
    })),
  removeFromHistory: (id) =>
    set((state) => ({
      history: state.history.filter((h) => h.id !== id),
    })),

  // Clear all
  reset: () =>
    set(() => ({
      riskFactors: {
        age: '',
        familyHistory: '',
        tumorSize: '',
        reproductiveHistory: '',
        obesityStatus: '',
        lifestyleFactors: '',
      },
      uploadedImages: [],
      predictions: [],
      chatMessages: [],
      scans: [],
      history: [],
    })),
}));
