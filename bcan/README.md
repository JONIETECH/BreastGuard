<div align="center">
  <img src="assets/full-logo.webp" alt="BreastGuard Logo" width="300">
  <h1>Mobile App</h1>
  <p><strong>AI-Powered Breast Cancer Screening for Android</strong></p>
  <p>
    <img src="https://img.shields.io/badge/Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white" alt="Flutter">
    <img src="https://img.shields.io/badge/Dart-0175C2?style=for-the-badge&logo=dart&logoColor=white" alt="Dart">
    <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase">
  </p>
</div>

## About BreastGuard Mobile

The **BreastGuard Mobile App** is a Flutter-based Android application developed by **Makerere University Group 11** under the supervision of **Dr. Emmanuel Lule**. It brings AI-powered breast cancer screening capabilities directly to healthcare providers' mobile devices.

### Key Features

- **AI Case Assessment**: Upload histopathology images and run AI analysis using our hybrid CNN + HGLCM model
- **Patient Risk Profiling**: Capture patient demographics, symptom duration, family history, and reproductive history
- **Guideline-Grounded Reports**: Receive clinical decision support reports based on WHO, Uganda MoH, and NCCN guidelines
- **Offline Capability**: Core functionality works without constant internet connectivity
- **Secure Data Handling**: HIPAA-aware design with local data encryption

### Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | Flutter 3.x |
| Language | Dart |
| Backend | BreastGuard API (Node.js + Prisma + Neon Postgres) |
| AI Integration | Hugging Face Inference API |
| State Management | Provider |
| Local Storage | flutter_secure_storage |

## Project Structure

```
lib/
├── main.dart                 # Application entry point
├── models/                   # Data models (Patient, Assessment, Report)
├── screens/                  # UI screens (Home, Assessment, History, Profile)
├── services/                 # API services and Firebase integration
├── providers/                # State management
├── utils/                    # Helper functions and constants
├── widgets/                  # Reusable UI components
└── assets/                   # Images, fonts, and static resources
    └── logo wordmark.webp    # BreastGuard brand logo
```

## Getting Started

### Prerequisites

- Flutter SDK 3.0 or higher
- Android Studio / VS Code with Flutter extension
- Android SDK (API 21+)
- Firebase project configuration

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd bcan
   ```

2. Install dependencies:
   ```bash
   flutter pub get
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set `API_BASE_URL` to your BreastGuard backend (e.g., `http://localhost:3001` for local dev or your Vercel URL).

4. Run the app:
   ```bash
   flutter run
   ```

### Building for Release

```bash
flutter build apk --release
flutter build appbundle --release
```

## Brand Colors

| Color | Hex Code | Usage |
|-------|----------|-------|
| Primary (Teal) | `#0f766e` | Headers, primary actions |
| Secondary (Pink) | `#ec4899` | Accents, CTAs, highlights |
| Success | `#16a34a` | Positive results, benign findings |
| Danger | `#dc2626` | Critical alerts, malignant findings |
| Neutral | Various grays | Text, backgrounds, borders |

## AI Model Integration

The mobile app connects to our **Hugging Face Space** running the hybrid deep learning model:

- **CNN Backbone**: EfficientNetB3/ResNet50 for image feature extraction
- **HGLCM Features**: Haralick texture analysis for histopathological patterns
- **Risk Stratification**: Random Forest classifier for patient risk factors
- **RAG Pipeline**: Retrieval-Augmented Generation for guideline-grounded recommendations

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

## License

This project is part of academic research at Makerere University. All rights reserved.

## Disclaimer

⚠️ **For clinical decision support only.** All AI outputs must be reviewed by a qualified clinician. Confirm findings with clinical breast examination, imaging, and biopsy as appropriate.

---

<p align="center">
  <sub>Built with ❤️ for better healthcare in Uganda</sub>
</p>
