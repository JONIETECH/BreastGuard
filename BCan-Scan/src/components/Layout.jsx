import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiMenu,
  FiX,
  FiHome,
  FiPieChart,
  FiMessageCircle,
  FiInfo,
  FiUser,
  FiLogOut,
} from 'react-icons/fi';
import styles from '../styles/Layout.module.css';
import fullLogo from '../assets/full-logo.webp';
import { useAuthStore } from '../store/authStore';
import { fetchMe, logout } from '../services/authApi';

export default function Layout({ children }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    let mounted = true;
    fetchMe()
      .then((data) => {
        if (mounted) setUser(data.user);
      })
      .catch(() => {
        if (mounted) clearUser();
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [setUser, clearUser, setLoading]);

  const isActive = (path) => location.pathname === path;

  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore network errors during logout
    }
    clearUser();
  };

  const navItems = [
    { path: '/', icon: FiHome, label: 'Home' },
    { path: '/assistant', icon: FiMessageCircle, label: 'Assistant', highlight: true },
    { path: '/results', icon: FiPieChart, label: 'Results' },
    { path: '/about', icon: FiInfo, label: 'About' },
  ];

  return (
    <div className={styles.layout}>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <h3 className={styles.sidebarTitle}>Navigation</h3>
          <button className={styles.closeSidebarBtn} onClick={closeSidebar} aria-label="Close menu">
            <FiX size={22} />
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.sidebarLink} ${isActive(item.path) ? styles.sidebarLinkActive : ''} ${item.highlight ? styles.sidebarLinkHighlight : ''}`}
              onClick={closeSidebar}
            >
              <item.icon className={styles.sidebarIcon} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {sidebarOpen && <div className={styles.overlay} onClick={closeSidebar}></div>}

      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <button
              className={styles.mobileMenuButton}
              onClick={toggleSidebar}
              title={sidebarOpen ? 'Close menu' : 'Open menu'}
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            >
              {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            <Link to="/" className={styles.logo} onClick={closeSidebar}>
              <img src={fullLogo} alt="BreastGuard AI" style={{ height: '32px' }} />
            </Link>
          </div>

          <div className={styles.authButtons}>
            {loading ? (
              <span className={styles.authLoading}>Loading...</span>
            ) : user ? (
              <div className={styles.userActions}>
                <span className={styles.userName}>
                  <FiUser size={18} />
                  <span>{user.fullName || user.email}</span>
                </span>
                <button className={styles.logoutBtn} onClick={handleLogout} aria-label="Logout">
                  <FiLogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className={styles.loginBtn}>
                  <span>Login</span>
                </Link>
                <Link to="/signup" className={styles.signupBtn}>
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>{children}</main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          {/* Brand */}
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <img src={fullLogo} alt="BreastGuard AI" style={{ height: '40px' }} />
            </div>
            <p className={styles.footerTagline}>
              AI-powered breast cancer screening support for early detection
              and better patient outcomes.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={styles.footerSectionTitle}>Quick Links</h4>
            <ul className={styles.footerLinksList}>
              <li><Link to="/assistant" className={styles.footerLink}>AI Assistant</Link></li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h4 className={styles.footerSectionTitle}>Disclaimer</h4>
            <p className={styles.footerNoticeText}>
              This tool is for educational and demonstration purposes only.
              Always consult a qualified medical professional for medical advice
              and diagnosis.
            </p>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>© 2026 BreastGuard &middot; Final Year Project. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
