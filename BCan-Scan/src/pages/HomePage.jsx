import { Link } from 'react-router-dom';
import { FiImage, FiMessageCircle } from 'react-icons/fi';
import Button from '../components/Button';
import heroBgDesktop from '../assets/bg1.webp';
import heroBgMobile from '../assets/bg1.jpg';
import mockupImg from '../assets/mobile-mockup.png';
import appleStoreImg from '../assets/applestore.svg';
import googlePlayImg from '../assets/googleplay.svg';
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

      {/* Mobile App Section */}
      <section className={styles.downloadSection}>
        <div className={styles.downloadContainer}>
          <div className={styles.downloadContent}>
            <div className={styles.downloadImageContainer}>
              <img src={mockupImg} alt="BreastGuard AI Mobile App" className={styles.mockupImage} />
            </div>
            <div className={styles.downloadText}>
              <h2 className={styles.downloadTitle}>BreastGuard AI in your pocket</h2>
              <p className={styles.downloadDescription}>
                Download the BreastGuard AI mobile app to track your history, perform rapid AI assessments on the go, and receive push notifications for clinical updates.
              </p>
              <div className={styles.downloadButtons}>
                <a href="https://apkpure.com/p/com.bcanscan.jonietech" className={styles.storeLink}>
                  <img src={appleStoreImg} alt="Download on the App Store" className={styles.storeImg} />
                </a>
                <a href="https://apkpure.com/p/com.bcanscan.jonietech" className={styles.storeLink}>
                  <img src={googlePlayImg} alt="Get it on Google Play" className={styles.storeImg} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
