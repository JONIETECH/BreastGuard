import { Link } from 'react-router-dom';
import Button from '../components/Button';
import styles from '../styles/AuthPage.module.css';

export default function SignupPage() {
  return (
    <section className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authTop}>
          <h1 className={styles.authTitle}>Create account</h1>
          <p className={styles.authSubtitle}>Set up your profile to access BreastGuard AI tools.</p>
        </div>

        <form className={styles.authForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="fullName">Full Name</label>
            <input className={styles.formInput} id="fullName" type="text" placeholder="Your full name" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="signupEmail">Email</label>
            <input className={styles.formInput} id="signupEmail" type="email" placeholder="you@example.com" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="signupPassword">Password</label>
            <input className={styles.formInput} id="signupPassword" type="password" placeholder="Create a password" />
          </div>

          <Button className={styles.authSubmit}>Sign Up</Button>

          <p className={styles.authSwitch}>
            Already have an account?{' '}
            <Link to="/login" className={styles.authSwitchLink}>Login</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
