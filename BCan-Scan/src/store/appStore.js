import { create } from 'zustand';
import { getScans, deleteScan } from '../services/scanApi.js';

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
        { id: crypto.randomUUID(), timestamp: new Date(), ...prediction },
      ],
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
    })),
}));
