# BCan Scan - Development Notes

## Architecture Overview

### Technology Stack
- **Frontend Framework**: React 19.2.4
- **Build Tool**: Vite 8.0.0
- **Routing**: React Router DOM 6.22.0
- **State Management**: Zustand 4.4.7
- **Icons**: React Icons 5.0.1
- **Styling**: CSS Modules + Flexbox/Grid
- **Font**: Fira Code (Google Fonts)

### Design Patterns Used

#### 1. Component-Based Architecture
- Reusable UI components (Button, Card, FormInputs)
- Page components for routing
- Layout wrapper for consistent structure
- Props-driven customization

#### 2. State Management with Zustand
```javascript
// Simple, scalable state store
const useAppStore = create((set) => ({
  riskFactors: {...},
  setRiskFactors: (factors) => set(...),
  chatMessages: [],
  addMessage: (msg) => set(...),
  // ... more state
}))
```

#### 3. CSS Modules
- Scoped styling (no naming conflicts)
- Responsive design patterns
- Flexbox/Grid layouts
- Mobile-first approach

#### 4. Mock Services Pattern
```javascript
// Services layer for API calls (can be replaced with real APIs)
export const predictRisk = async (factors) => {
  // Currently simulated, but structure ready for real API
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(riskPrediction);
    }, 1500);
  });
}
```

## Component Hierarchy

```
App (Router)
├── Layout
│   ├── Header
│   │   ├── Logo
│   │   └── Navigation
│   ├── Main (Route-based pages)
│   │   ├── HomePage
│   │   ├── RiskAssessmentPage
│   │   │   ├── Input
│   │   │   ├── Select
│   │   │   ├── RadioGroup
│   │   │   └── ProgressBar
│   │   ├── ImageUploadPage
│   │   ├── ResultsDashboardPage
│   │   ├── AIAssistantPage
│   │   ├── HistoryPage
│   │   └── AboutPage
│   └── Footer
```

## State Flow

```
User Input
    ↓
Page Component
    ↓
Update Zustand Store
    ↓
Call Mock Service
    ↓
Save Result to Store
    ↓
Store to LocalStorage
    ↓
Re-render Component
    ↓
Display Results
```

## Key Decisions

### 1. CSS Modules Over Tailwind
- **Why**: Direct control over styling
- **Benefit**: No utility class bloat
- **Trade-off**: More CSS code, but more maintainable

### 2. Zustand Over Redux
- **Why**: Simple, lightweight state management
- **Benefit**: Less boilerplate, easier onboarding
- **Trade-off**: Limited for very large apps

### 3. Mock Services Architecture
- **Why**: Frontend can be built independently
- **Benefit**: Easy to test and develop
- **Trade-off**: Need to replace with real APIs later

### 4. CSS Variables for Theme
- **Why**: Easy color/spacing customization
- **Benefit**: Single source of truth
- **Trade-off**: Less supported in older browsers

## File Naming Conventions

- **Pages**: `NamePage.jsx` (e.g., `HomePage.jsx`)
- **Components**: `ComponentName.jsx` (e.g., `Button.jsx`)
- **Services**: `noun.js` (e.g., `mockServices.js`)
- **Store**: `storeName.js` (e.g., `appStore.js`)
- **Utils**: `domain.js` (e.g., `helpers.js`)
- **Styles**: `ComponentName.module.css` (scoped)

## Responsive Design Strategy

### Breakpoints
```css
/* Mobile First */
Mobile: 0-640px (default)
Tablet: 640px - 1024px (@media max-width: 768px)
Desktop: 1024px+ (@media max-width: 1024px)
```

### Layout Patterns
- **Single Column**: Mobile
- **Two Columns**: Tablet/Desktop
- **Three+ Columns**: Large Desktop
- Flexbox for alignment
- CSS Grid for complex layouts
- `max-width: 1200px` for containers

## Performance Considerations

### Code Splitting
- React Router enables automatic route-based splitting
- Each page component loaded on demand
- Built-in with Vite

### Caching Strategy
- Service Worker caches static assets
- LocalStorage for user data
- IndexedDB ready for larger storage

### Optimization
- Lazy loading images
- Debouncing form inputs (ready to add)
- Memoization ready (React.memo)
- CSS minification in build

## Security Considerations

