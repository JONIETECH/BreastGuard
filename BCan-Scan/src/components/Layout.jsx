import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiActivity,
  FiImage,
  FiPieChart,
  FiMessageCircle,
  FiClock,
  FiInfo,
  FiMenu,
  FiX,
} from 'react-icons/fi';
import styles from '../styles/Layout.module.css';

export default function Layout({ children }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const closeMenu = () => setMenuOpen(false);

  const navItems = [
    { path: '/', icon: FiHome, label: 'Home' },
    { path: '/risk-assessment', icon: FiActivity, label: 'Assessment' },
    { path: '/image-upload', icon: FiImage, label: 'Upload' },
    { path: '/assistant', icon: FiMessageCircle, label: 'Assistant', highlight: true },
    { path: '/results', icon: FiPieChart, label: 'Results' },
    { path: '/history', icon: FiClock, label: 'History' },
    { path: '/about', icon: FiInfo, label: 'About' },
  ];

  return (
    <div className={styles.layout}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link to="/" className={styles.logo} onClick={closeMenu}>
            <span className={styles.logoIcon}>
              <FiActivity />
            </span>
            <span className={styles.logoText}>BreastGuard</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.navDesktop}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${styles.navLink} ${isActive(item.path) ? styles.navLinkActive : ''} ${item.highlight ? styles.navLinkHighlight : ''}`}
              >
                <item.icon />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className={styles.mobileMenuButton}
            onClick={() => setMenuOpen(!menuOpen)}
            title={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <nav className={styles.navMobile}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${styles.navLinkMobile} ${isActive(item.path) ? styles.navLinkMobileActive : ''} ${item.highlight ? styles.navLinkMobileHighlight : ''}`}
                onClick={closeMenu}
              >
                <item.icon />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className={styles.main}>{children}</main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>
            BCan Scan - Conversational Retrieval-Augmented AI Assistant for
            Breast Cancer Screening
          </p>
          <p className={styles.footerCopy}>
            © 2024 Final Year Project. All rights reserved.
          </p>
          <p className={styles.footerCopy}>
            For educational and demonstration purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}
