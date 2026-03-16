import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import RiskAssessmentPage from './pages/RiskAssessmentPage';
import ImageUploadPage from './pages/ImageUploadPage';
import ResultsDashboardPage from './pages/ResultsDashboardPage';
import AIAssistantPage from './pages/AIAssistantPage';
import HistoryPage from './pages/HistoryPage';
import AboutPage from './pages/AboutPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/risk-assessment" element={<RiskAssessmentPage />} />
          <Route path="/image-upload" element={<ImageUploadPage />} />
          <Route path="/results" element={<ResultsDashboardPage />} />
          <Route path="/assistant" element={<AIAssistantPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
