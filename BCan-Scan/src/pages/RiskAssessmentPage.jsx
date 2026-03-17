import { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { predictRisk } from '../services/mockServices';
import { validateAge } from '../utils/helpers';
import { colors } from '../utils/colors.js';
import Card from '../components/Card';
import Button from '../components/Button';
import { Input, Select, RadioGroup, ProgressBar } from '../components/FormInputs';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import bg2Desktop from '../assets/bg2.webp';
import bg2Mobile from '../assets/bg2.jpg';

export default function RiskAssessmentPage() {
  const { riskFactors, setRiskFactors, addPrediction, addToHistory } = useAppStore();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(1);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRiskFactors({ ...riskFactors, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!riskFactors.age) {
      newErrors.age = 'Age is required';
    } else if (!validateAge(riskFactors.age)) {
      newErrors.age = 'Age must be between 18 and 120';
    }

    if (!riskFactors.familyHistory) {
      newErrors.familyHistory = 'Please select family history status';
    }

    if (!riskFactors.reproductiveHistory) {
      newErrors.reproductiveHistory = 'Please select reproductive history';
    }

    if (!riskFactors.obesityStatus) {
      newErrors.obesityStatus = 'Please select obesity status';
    }

    if (!riskFactors.lifestyleFactors) {
      newErrors.lifestyleFactors = 'Please select lifestyle factors';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const prediction = await predictRisk(riskFactors);
      setResult(prediction);
      addPrediction(prediction);
      addToHistory({
        type: 'risk_assessment',
        factors: riskFactors,
        result: prediction,
      });
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const progress = step === 1 ? 50 : 100;

  if (result) {
    const riskColor =
      result.level === 'High' ? colors.danger : result.level === 'Medium' ? colors.warning : colors.success;

    return (
      <div
        style={{
          ...styles.pageBackground,
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.45)), url(${isMobile ? bg2Mobile : bg2Desktop})`,
        }}
      >
        <div style={styles.container}>
          <h1>Risk Assessment Result</h1>

        <Card highlight={true} style={styles.resultCard}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ ...styles.resultIcon, color: riskColor }}>
              {result.level === 'High' ? (
                <FiAlertCircle size={64} />
              ) : (
                <FiCheckCircle size={64} />
              )}
            </div>

            <h2 style={{ marginTop: '1rem', fontSize: '2rem', color: riskColor }}>
              {result.level} Risk
            </h2>

            <div style={styles.scoreContainer}>
              <div style={styles.scoreValue}>
                <span style={{ fontSize: '2.5rem', fontWeight: '700' }}>{result.score}</span>
                <span style={{ marginLeft: '0.5rem', fontSize: '1.125rem', color: 'var(--gray-500)' }}>
                  / 100
                </span>
              </div>
            </div>

            <ProgressBar progress={result.score} />

            <p style={{ marginTop: '2rem', color: 'var(--gray-600)', lineHeight: '1.8' }}>
              {result.level === 'High' &&
                'Based on your clinical factors, you have a higher risk for breast cancer. We recommend scheduling a consultation with your healthcare provider for further evaluation.'}
              {result.level === 'Medium' &&
                'Your risk profile indicates moderate concern. Regular screening and monitoring are recommended. Consult with your healthcare provider for personalized guidance.'}
              {result.level === 'Low' &&
                'Your current risk factors suggest lower breast cancer risk. Continue with regular screening as recommended by healthcare professionals.'}
            </p>

            <div style={styles.resultActions}>
              <Button size="large" onClick={() => setResult(null)}>
                New Assessment
              </Button>
              <Button
                size="large"
                variant="secondary"
                onClick={() => {
                  /* navigate to results */
                }}
              >
                View Results
              </Button>
            </div>
          </div>
        </Card>

          <Card title="Your Factors" style={{ marginTop: '2rem' }}>
          <div style={styles.factorsList}>
            <div style={styles.factorItem}>
              <span style={styles.factorLabel}>Age:</span>
              <span>{riskFactors.age} years</span>
            </div>
            <div style={styles.factorItem}>
              <span style={styles.factorLabel}>Family History:</span>
              <span>{riskFactors.familyHistory}</span>
            </div>
            {riskFactors.tumorSize && (
              <div style={styles.factorItem}>
                <span style={styles.factorLabel}>Tumor Size:</span>
                <span>{riskFactors.tumorSize} mm</span>
              </div>
            )}
            <div style={styles.factorItem}>
              <span style={styles.factorLabel}>Reproductive History:</span>
              <span>{riskFactors.reproductiveHistory}</span>
            </div>
            <div style={styles.factorItem}>
              <span style={styles.factorLabel}>Obesity Status:</span>
              <span>{riskFactors.obesityStatus}</span>
            </div>
            <div style={styles.factorItem}>
              <span style={styles.factorLabel}>Lifestyle Factors:</span>
              <span>{riskFactors.lifestyleFactors}</span>
            </div>
          </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        ...styles.pageBackground,
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.45)), url(${isMobile ? bg2Mobile : bg2Desktop})`,
      }}
    >
      <div style={styles.container}>
        <h1>Clinical Risk Assessment</h1>
        <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>
          Enter your clinical factors to receive a personalized risk prediction
        </p>

        <Card>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.progressSection}>
            <ProgressBar progress={progress} />
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
              Step {step} of 2
            </p>
          </div>

          {step === 1 ? (
            <>
              <h3>Basic Information</h3>

              <Input
                label="Age (years)"
                name="age"
                type="number"
                value={riskFactors.age}
                onChange={handleChange}
                error={errors.age}
                required
                min="18"
                max="120"
              />

              <Input
                label="Tumor Size (mm)"
                name="tumorSize"
                type="number"
                value={riskFactors.tumorSize}
                onChange={handleChange}
                placeholder="Optional"
              />

              <RadioGroup
                label="Family History of Breast Cancer"
                name="familyHistory"
                value={riskFactors.familyHistory}
                onChange={handleChange}
                required
                options={[
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                  { value: 'unknown', label: 'Unknown' },
                ]}
              />

              <div style={styles.stepButtons}>
                <Button variant="secondary" size="large" onClick={() => setStep(2)}>
                  Next
                </Button>
              </div>
            </>
          ) : (
            <>
              <h3>Medical & Lifestyle Information</h3>

              <Select
                label="Reproductive History"
                name="reproductiveHistory"
                value={riskFactors.reproductiveHistory}
                onChange={handleChange}
                required
                error={errors.reproductiveHistory}
                options={[
                  { value: 'nulliparous', label: 'No children' },
                  { value: 'parous_early', label: 'First child before 30' },
                  { value: 'parous_late', label: 'First child after 30' },
                  { value: 'breastfeeding', label: 'Breastfeeding experience' },
                ]}
              />

              <Select
                label="Obesity Status"
                name="obesityStatus"
                value={riskFactors.obesityStatus}
                onChange={handleChange}
                required
                error={errors.obesityStatus}
                options={[
                  { value: 'underweight', label: 'Underweight (BMI < 18.5)' },
                  { value: 'normal', label: 'Normal (BMI 18.5 - 24.9)' },
                  { value: 'overweight', label: 'Overweight (BMI 25 - 29.9)' },
                  { value: 'obese', label: 'Obese (BMI ≥ 30)' },
                ]}
              />

              <Select
                label="Lifestyle Factors"
                name="lifestyleFactors"
                value={riskFactors.lifestyleFactors}
                onChange={handleChange}
                required
                error={errors.lifestyleFactors}
                options={[
                  { value: 'sedentary', label: 'Sedentary' },
                  { value: 'moderate', label: 'Moderate activity' },
                  { value: 'active', label: 'Active' },
                  { value: 'very_active', label: 'Very active' },
                ]}
              />

              <div style={styles.stepButtons}>
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  size="large"
                  disabled={loading}
                  onClick={handleSubmit}
                >
                  {loading ? 'Analyzing...' : 'Get Risk Prediction'}
                </Button>
              </div>
            </>
          )}
        </form>
        </Card>
      </div>
    </div>
  );
}

const styles = {
  pageBackground: {
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    width: '100vw',
    marginLeft: 'calc(50% - 50vw)',
    marginRight: 'calc(50% - 50vw)',
    minHeight: 'calc(100dvh - 72px)',
    borderRadius: '0',
    padding: '1.25rem',
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  progressSection: {
    marginBottom: '1rem',
  },
  stepButtons: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem',
    justifyContent: 'flex-end',
  },
  resultCard: {
    marginTop: '2rem',
    padding: '2rem',
  },
  resultIcon: {
    display: 'flex',
    justifyContent: 'center',
  },
  scoreContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '1rem',
  },
  scoreValue: {
    display: 'flex',
    alignItems: 'baseline',
  },
  resultActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginTop: '2rem',
    flexWrap: 'wrap',
  },
  factorsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  factorItem: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid var(--gray-200)',
  },
  factorLabel: {
    fontWeight: '600',
    color: 'var(--primary)',
  },
};
