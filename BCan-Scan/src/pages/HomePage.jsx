import { Link } from 'react-router-dom';
import { FiImage, FiMessageCircle } from 'react-icons/fi';
import Button from '../components/Button';
import heroBgDesktop from '../assets/bg1.webp';
import heroBgMobile from '../assets/bg1.jpg';
import styles from '../styles/HomePage.module.css';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section
        className={styles.hero}
        style={{
          '--hero-bg-desktop': `url(${heroBgDesktop})`,
          '--hero-bg-mobile': `url(${heroBgMobile})`,
        }}
      >
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <p className={styles.heroBadge}>Early Detection, Better Outcomes</p>
          <h1 className={styles.heroTitle}>BreastGuard AI</h1>
          <p className={styles.heroSubtitle}>Unified clinical case assistant for breast cancer screening support</p>
          <div className={styles.ctaButtons}>
            <Link to="/assistant" style={{ textDecoration: 'none' }}>
              <Button size="large" className={styles.assistantBtn}>
                Launch Assistant
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
