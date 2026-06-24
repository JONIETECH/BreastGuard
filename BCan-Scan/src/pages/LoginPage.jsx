import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { login } from '../services/authApi';
import { useAuthStore } from '../store/authStore';
import styles from '../styles/AuthPage.module.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await login(form);
      setUser(data.user);
      navigate('/assistant', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authTop}>
          <h1 className={styles.authTitle}>Welcome back</h1>
          <p className={styles.authSubtitle}>Sign in to continue using BreastGuard AI.</p>
        </div>

        <form className={styles.authForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="email">Email</label>
            <input
              className={styles.formInput}
              id="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="password">Password</label>
            <input
              className={styles.formInput}
              id="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
            />
          </div>

          {error && <p className={styles.authError}>{error}</p>}

          <Button className={styles.authSubmit} disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </Button>

          <p className={styles.authSwitch}>
            Don&apos;t have an account?{' '}
            <Link to="/signup" className={styles.authSwitchLink}>Create one</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
