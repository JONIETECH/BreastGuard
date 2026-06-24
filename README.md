<div align="center">
  <img src="bcan/assets/full-logo.webp" alt="BreastGuard Logo" width="350">

  <p><strong>AI-Powered Breast Cancer Screening for Uganda</strong></p>
  <p>
    <img src="https://img.shields.io/badge/Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white" alt="Flutter">
    <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
    <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
    <img src="https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white" alt="TensorFlow">
    <img src="https://img.shields.io/badge/HuggingFace-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black" alt="Hugging Face">
  </p>
  <p>
    <strong>Makerere University - Group 11</strong> | Supervisor: Dr. Emmanuel Lule
  </p>
</div>

---

## About BreastGuard

**BreastGuard** is a comprehensive AI-powered breast cancer screening solution developed by **Makerere University Group 11** under the supervision of **Dr. Emmanuel Lule**. The system combines cutting-edge deep learning with clinical guidelines to assist healthcare providers in Uganda with early breast cancer detection.

### The Challenge

Breast cancer is the leading cause of cancer-related deaths among women in Uganda, with over 80% of patients presenting at advanced stages (Stage III-IV). Limited access to specialist pathologists and screening facilities creates critical diagnostic delays.

### Our Solution

BreastGuard leverages **EfficientNetB3/ResNet50 CNN + HGLCM texture features + Clinical Risk Prediction** to provide:

- **Automated Histopathology Analysis**: AI-powered image classification for malignant vs. benign findings
- **Clinical Decision Support**: Guideline-grounded recommendations from WHO, Uganda MoH, and NCCN
- **Explainable AI**: Grad-CAM visualizations showing which tissue regions influence AI decisions
- **Risk Stratification**: Integration of patient demographics and clinical history

---

## Project Structure

This repository contains three integrated components:

```
BreastGuard/
├── bcan/                     # 📱 Mobile Application (Flutter)
│   ├── Android app for field healthcare workers
│   ├── Offline-first architecture
│   ├── Firebase backend integration
│   └── README.md
│
├── BCan-Scan/                # 🌐 Web Application (React + Vite)
│   ├── Modern web interface for clinicians
│   ├── Responsive design for desktop/tablet
│   ├── Hugging Face API integration
│   └── README.md
│
└── README.md                 # 📖 This file
```

---

## Component Overview

### 1. Mobile App (`bcan/`)

**Flutter-based Android application** for healthcare providers in the field.

**Key Features:**
- Upload histopathology images from mobile camera or gallery
- Capture patient risk factors (age, symptoms, family history)
- Run AI analysis via Hugging Face API
- View guideline-grounded clinical reports
- Offline capability with local data caching

**Tech Stack:** Flutter, Dart, BreastGuard API (Prisma + Neon Postgres), flutter_secure_storage

[📱 View Mobile App README](./bcan/README.md)

---

### 2. Web App (`BCan-Scan/`)

**React-based web platform** for desktop clinical environments.

**Key Features:**
- Interactive AI Assistant interface
- Drag-and-drop image upload
- Real-time risk factor sliders
- Visual Grad-CAM explanations
- Patient history tracking

**Tech Stack:** React 18+, Vite, TypeScript, Tailwind CSS, shadcn/ui, Zustand, Prisma + Neon Postgres

[🌐 View Web App README](./BCan-Scan/README.md)

---

### 3. AI Model

**Hugging Face Space** hosting the core deep learning model.

**Architecture:**
- **CNN Backbone**: EfficientNetB3/ResNet50 for image feature extraction
- **HGLCM Features**: Haralick texture analysis for histopathological patterns
- **Risk Integration**: Random Forest classifier for patient demographics
- **RAG Pipeline**: LangChain/FAISS for guideline retrieval (WHO, Uganda MoH, NCCN)
- **Explainability**: Grad-CAM attention maps

**Deployed at:** [Hugging Face Space](https://huggingface.co//Jonietech/BreastCancer-Ai-Screening)

---

## Brand Colors

| Color | Hex Code | Usage |
|-------|----------|-------|
| Primary (Teal) | `#0f766e` | Headers, primary actions, tabs |
| Secondary (Pink) | `#ec4899` | CTAs, badges, accents, highlights |
| Success | `#16a34a` | Benign findings, positive indicators |
| Danger | `#dc2626` | Malignant findings, errors, alerts |
| Warning | `#ea580c` | Cautionary information |

---

## Team

**Makerere University - Group 11**  
**Supervisor:** Dr. Emmanuel Lule  
**Project:** Breast Cancer Screening AI for Uganda

| Team Member | Role | Tasks Assigned |
|-------------|------|----------------|
| **Karungi Maria Daphine** | Image Classification & Model Training | EfficientNetB3 + HGLCM hybrid CNN design, two-phase training, threshold optimisation |
| **Apio Diane** | Deployment & Data Acquisition, Data Preprocessing | HuggingFace Spaces deployment, BreakHis dataset acquisition, EDA and CLAHE preprocessing |
| **Mutska Emmason** | Evaluation & RAG Pipeline, Project Manager | RAG pipeline (LangChain/FAISS), technical metrics, UAT coordination, overfitting mitigation; overseeing progress, coordinating meetings, ensuring deadlines are met |
| **Rwothomio Jonathan** | Risk Model & Explainability | Random Forest risk model, SHAP visualisations, Grad-CAM, report writing and presentation |

---

## Getting Started

### Prerequisites

- **For Mobile**: Flutter SDK 3.0+, Android Studio, Firebase account
- **For Web**: Node.js 18+, npm/yarn/pnpm
- **For AI Model**: Python 3.9+, TensorFlow 2.x, Hugging Face account

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd BreastGuard

# Mobile App (Flutter)
cd bcan
flutter pub get
flutter run

# Web App (React)
cd BCan-Scan
npm install
npm run dev

# AI Model (Python)
# Deploy app.py to Hugging Face Spaces
```

---

## AI Model Performance

| Metric | Score |
|--------|-------|
| Accuracy | ~94% |
| Sensitivity (Recall) | ~92% |
| Specificity | ~95% |
| AUC-ROC | ~0.97 |

*Evaluated on BreakHis histopathology dataset with 5-fold cross-validation*

---

## Clinical Guidelines Integrated

- **WHO** - Breast Cancer Guidelines 2022
- **Uganda Ministry of Health** - Cancer Guidelines 2020
- **NCCN** - Breast Cancer Guidelines v2024
- **CDC** - Breast Cancer Risk Assessment

---

## Publications & Research

This project is part of academic research at Makerere University focused on improving breast cancer screening in resource-limited settings using AI.

---

## Acknowledgments

- **Makerere University** - Department of Computer Science
- **Uganda Cancer Institute** - Clinical guidance and validation
- **WHO** - Breast cancer screening guidelines
- **Hugging Face** - Model hosting and ML infrastructure
- **BreakHis Dataset** - Histopathology image data

---

## License

This project is part of academic research at Makerere University. All rights reserved.

---

## Disclaimer

⚠️ **For clinical decision support only.** All AI outputs must be reviewed by a qualified clinician. Confirm findings with clinical breast examination, imaging, and biopsy as appropriate. Do not use as sole basis for diagnosis or treatment decisions.

---

<p align="center">
  <sub>© 2026 Makerere University Group 11</sub>
</p>
