import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { signup } from '../services/authApi';
import { useAuthStore } from '../store/authStore';
import styles from '../styles/AuthPage.module.css';

export default function SignupPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await signup(form);
      setUser(data.user);
      navigate('/assistant', { replace: true });
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authTop}>
          <h1 className={styles.authTitle}>Create account</h1>
          <p className={styles.authSubtitle}>Set up your profile to access BreastGuard AI tools.</p>
        </div>

        <form className={styles.authForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="fullName">Full Name</label>
            <input
              className={styles.formInput}
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Your full name"
              value={form.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="signupEmail">Email</label>
            <input
              className={styles.formInput}
              id="signupEmail"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="signupPassword">Password</label>
            <input
              className={styles.formInput}
              id="signupPassword"
              name="password"
              type="password"
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
            />
          </div>

          {error && <p className={styles.authError}>{error}</p>}

          <Button className={styles.authSubmit} disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>

          <p className={styles.authSwitch}>
            Already have an account?{' '}
            <Link to="/login" className={styles.authSwitchLink}>Login</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
