# BCan Scan - Breast Cancer Screening AI Assistant

A comprehensive React-based Progressive Web Application (PWA) for breast cancer screening, AI-powered image analysis, and medical decision support.

## 🚀 Features

### Core Functionality
- **Risk Assessment Form**: Collect clinical risk factors and generate personalized risk predictions
- **Image Upload & Classification**: Upload histopathology images for AI-powered analysis
- **Conversational AI Assistant**: Interactive chatbot for medical information and guidance
- **Results Dashboard**: Comprehensive visualization of all predictions and analyses
- **Screening History**: Track all previous screening sessions with temporal comparison
- **Responsive Design**: Fully mobile-friendly interface optimized for all devices

### Technical Features
- Progressive Web App (PWA) with offline support
- State management with Zustand
- Component-based architecture with CSS Modules
- Real-time form validation
- Chat interface with typing indicators
- Mock services for development/testing
- Local storage persistence

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Layout.jsx       # Main layout wrapper
│   ├── Button.jsx       # Reusable button component
│   ├── Card.jsx         # Card component
│   └── FormInputs.jsx   # Form input components (Input, Select, RadioGroup)
│
├── pages/               # Page components
│   ├── HomePage.jsx              # Home/landing page
│   ├── RiskAssessmentPage.jsx    # Risk factor collection form
│   ├── ImageUploadPage.jsx       # Image upload interface
│   ├── ResultsDashboardPage.jsx  # Results display
│   ├── AIAssistantPage.jsx       # Chat interface
│   ├── HistoryPage.jsx           # Screening history
│   └── AboutPage.jsx             # Project information
│
├── store/               # State management
│   └── appStore.js      # Zustand store
│
├── services/            # Mock services
│   └── mockServices.js  # Prediction and classification services
│
├── utils/               # Utility functions
│   └── helpers.js       # Validation, formatting, storage helpers
│
├── styles/              # CSS Modules
│   ├── Layout.module.css
│   ├── Button.module.css
│   ├── Card.module.css
│   └── Form.module.css
│
├── App.jsx              # Main app component with routing
├── main.jsx             # Entry point
└── index.css            # Global styles
```

## 🎨 Design System

### Colors
- **Primary**: #1e40af (Blue)
- **Primary Light**: #3b82f6
- **Secondary**: #0891b2 (Cyan)
- **Success**: #16a34a (Green)
- **Warning**: #ea580c (Orange)
- **Danger**: #dc2626 (Red)

### Typography
- **Font Family**: Fira Code (monospace)
- **Font Weights**: 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- Responsive sizing with mobile adaptation

### Icons
- **Library**: React Icons (FiIcon family)
- Real icon usage (no emoji) for professional appearance
- Consistent sizing and styling

## 🔧 Installation & Setup

### Prerequisites
- Node.js 16+ and npm/yarn
- Modern web browser

### Installation

```bash
# Navigate to project directory
cd BCan-Scan

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm build

# Preview production build
npm preview
```

Development server will be available at `http://localhost:5174/`

## 📱 Pages Overview

### 1. Home Page
- Project introduction
- Feature overview cards
- Call-to-action buttons
- Quick links to main features

### 2. Risk Assessment
- Multi-step form (2 steps)
- Clinical factor collection
- Real-time validation
- Risk score calculation (0-100)
- Result interpretation (Low/Medium/High)

### 3. Image Upload
- Drag-and-drop interface
- File validation (PNG/JPG, max 5MB)
- Preview thumbnails
- Batch classification
- Confidence scoring

### 4. Results Dashboard
- Risk prediction visualization
- Image classification results
- Summary statistics
- Historical comparison
- Export/print options (ready for implementation)

### 5. AI Assistant Chat
- Real-time messaging
- Suggested questions
- Typing indicators
- Message history
- Clear chat functionality

### 6. History
- Chronological listing
- Session details
- Quick filters
- Delete functionality
- Archive management

### 7. About
- Project mission and vision
- Technology stack details
- Feature explanations
- Team information
- Legal disclaimers

## 🎯 Key Components

