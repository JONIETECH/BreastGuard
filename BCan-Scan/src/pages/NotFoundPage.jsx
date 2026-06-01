import { Link } from 'react-router-dom';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

export default function NotFoundPage() {
  return (
    <div style={styles.container}>
      <LoadingSpinner size={60} />
      <h1 style={styles.title}>404 - Page Not Found</h1>
      <p style={styles.text}>
        Oops! We couldn't find the page you're looking for
      </p>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <Button variant="primary" size="large">
          Return to Home
        </Button>
      </Link>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '70vh',
    textAlign: 'center',
    padding: '2rem',
  },
  title: {
    fontSize: '2.5rem',
    color: 'var(--primary)',
    marginTop: '1.5rem',
    marginBottom: '1rem',
    fontWeight: '700',
  },
  text: {
    fontSize: '1.1rem',
    color: 'var(--gray-600)',
    maxWidth: '500px',
    marginBottom: '2rem',
    lineHeight: '1.6',
  },
};
