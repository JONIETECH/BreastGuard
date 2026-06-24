import { useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';
import Card from '../components/Card';
import { colors } from '../utils/colors.js';
import { formatDate } from '../utils/helpers';
import { FiAlertCircle } from 'react-icons/fi';

export default function ResultsDashboardPage() {
  const { scans, loadScans, scansLoading } = useAppStore();
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    loadScans();
  }, [loadScans]);

  const sorted = [...scans].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const selected = sorted.find((s) => s.id === selectedId) || sorted[0];

  if (scansLoading) {
    return (
      <div style={styles.container}>
        <h1>Patient Results</h1>
        <p style={styles.subtitle}>Loading your scans...</p>
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <div style={styles.container}>
        <h1>Patient Results</h1>
        <Card highlight={true} style={{ textAlign: 'center', padding: '3rem' }}>
          <FiAlertCircle size={48} style={{ color: 'var(--warning)', marginBottom: '1rem' }} />
          <h3>No Results Yet</h3>
          <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem' }}>
            Run a case analysis in the Assistant to see results here.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>Patient Results</h1>
      <p style={styles.subtitle}>Select a scan to view the full report.</p>

      <div style={styles.layout}>
        <div style={styles.listColumn}>
          {sorted.map((scan) => (
            <button
              key={scan.id}
              onClick={() => setSelectedId(scan.id)}
              style={{
                ...styles.listItem,
                ...(selected?.id === scan.id ? styles.listItemActive : {}),
              }}
            >
              <div style={styles.listHeader}>
                <span style={styles.listTitle}>
                  {scan.patientNumber ? `Patient ${scan.patientNumber}` : 'Unnamed Patient'}
                </span>
                <span
                  style={{
                    ...styles.badge,
                    backgroundColor:
                      scan.classification === 'Malignant'
                        ? colors.malignantBg
                        : scan.classification === 'Benign'
                        ? colors.benignBg
                        : colors.riskMediumBg,
                    color:
                      scan.classification === 'Malignant'
                        ? colors.malignantText
                        : scan.classification === 'Benign'
                        ? colors.benignText
                        : colors.riskMediumText,
                  }}
                >
                  {scan.classification}
                </span>
              </div>
              <div style={styles.listMeta}>
                <span>{scan.createdAt ? formatDate(scan.createdAt) : 'Just now'}</span>
                <span style={styles.dot}>·</span>
                <span>{scan.confidence}% confidence</span>
              </div>
            </button>
          ))}
        </div>

        <div style={styles.detailColumn}>
          {selected ? (
            <Card>
              <div style={styles.detailHeader}>
                <div>
                  <h2 style={styles.detailTitle}>
                    {selected.patientNumber ? `Patient ${selected.patientNumber}` : 'Patient Result'}
                  </h2>
                  <p style={styles.detailMeta}>
                    {selected.createdAt ? formatDate(selected.createdAt) : 'Just now'} · {selected.confidence}% confidence
                  </p>
                </div>
                <span
                  style={{
                    ...styles.badge,
                    backgroundColor:
                      selected.classification === 'Malignant'
                        ? colors.malignantBg
                        : selected.classification === 'Benign'
                        ? colors.benignBg
                        : colors.riskMediumBg,
                    color:
                      selected.classification === 'Malignant'
                        ? colors.malignantText
                        : selected.classification === 'Benign'
                        ? colors.benignText
                        : colors.riskMediumText,
                  }}
                >
                  {selected.classification}
                </span>
              </div>

              <div style={styles.summaryGrid}>
                <div style={styles.summaryItem}>
                  <span style={styles.summaryLabel}>Prediction</span>
                  <strong>{selected.classification}</strong>
                </div>
                <div style={styles.summaryItem}>
                  <span style={styles.summaryLabel}>Signal</span>
                  <strong>{selected.level}</strong>
                </div>
                <div style={styles.summaryItem}>
                  <span style={styles.summaryLabel}>Score</span>
                  <strong>{selected.score}/100</strong>
                </div>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Clinical Report</h3>
                <p style={styles.reportText}>{selected.report}</p>
              </div>

              {selected.gradCamBase64 && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Grad-CAM Explanation</h3>
                  <img
                    src={`data:image/png;base64,${selected.gradCamBase64}`}
                    alt="Tissue attention map"
                    style={styles.attentionMap}
                  />
                  <p style={styles.caption}>
                    Red / Yellow = regions most influential in the AI decision.
                  </p>
                </div>
              )}
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  subtitle: {
    color: 'var(--gray-600)',
    marginBottom: '1.5rem',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.5rem',
    alignItems: 'start',
  },
  listColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  listItem: {
    width: '100%',
    textAlign: 'left',
    backgroundColor: 'white',
    border: '1px solid var(--gray-200)',
    borderRadius: '0.75rem',
    padding: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  listItemActive: {
    borderColor: 'var(--secondary)',
    boxShadow: '0 0 0 2px rgba(236, 72, 153, 0.15)',
  },
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.5rem',
  },
  listTitle: {
    fontWeight: 700,
    color: 'var(--gray-900)',
    fontSize: '0.95rem',
    minWidth: 0,
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
  },
  listMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
    color: 'var(--gray-500)',
  },
  dot: {
    fontWeight: 700,
  },
  badge: {
    padding: '0.35rem 0.75rem',
    borderRadius: '999px',
    fontWeight: 600,
    fontSize: '0.75rem',
    whiteSpace: 'nowrap',
  },
  detailColumn: {
    minWidth: 0,
    overflow: 'hidden',
  },
  detailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '1.25rem',
    flexWrap: 'wrap',
  },
  detailTitle: {
    margin: '0 0 0.25rem',
    color: 'var(--gray-900)',
    fontSize: '1.3rem',
    wordBreak: 'break-word',
  },
  detailMeta: {
    margin: 0,
    color: 'var(--gray-500)',
    fontSize: '0.875rem',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    padding: '0.75rem',
    backgroundColor: 'var(--gray-50)',
    borderRadius: '0.5rem',
    border: '1px solid var(--gray-200)',
  },
  summaryLabel: {
    fontSize: '0.8rem',
    color: 'var(--gray-500)',
  },
  section: {
    marginTop: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1rem',
    color: 'var(--primary)',
    marginBottom: '0.75rem',
  },
  reportText: {
    color: 'var(--gray-800)',
    lineHeight: 1.7,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
  },
  attentionMap: {
    width: '100%',
    borderRadius: '0.75rem',
    border: '1px solid var(--gray-200)',
  },
  caption: {
    fontSize: '0.8rem',
    color: 'var(--gray-500)',
    marginTop: '0.5rem',
  },
};