### Button Component
```jsx
<Button 
  variant="primary"  // primary, secondary, outline
  size="large"       // small, medium, large
  icon={FiIcon}      // Optional icon
  disabled={false}
>
  Click Me
</Button>
```

### Card Component
```jsx
<Card 
  title="Card Title"
  badge="Status"
  badgeVariant="primary"  // primary, danger, warning, success
  highlight={true}
>
  Card content
</Card>
```

### Form Inputs
```jsx
<Input 
  label="Field Label"
  name="fieldName"
  type="text"
  required
  error={errors.fieldName}
  helperText="Helper text"
/>

<Select
  label="Select..."
  options={[
    { value: 'opt1', label: 'Option 1' },
  ]}
/>

<RadioGroup
  label="Choose one"
  options={[...]}
/>
```

## 🔐 State Management

Using Zustand for global state:

```javascript
const { 
  riskFactors, 
  setRiskFactors,
  predictions,
  addPrediction,
  chatMessages,
  addMessage,
  history,
  addToHistory
} = useAppStore();
```

## 🧪 Mock Services

### Prediction Service
```javascript
const riskPrediction = await predictRisk(factors);
// Returns: { level: 'High'|'Medium'|'Low', score: 0-100 }

const classification = await classifyImage(imageData);
// Returns: { classification: 'Benign'|'Malignant', confidence: % }

const response = await getChatResponse(message);
// Returns: assistant response string
```

## 📊 Data Persistence

### Local Storage
- Screening history saved automatically
- Chat sessions can be persisted
- User preferences
- Risk factor templates

```javascript
import { 
  localStorage_getItem, 
  localStorage_setItem 
} from './utils/helpers';
```

## 🌐 PWA Features

### Manifest
- App name and description
- Installation icons
- Splash screens
- App shortcuts

### Service Worker
- Offline caching
- Network-first strategy
- Cache-first fallback
- Background updates

## 🎓 Educational Features

### Risk Assessment Learning
- Helper text for each field
- Risk score explanation
- Factor impact description
- Medical terminology explanations

### Information Resources
- AI Assistant with medical information
- About page with background
- Links to healthcare resources
- Educational disclaimers

## ♿ Accessibility

- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Color contrast compliance
- Screen reader support
- Semantic HTML structure

## 📱 Mobile Optimization

- Responsive grid layouts
- Touch-friendly buttons
- Mobile-first CSS
- Optimized font sizes
- Flexible navigation
- Viewport optimization

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm i -g vercel
vercel
```

### Deploy to Netlify
- Connect GitHub repository
- Set build command: `npm run build`
- Set publish directory: `dist`

## 📝 Environment Variables

Currently using mock services. To add backend integration:

```
VITE_API_URL=https://api.example.com
VITE_AUTH_TOKEN=your_token_here
```

## 🔄 Future Development

### Phase 2: Backend Integration
- REST/GraphQL API endpoints
- Real ML models integration
- User authentication
- Secure data storage

### Phase 3: Advanced Features
- Grad-CAM visualizations
- RAG chatbot integration
- Multi-language support
- Advanced analytics

### Phase 4: Production Ready
- HIPAA compliance
- Data encryption
- Audit logging
- Professional deployment

## 🐛 Troubleshooting

### Port 5173 in Use
```bash
npm run dev -- --port 5175
```

### Dependency Issues
```bash
rm -rf node_modules package-lock.json
npm install
```

### Clear Browser Cache
- Clear browser cache
- Clear service worker
- Restart dev server

## 📚 Resources

- [React Documentation](https://react.dev)
- [React Router](https://reactrouter.com)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Icons](https://react-icons.github.io/react-icons/)
- [Vite Guide](https://vitejs.dev/guide/)
- [PWA Documentation](https://web.dev/progressive-web-apps/)

## 📄 License

This project is for educational purposes. All rights reserved.

## ⚠️ Disclaimer

**This is an educational and demonstration project.** It is NOT intended for actual medical diagnosis or clinical use. All features currently use simulated data. For real breast cancer screening and medical concerns, please consult with qualified healthcare professionals.

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Development
