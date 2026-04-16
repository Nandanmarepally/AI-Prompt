import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../../services/auth.service';

interface Props {
  onLoginSuccess: (username: string) => void;
}

interface FormValues {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirm_password?: string;
  general?: string;
}

function validate(v: FormValues): FormErrors {
  const e: FormErrors = {};
  if (!v.username.trim()) e.username = 'Username is required.';
  else if (v.username.trim().length < 3) e.username = 'Username must be at least 3 characters.';

  if (!v.email.trim()) e.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = 'Enter a valid email address.';

  if (!v.password) e.password = 'Password is required.';
  else if (v.password.length < 8) e.password = 'Password must be at least 8 characters.';

  if (!v.confirm_password) e.confirm_password = 'Please confirm your password.';
  else if (v.confirm_password !== v.password) e.confirm_password = 'Passwords do not match.';

  return e;
}

export default function SignupComponent({ onLoginSuccess }: Props) {
  const navigate = useNavigate();

  const [values, setValues] = useState<FormValues>({
    username: '', email: '', password: '', confirm_password: '',
  });
  const [touched, setTouched] = useState<Record<keyof FormValues, boolean>>({
    username: false, email: false, password: false, confirm_password: false,
  });
  const [serverErrors, setServerErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const errors = validate(values);
  const isValid = Object.keys(errors).length === 0;

  function touch(field: keyof FormValues) {
    setTouched((p) => ({ ...p, [field]: true }));
  }

  function fieldError(field: keyof FormValues): string | undefined {
    return touched[field] ? (serverErrors[field] ?? errors[field]) : undefined;
  }

  function set(field: keyof FormValues, val: string) {
    setValues((p) => ({ ...p, [field]: val }));
    setServerErrors((p) => ({ ...p, [field]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ username: true, email: true, password: true, confirm_password: true });
    if (!isValid) return;

    setLoading(true);
    setServerErrors({});
    try {
      const data = await signup(values);
      onLoginSuccess(data.username);
      navigate('/prompts');
    } catch (err: unknown) {
      const apiErr = err as { errors?: FormErrors; error?: string };
      if (apiErr?.errors) setServerErrors(apiErr.errors);
      else setServerErrors({ general: apiErr?.error ?? 'Signup failed. Please try again.' });
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
          <h1 className="login-title">Create account</h1>
          <p className="login-subtitle">Join the AI Prompt Library</p>

          {serverErrors.general && (
            <div className="error-banner">⚠ {serverErrors.general}</div>
          )}

          <form id="signup-form" onSubmit={handleSubmit} noValidate>
            {/* Username */}
            <div className="form-group">
              <label className="form-label" htmlFor="signup-username">Username</label>
              <input
                id="signup-username"
                type="text"
                className={`form-input${fieldError('username') ? ' error' : ''}`}
                placeholder="choose a username"
                value={values.username}
                onChange={(e) => set('username', e.target.value)}
                onBlur={() => touch('username')}
                autoComplete="username"
                autoFocus
              />
              {fieldError('username') && (
                <span className="form-error">⚠ {fieldError('username')}</span>
              )}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                className={`form-input${fieldError('email') ? ' error' : ''}`}
                placeholder="you@example.com"
                value={values.email}
                onChange={(e) => set('email', e.target.value)}
                onBlur={() => touch('email')}
                autoComplete="email"
              />
              {fieldError('email') && (
                <span className="form-error">⚠ {fieldError('email')}</span>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                className={`form-input${fieldError('password') ? ' error' : ''}`}
                placeholder="at least 8 characters"
                value={values.password}
                onChange={(e) => set('password', e.target.value)}
                onBlur={() => touch('password')}
                autoComplete="new-password"
              />
              {fieldError('password') ? (
                <span className="form-error">⚠ {fieldError('password')}</span>
              ) : (
                <span className="form-hint">Minimum 8 characters</span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="signup-confirm">Confirm Password</label>
              <input
                id="signup-confirm"
                type="password"
                className={`form-input${fieldError('confirm_password') ? ' error' : ''}`}
                placeholder="repeat your password"
                value={values.confirm_password}
                onChange={(e) => set('confirm_password', e.target.value)}
                onBlur={() => touch('confirm_password')}
                autoComplete="new-password"
              />
              {fieldError('confirm_password') && (
                <span className="form-error">⚠ {fieldError('confirm_password')}</span>
              )}
            </div>

            <button
              id="signup-submit-btn"
              type="submit"
              className="btn btn-primary login-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Creating account…
                </>
              ) : '→ Create Account'}
            </button>
          </form>

          <p className="login-hint">
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
