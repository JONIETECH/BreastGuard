import { Link } from 'react-router-dom';
import { FiActivity, FiImage, FiMessageCircle } from 'react-icons/fi';
import Button from '../components/Button';
import heroBg from '../assets/bg1.webp';
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
    <>
      {/* Hero Section */}
      <section className={styles.hero} style={{ backgroundImage: `url(${heroBg})` }}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <p className={styles.heroBadge}>Early Detection, Better Outcomes</p>
          <h1 className={styles.heroTitle}>BreastGuard AI</h1>
          <p className={styles.heroSubtitle}>AI-Powered Breast Cancer Screening Support</p>
          <div className={styles.ctaButtons}>
            <Link to="/risk-assessment" style={{ textDecoration: 'none' }}>
              <Button size="large" className={styles.assessmentBtn}>
                Start Assessment
              </Button>
            </Link>
            <Link to="/assistant" style={{ textDecoration: 'none' }}>
              <Button size="large" className={styles.assistantBtn}>
                Open Assistant
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className={styles.container}>
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
                        className={feature.highlight ? styles.highlightBtn : ''}
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
      </div>
    </>
  );
}
