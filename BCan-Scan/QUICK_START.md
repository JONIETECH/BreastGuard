# BCan Scan - Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Start Development Server
```bash
npm run dev
```
Opens at `http://localhost:5174/`

### 2. Explore the Application

#### Home Page (/)
- Overview of the application
- Quick links to main features
- Project introduction

#### Risk Assessment (/risk-assessment)
1. Enter age (18-120)
2. Add tumor size (optional)
3. Select family history (Yes/No/Unknown)
4. Fill medical information
5. Submit to see risk prediction
6. Result will show: Low/Medium/High with score

**Test Data:**
- Age: 55
- Family History: Yes
- Will produce Medium-High risk score

#### Image Upload (/image-upload)
1. Drag and drop images or click to select
2. Supported: PNG, JPG (max 5MB)
3. Click "Classify Images"
4. See classification results (Benign/Malignant)
5. View confidence scores

**Note:** Currently simulated - returns random results

#### Results Dashboard (/results)
- View all predictions made
- See risk assessments
- Review image classifications
- Summary statistics

#### AI Assistant (/assistant)
- Type questions about breast cancer
- Click suggested questions
- Get instant responses
- View chat history

**Example Questions:**
- "What does malignant mean?"
- "What are common symptoms?"
- "How is breast cancer treated?"

#### History (/history)
- View all screening sessions
- See timestamps
- Delete entries
- Review past results

#### About (/about)
- Project information
- Technology stack
- Features explanation
- Team details
- Disclaimer

## 🎯 Key Features to Try

### 1. Risk Assessment Multi-Step Form
- Step 1: Basic info (age, tumor size, family history)
- Step 2: Medical factors (reproductive, obesity, lifestyle)
- Real-time validation
- Progress indicator
- Instant risk score

### 2. Image Upload with Drag-Drop
- Drag images onto the upload area
- See preview thumbnails
- Batch classify multiple images
- Confidence scores displayed

### 3. Interactive Chat
- Type any health question
- Suggested quick questions
- Real-time responses
- Clear chat history
- Typing indicators

### 4. History Tracking
- All sessions saved automatically
- Timestamp tracking
- Quick deletion
- Browse previous results

## 🔧 Common Tasks

### Change Colors
Edit `src/index.css` (CSS variables at top)

### Add New Page
1. Create `src/pages/YourPage.jsx`
2. Add route in `src/App.jsx`
3. Add navigation link in `src/components/Layout.jsx`

### Modify Form Fields
Edit `src/pages/RiskAssessmentPage.jsx`

### Update AI Responses
Edit `src/services/mockServices.js` (getChatResponse function)

### Customize Styling
- Global: `src/index.css`
- Component: `src/styles/*.module.css`

## 📦 Project Structure Quick Reference

```
src/
├── pages/         ← Page components
├── components/    ← Reusable components
├── services/      ← Mock data/APIs
├── store/         ← Global state (Zustand)
├── utils/         ← Helper functions
├── styles/        ← CSS modules
├── App.jsx        ← Main routing
└── main.jsx       ← Entry point
```

## 🧪 Testing Mock Services

### Risk Prediction Test
```javascript
import { predictRisk } from './services/mockServices';

const result = await predictRisk({
  age: '55',
  familyHistory: 'yes',
  tumorSize: '25'
});
// Returns: { level: 'High', score: 75, color: '#dc2626' }
```

### Image Classification Test
```javascript
import { classifyImage } from './services/mockServices';

const result = await classifyImage(imageData);
// Returns: { classification: 'Benign'|'Malignant', confidence: 85.5 }
```

### Chat Response Test
```javascript
import { getChatResponse } from './services/mockServices';

const response = await getChatResponse('What is malignant?');
// Returns: explanation text
```

## 🎨 Customization Guide

### Colors
```css
/* src/index.css */
:root {
  --primary: #1e40af;        /* Blue */
  --success: #16a34a;        /* Green */
  --warning: #ea580c;        /* Orange */
  --danger: #dc2626;         /* Red */
}
```

### Fonts
Already using **Fira Code** from Google Font with weights 300-700

### Icons
Using **React Icons** library. Change in components:
```jsx
import { FiIcon } from 'react-icons/fi';  // Feather icons
import { BiIcon } from 'react-icons/bi';  // Bootstrap icons
import { MdIcon } from 'react-icons/md';  // Material Design
```

## 🚀 Build & Deploy

### Build Production
```bash
npm run build
# Creates dist/ folder
```

### Preview Build
```bash
npm run preview
```

### Deploy to Netlify
```bash
# Connect repo to Netlify
# Set build: npm run build
# Set output: dist
```

### Deploy to Vercel
```bash
npm i -g vercel
vercel
```

## 📱 PWA Installation

### Desktop
1. Visit `http://localhost:5174/`
2. Click "Install" in address bar
3. Or click menu → "Install app"

### Mobile
1. Open app in mobile browser
2. Tap menu (⋯ or ⋮)
3. Select "Add to Home Screen"

## 🐛 Common Issues

### Port Already Taken
```bash
npm run dev -- --port 5175
```

### Dependencies Not Found
```bash
rm -rf node_modules package-lock.json
npm install
```

### Clear Cache
```bash
# Browser Developer Tools:
# 1. DevTools → Application
# 2. Clear Cache Storage
# 3. Unregister Service Worker
# 4. Hard refresh (Ctrl+Shift+R)
```

## 📚 Files to Edit

### For Backend Integration
- `src/services/mockServices.js` ← Replace with API calls

### To Add Features
- `src/pages/` ← Add new pages
- `src/components/` ← Add new components
- `src/store/appStore.js` ← Add new state

### To Change Styling
- `src/index.css` ← Global styles
- `src/styles/*.module.css` ← Component styles

### To Add Routes
- `src/App.jsx` ← Add Route

## 🎓 Learning Path

1. **Explore UI**
   - Navigate through all pages
   - Try all features
   - Review the design

2. **Read Components**
   - Check `src/components/`
   - Understand reusable patterns
   - Study CSS modules

3. **Modify Services**
   - Update mock data
   - Change AI responses
   - Test predictions

4. **Extend Features**
   - Add new form fields
   - Create new pages
   - Integrate real APIs

## ✅ Checklist for First Run

- [ ] Run `npm install`
- [ ] Run `npm run dev` 
- [ ] Open `http://localhost:5174`
- [ ] Visit Home page
- [ ] Try Risk Assessment
- [ ] Upload test image
- [ ] Chat with AI
- [ ] Check History
- [ ] Read About page
- [ ] Explore code structure

## 📞 Need Help?

- Check `README_PROJECT.md` for full documentation
- Review component files for examples
- Check `src/services/mockServices.js` for service patterns
- See `src/styles/` for CSS module examples

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Ready to Use