### Current (Development)
- Mock data only
- No sensitive information
- LocalStorage (client-side) for history

### Future (Production)
- HTTPS enforcement
- JWT token storage (secure httpOnly cookies)
- Backend validation
- CORS configuration
- Rate limiting
- Input sanitization

## Accessibility Features

### Implemented
- Semantic HTML (buttons, inputs, forms)
- ARIA labels on interactive elements
- Color contrast compliance
- Keyboard navigation support
- Focus indicators
- Screen reader support
- `sr-only` class for hidden text

### To Enhance
- Skip navigation link
- Focus trap in modals
- ARIA live regions for async content
- Tab order optimization

## Testing Strategy (Future)

### Unit Tests
- Component rendering
- State updates
- Helper functions
- Mock services

### Integration Tests
- Page flows
- Form submissions
- Navigation
- History operations

### E2E Tests
- Complete user workflows
- Cross-browser testing
- Performance testing

### Tools (Suggested)
- Vitest for unit tests
- React Testing Library for components
- Cypress for E2E

## API Integration Plan

### Current
```javascript
// src/services/mockServices.js
export const predictRisk = async (factors) => {
  // Mock implementation
}
```

### Future
```javascript
// Replace with real API calls
export const predictRisk = async (factors) => {
  const response = await fetch('/api/predict-risk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(factors)
  });
  return response.json();
}
```

## Error Handling

### Current
- Basic try-catch in async functions
- Form validation errors
- File upload validation

### To Add
- Error boundaries for React errors
- API error handling
- User-friendly error messages
- Error logging service
- Retry logic

## LocalStorage Data Structure

### Storage Keys
```javascript
'bcanscan_history' → Array of sessions
```

### Session Object
```javascript
{
  id: timestamp,
  type: 'risk_assessment' | 'image_upload',
  factors: {...},     // for risk assessment
  images: [...],      // for image upload
  results: {...},     // predictions
  timestamp: Date
}
```

## Environment Variables Ready

```
VITE_API_URL        → Backend API endpoint
VITE_AUTH_TOKEN     → Authentication token
VITE_SENTRY_DSN     → Error tracking
VITE_APP_VERSION    → Version tracking
```

## Build Configuration

### Vite Config
- React plugin enabled
- Port 5173/5174
- HMR enabled for development
- Built-in Vue, TypeScript support ready

### Production Build
- Minified CSS and JavaScript
- Asset optimization
- Source maps (optional)
- SEO optimized

## Git Workflow Recommendations

```
main
├── stable production code
develop
├── working branch
├── feature/risk-assessment ✓ (merged)
├── feature/image-upload ✓ (merged)
├── feature/chat ✓ (merged)
├── feature/backend-integration (future)
└── feature/advanced-analytics (future)
```

## Documentation Structure

1. **README_PROJECT.md** - Full project documentation
2. **QUICK_START.md** - Quick setup guide
3. **DEVELOPMENT_NOTES.md** - This file
4. **Code Comments** - In-line documentation
5. **Component JSDoc** - Function documentation

## Deployment Checklist

- [ ] Update version in package.json
- [ ] Run `npm run build`
- [ ] Test production build locally
- [ ] Update environment variables
- [ ] Run linter: `npm run lint`
- [ ] Review bundle size
- [ ] Update service worker
- [ ] Test PWA offline
- [ ] Test on mobile
- [ ] Deploy to staging
- [ ] Final testing on staging
- [ ] Deploy to production

## Known Limitations

### Current
1. Mock data only - no real predictions
2. No backend integration
3. No authentication
4. Client-side storage only
5. No image actual analysis
6. Chat responses predetermined

### Future
1. Real ML model integration
2. Secure backend
3. User authentication
4. HIPAA compliance
5. Advanced analytics
6. Historical trending

## Extension Points

### Easy to Add
- New form fields to risk assessment
- New chat responses
- New result visualizations
- New history filters
- Theme customization

### Medium Complexity
- New pages/features
- Backend API integration
- Advanced filtering
- Data export (PDF/CSV)
- Analytics dashboard

### Complex
- Multi-user system
- Role-based access
- Advanced security
- HIPAA compliance
- Enterprise features

---

**Document Version**: 1.0.0  
**Last Updated**: 2024  
**For**: Development Team
