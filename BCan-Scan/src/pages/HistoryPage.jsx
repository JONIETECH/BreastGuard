import { useAppStore } from '../store/appStore';
import Card from '../components/Card';
import Button from '../components/Button';
import { formatDate } from '../utils/helpers';
import { colors } from '../utils/colors.js';
import { FiTrash2, FiClock, FiAlertCircle } from 'react-icons/fi';

export default function HistoryPage() {
  const { history, removeFromHistory } = useAppStore();

  if (history.length === 0) {
    return (
      <div style={styles.container}>
        <h1>Screening History</h1>
        <Card highlight={true} style={{ textAlign: 'center', padding: '3rem' }}>
          <FiClock size={48} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
          <h3>No History Yet</h3>
          <p style={{ color: 'var(--gray-600)' }}>
            Your screening sessions will appear here as you use the application.
          </p>
        </Card>
      </div>
    );
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      removeFromHistory(id);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Screening History</h1>
      <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>
        Review your previous screening sessions and results
      </p>

      <div style={styles.historyList}>
        {history.map((session) => (
          <Card key={session.id} highlight={true} style={styles.historyCard}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.sessionTitle}>
                  {session.type === 'risk_assessment'
                    ? 'Risk Assessment'
                    : 'Image Upload'}
                </h3>
                <p style={styles.timestamp}>
                  {formatDate(session.timestamp)}
                </p>
              </div>
              <button
                onClick={() => handleDelete(session.id)}
                style={styles.deleteButton}
                title="Delete entry"
              >
                <FiTrash2 />
              </button>
            </div>

            {session.type === 'risk_assessment' && session.result && (
              <div style={styles.resultSection}>
                <h4>Risk Result</h4>
                <div style={styles.riskResult}>
                  <div
                    style={{
                      ...styles.riskBadge,
                      backgroundColor:
                        session.result.level === 'High'
                          ? colors.riskHighBg
                          : session.result.level === 'Medium'
                            ? colors.riskMediumBg
                            : colors.riskLowBg,
                      color:
                        session.result.level === 'High'
                          ? colors.riskHighText
                          : session.result.level === 'Medium'
                            ? colors.riskMediumText
                            : colors.riskLowText,
                    }}
                  >
                    {session.result.level} Risk
                  </div>
                  <span style={styles.scoreText}>
                    Score: {session.result.score}/100
                  </span>
                </div>

                {session.factors && (
                  <div style={styles.factorsSection}>
                    <h5>Factors</h5>
                    <ul style={styles.factorsList}>
                      <li>Age: {session.factors.age} years</li>
                      <li>
                        Family History: {session.factors.familyHistory}
                      </li>
                      {session.factors.tumorSize && (
                        <li>Tumor Size: {session.factors.tumorSize} mm</li>
                      )}
                      <li>
                        Reproductive History:{' '}
                        {session.factors.reproductiveHistory}
                      </li>
                      <li>Obesity Status: {session.factors.obesityStatus}</li>
                      <li>
                        Lifestyle Factors: {session.factors.lifestyleFactors}
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {session.type === 'image_upload' && session.results && (
              <div style={styles.resultSection}>
                <h4>Classification Results</h4>
                <div style={styles.classificationsGrid}>
                  {Object.entries(session.results).map(([id, result]) => (
                    <div
                      key={id}
                      style={{
                        ...styles.classificationItem,
                        backgroundColor:
                          result.classification === 'Benign'
                            ? colors.benignBg
                            : colors.malignantBg,
                      }}
                    >
                      <div
                        style={{
                          color:
                            result.classification === 'Benign'
                              ? colors.benignText
                              : colors.malignantText,
                          fontWeight: '600',
                        }}
                      >
                        {result.classification}
                      </div>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          color:
                            result.classification === 'Benign'
                              ? colors.benignConfidenceText
                              : colors.malignantConfidenceText,
                        }}
                      >
                        {result.confidence.toFixed(1)}% confidence
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  historyCard: {
    position: 'relative',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
  },
  sessionTitle: {
    marginBottom: '0.25rem',
    color: 'var(--primary)',
  },
  timestamp: {
    fontSize: '0.875rem',
    color: 'var(--gray-500)',
    margin: 0,
  },
  deleteButton: {
    background: colors.malignantBg,
    border: 'none',
    color: colors.malignantText,
    borderRadius: '0.375rem',
    padding: '0.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.125rem',
    transition: 'all 0.3s ease',
  },
  resultSection: {
    borderTop: '1px solid var(--gray-200)',
    paddingTop: '1rem',
  },
  riskResult: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '0.75rem',
  },
  riskBadge: {
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    fontWeight: '600',
    fontSize: '0.875rem',
  },
  scoreText: {
    color: 'var(--gray-600)',
    fontSize: '0.875rem',
  },
  factorsSection: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: 'var(--gray-50)',
    borderRadius: '0.375rem',
  },
  factorsList: {
    paddingLeft: '1.25rem',
    margin: '0.5rem 0 0 0',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '0.5rem',
    listStyle: 'none',
    paddingLeft: 0,
  },
  factorsList: {
    margin: '0.5rem 0 0 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    fontSize: '0.875rem',
    color: 'var(--gray-600)',
  },
  classificationsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '0.75rem',
    marginTop: '1rem',
  },
  classificationItem: {
    padding: '0.75rem',
    borderRadius: '0.375rem',
    textAlign: 'center',
  },
};
