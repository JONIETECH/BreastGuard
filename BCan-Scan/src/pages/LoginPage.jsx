import { Link } from 'react-router-dom';
import Button from '../components/Button';
import styles from '../styles/AuthPage.module.css';

export default function LoginPage() {
  return (
    <section className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authTop}>
          <h1 className={styles.authTitle}>Welcome back</h1>
          <p className={styles.authSubtitle}>Sign in to continue using BreastGuard AI.</p>
        </div>

        <form className={styles.authForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="email">Email</label>
            <input className={styles.formInput} id="email" type="email" placeholder="you@example.com" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="password">Password</label>
            <input className={styles.formInput} id="password" type="password" placeholder="Enter your password" />
          </div>

          <Button className={styles.authSubmit}>Login</Button>

          <p className={styles.authSwitch}>
            Don&apos;t have an account?{' '}
            <Link to="/signup" className={styles.authSwitchLink}>Create one</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
