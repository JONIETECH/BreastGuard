import { create } from 'zustand';

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

  // Predictions
  predictions: [],
  addPrediction: (prediction) =>
    set((state) => ({
      predictions: [...state.predictions, prediction],
    })),

  // Chat Messages
  chatMessages: [],
  addMessage: (message) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    })),
  clearChat: () => set(() => ({ chatMessages: [] })),

  // History
  history: [],
  addToHistory: (session) =>
    set((state) => ({
      history: [
        { id: Date.now(), ...session, timestamp: new Date() },
        ...state.history,
      ],
    })),
  removeFromHistory: (id) =>
    set((state) => ({
      history: state.history.filter((item) => item.id !== id),
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
    })),
}));
