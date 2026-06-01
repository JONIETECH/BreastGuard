import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ResultsDashboardPage from './pages/ResultsDashboardPage';
import AIAssistantPage from './pages/AIAssistantPage';
import HistoryPage from './pages/HistoryPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/risk-assessment" element={<Navigate to="/assistant" replace />} />
          <Route path="/results" element={<ResultsDashboardPage />} />
          <Route path="/assistant" element={<AIAssistantPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
