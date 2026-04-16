import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../../services/auth.service';

interface FormErrors {
  password?: string;
  confirm_password?: string;
  general?: string;
}

export default function ResetPasswordComponent() {
  const [searchParams]   = useSearchParams();
  const navigate         = useNavigate();
  const token            = searchParams.get('token') ?? '';

  const [password, setPassword]           = useState('');
  const [confirm, setConfirm]             = useState('');
  const [touched, setTouched]             = useState({ password: false, confirm: false });
  const [serverErrors, setServerErrors]   = useState<FormErrors>({});
  const [loading, setLoading]             = useState(false);
  const [success, setSuccess]             = useState('');

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!password)            e.password = 'New password is required.';
    else if (password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (!confirm)             e.confirm_password = 'Please confirm your new password.';
    else if (confirm !== password) e.confirm_password = 'Passwords do not match.';
    return e;
  }

  const errors  = validate();
  const isValid = Object.keys(errors).length === 0;

  function fieldError(field: 'password' | 'confirm'): string | undefined {
    const key = field === 'confirm' ? 'confirm_password' : 'password';
    return touched[field] ? (serverErrors[key] ?? errors[key]) : undefined;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ password: true, confirm: true });
    if (!isValid) return;

    setLoading(true);
    setServerErrors({});
    try {
      const data = await resetPassword(token, password, confirm);
      setSuccess(data.message);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: unknown) {
      const apiErr = err as { errors?: FormErrors; error?: string };
      if (apiErr?.errors) setServerErrors(apiErr.errors);
      else setServerErrors({ general: apiErr?.error ?? 'Reset failed. The link may have expired.' });
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="container">
        <div className="login-page">
          <div className="login-card">
            <div className="error-banner">⚠ Invalid reset link. Please request a new one.</div>
            <p className="login-hint" style={{ marginTop: '1rem' }}>
              <Link to="/forgot-password" style={{ color: 'var(--accent)' }}>Request new link</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo">
            <img src="/logo.png" alt="Prompt Library Logo" className="login-logo-img" />
          </div>
          <h1 className="login-title">Set New Password</h1>
          <p className="login-subtitle">Choose a strong password for your account.</p>

          {serverErrors.general && (
            <div className="error-banner">⚠ {serverErrors.general}</div>
          )}

          {success ? (
            <div className="success-banner">✓ {success} Redirecting to login…</div>
          ) : (
            <form id="reset-password-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="reset-password">New Password</label>
                <input
                  id="reset-password"
                  type="password"
                  className={`form-input${fieldError('password') ? ' error' : ''}`}
                  placeholder="at least 8 characters"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setServerErrors((p) => ({ ...p, password: undefined })); }}
                  onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                  autoComplete="new-password"
                  autoFocus
                />
                {fieldError('password') ? (
                  <span className="form-error">⚠ {fieldError('password')}</span>
                ) : (
                  <span className="form-hint">Minimum 8 characters</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reset-confirm">Confirm New Password</label>
                <input
                  id="reset-confirm"
                  type="password"
                  className={`form-input${fieldError('confirm') ? ' error' : ''}`}
                  placeholder="repeat your password"
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setServerErrors((p) => ({ ...p, confirm_password: undefined })); }}
                  onBlur={() => setTouched((p) => ({ ...p, confirm: true }))}
                  autoComplete="new-password"
                />
                {fieldError('confirm') && (
                  <span className="form-error">⚠ {fieldError('confirm')}</span>
                )}
              </div>

              <button
                id="reset-submit-btn"
                type="submit"
                className="btn btn-primary login-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    Saving…
                  </>
                ) : '→ Reset Password'}
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
