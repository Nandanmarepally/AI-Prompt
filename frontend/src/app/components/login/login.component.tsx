import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/auth.service';

interface Props {
  onLoginSuccess: (username: string) => void;
}

export default function LoginComponent({ onLoginSuccess }: Props) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('Both fields are required.');
      return;
    }
    setLoading(true);
    try {
      const data = await login({ username: username.trim(), password });
      onLoginSuccess(data.username);
      navigate('/prompts');
    } catch (err: unknown) {
      const e = err as { error?: string };
      setError(e?.error ?? 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="login-page">
        <div className="login-card">
          {/* Logo */}
          <div className="login-logo">
            <span className="logo-icon">✦</span>
          </div>
          <h1 className="login-title">Welcome back</h1>
          <p className="login-subtitle">Sign in to manage your AI Prompt Library</p>

          {error && <div className="error-banner">⚠ {error}</div>}

          <form id="login-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="login-username">Username</label>
              <input
                id="login-username"
                type="text"
                className="form-input"
                placeholder="your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="btn btn-primary login-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Signing in…
                </>
              ) : (
                '→ Sign In'
              )}
            </button>
          </form>

          <p className="login-hint">
            Don't have an account?{' '}
            <span style={{ color: 'var(--text-muted)' }}>
              Ask an admin to create one via Django admin panel.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
