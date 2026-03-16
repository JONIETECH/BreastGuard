import Card from '../components/Card';
import { FiUsers, FiUser } from 'react-icons/fi';

export default function AboutPage() {
  const team = [
    {
      name: 'Karungi Maria Daphine',
      email: 'daphinewanyama@gmail.com',
    },
    {
      name: 'Apio Diane',
      email: 'apiodianne@gmail.com',
    },
    {
      name: 'Rwothomio Jonathan',
      email: 'jonahbst@gmail.com',
    },
    {
      name: 'Mutsaka Emmason',
      email: 'mutsakaemmason@gmail.com',
    },
  ];

  return (
    <div style={styles.container}>
      <h1>About BreastGuard AI</h1>

      {/* Main Description */}
      <Card highlight={true} style={{ marginBottom: '2rem' }}>
        <h2>AI-Powered Breast Cancer Screening Support</h2>
        <p>
          BreastGuard AI is a final year Computer Science project developed at Makerere University,
          College of Computing and Information Sciences. It demonstrates the application of AI and
          machine learning in healthcare, specifically for breast cancer screening and early detection.
        </p>
      </Card>

      {/* Mission */}
      <p style={styles.missionParagraph}>
        <strong>Our Mission:</strong> BreastGuard AI aims to provide accessible screening tools for diverse populations, support clinicians with evidence-based AI predictions, enable early detection through sophisticated image analysis, and deliver personalized guidance through conversational AI. This project combines cutting-edge technology with healthcare applications to demonstrate the practical impact of AI in medical diagnosis and screening.
      </p>

      {/* Features */}
      <Card style={{ marginTop: '2rem' }} title="Key Features">
        <div style={styles.featuresGrid}>
          <div style={styles.featureItem}>
            <h4>1. Risk Assessment</h4>
            <p>
              Collect clinical risk factors including age, family history, reproductive history,
              and lifestyle factors to predict breast cancer risk.
            </p>
          </div>

          <div style={styles.featureItem}>
            <h4>2. Image Analysis</h4>
            <p>
              Upload histopathology images for AI-powered classification (benign/malignant) with
              confidence scores.
            </p>
          </div>

          <div style={styles.featureItem}>
            <h4>3. AI Assistant</h4>
            <p>
              Interactive chatbot providing medical information, screening guidance, and
              educational content about breast cancer.
            </p>
          </div>

          <div style={styles.featureItem}>
            <h4>4. Results Dashboard</h4>
            <p>
              Comprehensive view of all predictions and results with visual representations and
              detailed analysis.
            </p>
          </div>

          <div style={styles.featureItem}>
            <h4>5. History Tracking</h4>
            <p>
              Maintains a complete history of all screening sessions with timestamps and
              historical comparison capabilities.
            </p>
          </div>

          <div style={styles.featureItem}>
            <h4>6. PWA Support</h4>
            <p>
              Progressive Web App features enabling offline access and installation as a native
              application.
            </p>
          </div>
        </div>
      </Card>

      {/* Team Members */}
      <Card title="Project Team" style={{ marginTop: '2rem' }} icon={FiUsers}>
        <p style={{ marginBottom: '2rem' }}>
          Developed as a final year Computer Science project at Makerere University, College of Computing and Information Sciences by the following dedicated team members:
        </p>
        <div style={styles.teamGrid}>
          {team.map((member, idx) => (
            <div key={idx} style={styles.teamCard}>
              <div style={styles.teamAvatar}>
                <FiUser size={48} />
              </div>
              <p style={styles.teamName}>{member.name}</p>
              <a href={`mailto:${member.email}`} style={styles.teamEmail}>
                {member.email}
              </a>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  missionParagraph: {
    fontSize: '1rem',
    lineHeight: '1.8',
    color: 'var(--gray-700)',
    backgroundColor: 'rgba(15, 118, 110, 0.05)',
    padding: '1.5rem',
    borderRadius: '0.5rem',
    borderLeft: '4px solid var(--primary)',
    marginBottom: '2rem',
  },
  list: {
    paddingLeft: '1.5rem',
    lineHeight: '2',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  featureItem: {
    padding: '1.25rem',
    backgroundColor: 'rgba(15, 118, 110, 0.05)',
    borderRadius: '0.5rem',
    borderLeft: '4px solid var(--primary)',
  },
  teamGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.5rem',
  },
  teamCard: {
    padding: '1.75rem 1.25rem',
    backgroundColor: 'var(--gray-50)',
    borderRadius: '0.75rem',
    border: '1px solid var(--gray-200)',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  teamAvatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
    fontSize: '32px',
  },
  teamName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--gray-900)',
    marginBottom: '0.5rem',
  },
  teamEmail: {
    fontSize: '0.875rem',
    color: 'var(--primary)',
    textDecoration: 'none',
    transition: 'opacity 0.3s ease',
  },
};
