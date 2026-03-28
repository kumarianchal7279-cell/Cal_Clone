import { useState } from 'react';
import { useRouter } from 'next/router';
import api from '../lib/api';
import styles from '../styles/auth.module.css';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      // Store token and user info
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect to dashboard
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Cal.com Clone</h1>
        <p className={styles.subtitle}>Sign In to Your Account</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="demo@example.com"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className={styles.divider}>or</p>

        <button
          type="button"
          className={styles.buttonSecondary}
          onClick={() => router.push('/signup')}
        >
          Create New Account
        </button>

        <div className={styles.demoBox}>
          <p className={styles.demoTitle}>Demo Credentials:</p>
          <p>Email: <strong>demo@example.com</strong></p>
          <p>Password: <strong>password123</strong></p>
        </div>
      </div>
    </div>
  );
}
