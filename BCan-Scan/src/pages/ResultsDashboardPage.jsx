import { useAppStore } from '../store/appStore';
import Card from '../components/Card';
import { colors } from '../utils/colors.js';
import { FiTrendingUp, FiCheck, FiAlertCircle } from 'react-icons/fi';

export default function ResultsDashboardPage() {
  const { predictions, riskFactors } = useAppStore();

  if (predictions.length === 0) {
    return (
      <div style={styles.container}>
        <h1>Results Dashboard</h1>
        <Card highlight={true} style={{ textAlign: 'center', padding: '3rem' }}>
          <FiAlertCircle size={48} style={{ color: 'var(--warning)', marginBottom: '1rem' }} />
          <h3>No Results Yet</h3>
          <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem' }}>
            Complete a risk assessment or image upload to see results here.
          </p>
        </Card>
      </div>
    );
  }

  const riskPredictions = predictions.filter((p) => p.level);
  const classificationPredictions = predictions.filter((p) => p.classification);

  return (
    <div style={styles.container}>
      <h1>Results Dashboard</h1>

      {/* Risk Predictions */}
      {riskPredictions.length > 0 && (
        <section style={styles.section}>
          <h2>Risk Assessment Results</h2>
          <div style={styles.resultGrid}>
            {riskPredictions.map((prediction, idx) => (
              <Card
                key={idx}
                title={`Risk Level: ${prediction.level}`}
                badge={`${prediction.score}/100`}
                badgeVariant={
                  prediction.level === 'High'
                    ? 'danger'
                    : prediction.level === 'Medium'
                      ? 'warning'
                      : 'success'
                }
              >
                <div style={styles.resultContent}>
                  <div style={styles.scoreBar}>
                    <div
                      style={{
                        ...styles.scoreBarFill,
                        width: `${prediction.score}%`,
                        backgroundColor:
                          prediction.level === 'High'
                            ? colors.danger
                            : prediction.level === 'Medium'
                              ? colors.warning
                              : colors.success,
                      }}
                    />
                  </div>
                  <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                    {prediction.level === 'High' && 'HIGH RISK - Urgent consultation recommended'}
                    {prediction.level === 'Medium' && 'MODERATE RISK - Regular monitoring advised'}
                    {prediction.level === 'Low' && 'LOW RISK - Continue standard screening'}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Classification Results */}
      {classificationPredictions.length > 0 && (
        <section style={styles.section}>
          <h2>Image Classification Results</h2>
          <div style={styles.resultGrid}>
            {classificationPredictions.map((prediction, idx) => (
              <Card
                key={idx}
                title={prediction.classification}
                badge={`${prediction.confidence.toFixed(1)}%`}
                badgeVariant={prediction.classification === 'Benign' ? 'success' : 'danger'}
              >
                <div style={styles.resultContent}>
                  <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    {prediction.classification === 'Benign' ? (
                      <FiCheck size={40} style={{ color: 'var(--success)' }} />
                    ) : (
                      <FiAlertCircle size={40} style={{ color: 'var(--danger)' }} />
                    )}
                  </div>
                  <div style={styles.confidenceBar}>
                    <div
                      style={{
                        ...styles.confidenceBarFill,
                        width: `${prediction.confidence}%`,
                        backgroundColor:
                          prediction.classification === 'Benign' ? colors.success : colors.danger,
                      }}
                    />
                  </div>
                  <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                    Confidence: {prediction.confidence.toFixed(1)}%
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Summary */}
      <section style={styles.section}>
        <Card title="Assessment Summary">
          <div style={styles.summaryContent}>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Total Predictions:</span>
              <span style={styles.summaryValue}>{predictions.length}</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Risk Assessments:</span>
              <span style={styles.summaryValue}>{riskPredictions.length}</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Image Classifications:</span>
              <span style={styles.summaryValue}>{classificationPredictions.length}</span>
            </div>

            {riskPredictions.length > 0 && (
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Latest Risk Level:</span>
                <span
                  style={{
                    ...styles.summaryValue,
                    color:
                      riskPredictions[riskPredictions.length - 1].level === 'High'
                        ? colors.danger
                        : riskPredictions[riskPredictions.length - 1].level === 'Medium'
                          ? colors.warning
                          : colors.success,
                  }}
                >
                  {riskPredictions[riskPredictions.length - 1].level}
                </span>
              </div>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  section: {
    marginBottom: '3rem',
  },
  resultGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginTop: '1.5rem',
  },
  resultContent: {
    padding: '1rem 0',
  },
  scoreBar: {
    width: '100%',
    height: '12px',
    backgroundColor: 'var(--gray-200)',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  confidenceBar: {
    width: '100%',
    height: '8px',
    backgroundColor: 'var(--gray-200)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  summaryContent: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2rem',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '1rem',
    borderBottom: '1px solid var(--gray-200)',
  },
  summaryLabel: {
    fontWeight: '600',
    color: 'var(--gray-600)',
  },
  summaryValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'var(--primary)',
  },
};
