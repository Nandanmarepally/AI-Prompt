import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../services/auth.service';

export default function ForgotPasswordComponent() {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [fieldErr, setFieldErr] = useState('');

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  function getFieldError(): string | undefined {
    if (!touched) return undefined;
    if (!email.trim()) return 'Email is required.';
    if (!emailValid) return 'Enter a valid email address.';
    return fieldErr || undefined;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!email.trim() || !emailValid) return;

    setLoading(true);
    setError('');
    setSuccess('');
    setFieldErr('');
    try {
      const data = await forgotPassword(email.trim());
      setSuccess(data.message);
    } catch (err: unknown) {
      const apiErr = err as { errors?: { email?: string }; error?: string };
      if (apiErr?.errors?.email) setFieldErr(apiErr.errors.email);
      else setError(apiErr?.error ?? 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo">
            <img src="/logo.png" alt="AI Prompt Library" className="login-logo-img" />
          </div>
          <h1 className="login-title">Forgot Password</h1>
          <p className="login-subtitle">
            Enter your email and we'll send you a reset link.
          </p>

          {error && <div className="error-banner">⚠ {error}</div>}

          {success ? (
            <div className="success-banner">✓ {success}</div>
          ) : (
            <form id="forgot-password-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">Email address</label>
                <input
                  id="forgot-email"
                  type="email"
                  className={`form-input${getFieldError() ? ' error' : ''}`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErr(''); }}
                  onBlur={() => setTouched(true)}
                  autoComplete="email"
                  autoFocus
                />
                {getFieldError() && (
                  <span className="form-error">⚠ {getFieldError()}</span>
                )}
              </div>

              <button
                id="forgot-submit-btn"
                type="submit"
                className="btn btn-primary login-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    Sending…
                  </>
                ) : '→ Send Reset Link'}
              </button>
            </form>
          )}

          <p className="login-hint">
            <Link to="/login" style={{ color: 'var(--accent)' }}>← Back to Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
