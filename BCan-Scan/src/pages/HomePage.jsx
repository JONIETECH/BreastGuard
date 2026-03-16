import { Link } from 'react-router-dom';
import { FiArrowRight, FiActivity, FiImage, FiMessageCircle } from 'react-icons/fi';
import Card from '../components/Card';
import Button from '../components/Button';
import styles from '../styles/HomePage.module.css';

export default function HomePage() {
  const features = [
    {
      icon: FiActivity,
      title: 'Risk Assessment',
      description:
        'Enter clinical risk factors and receive personalized risk predictions for breast cancer screening.',
      link: '/risk-assessment',
      highlight: false,
    },
    {
      icon: FiImage,
      title: 'Image Upload',
      description:
        'Upload histopathology images for AI-powered classification and analysis.',
      link: '/image-upload',
      highlight: false,
    },
    {
      icon: FiMessageCircle,
      title: 'AI Assistant',
      description:
        'Chat with our conversational AI assistant for medical information and screening guidance.',
      link: '/assistant',
      highlight: true,
    },
  ];

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          BreastGuard AI
        </h1>
        <p className={styles.heroSubtitle}>
          AI-Powered Breast Cancer Screening Support
        </p>
        <div className={styles.ctaButtons}>
          <Link to="/risk-assessment" style={{ textDecoration: 'none' }}>
            <Button size="large" icon={FiArrowRight}>
              Start Assessment
            </Button>
          </Link>
          <Link to="/assistant" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" size="large" icon={FiMessageCircle}>
              Open Assistant
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <h2 className={styles.sectionTitle}>Key Features</h2>
        <div className={styles.featuresGrid}>
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`${styles.featureCard} ${feature.highlight ? styles.featureCardHighlight : ''}`}
              >
                <div className={styles.featureIcon}>
                  <Icon size={48} />
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
                <div className={styles.featureFooter}>
                  <Link to={feature.link} style={{ textDecoration: 'none' }}>
                    <Button
                      variant={feature.highlight ? 'primary' : 'outline'}
                      size="small"
                    >
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Info Section */}
      <section className={styles.infoSection}>
        <div className={styles.infoCard}>
          <h2 className={styles.infoTitle}>Why BreastGuard AI?</h2>
          <p className={styles.infoParagraph}>
            Breast cancer is one of the most common cancers affecting women worldwide. Early
            detection significantly improves treatment outcomes and survival rates. BreastGuard AI is
            designed to:
          </p>
          <ul className={styles.infoList}>
            <li>Provide accessible screening tools for diverse populations</li>
            <li>Support clinicians with evidence-based AI predictions</li>
            <li>Enable early detection through sophisticated image analysis</li>
            <li>Deliver personalized guidance through conversational AI</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
