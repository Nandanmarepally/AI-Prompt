import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPrompt } from '../../services/prompt.service';
import type { CreatePromptPayload } from '../../models/prompt.model';

interface FormErrors {
  title?: string;
  content?: string;
  complexity?: string;
  general?: string;
}

interface FormTouched {
  title: boolean;
  content: boolean;
  complexity: boolean;
}

function validate(values: CreatePromptPayload): FormErrors {
  const errors: FormErrors = {};
  if (!values.title.trim()) {
    errors.title = 'Title is required.';
  } else if (values.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters.';
  } else if (values.title.length > 255) {
    errors.title = 'Title must be 255 characters or fewer.';
  }
  if (!values.content.trim()) {
    errors.content = 'Content is required.';
  } else if (values.content.trim().length < 20) {
    errors.content = 'Content must be at least 20 characters.';
  }
  if (values.complexity < 1 || values.complexity > 10) {
    errors.complexity = 'Complexity must be between 1 and 10.';
  }
  return errors;
}

export default function AddPromptComponent() {
  const navigate = useNavigate();

  const [values, setValues] = useState<CreatePromptPayload>({
    title: '',
    content: '',
    complexity: 5,
  });
  const [touched, setTouched] = useState<FormTouched>({
    title: false,
    content: false,
    complexity: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [serverErrors, setServerErrors] = useState<FormErrors>({});

  const errors = validate(values);
  const isValid = Object.keys(errors).length === 0;

  function touch(field: keyof FormTouched) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function getError(field: keyof FormErrors): string | undefined {
    return touched[field as keyof FormTouched]
      ? (serverErrors[field] ?? errors[field])
      : undefined;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ title: true, content: true, complexity: true });
    if (!isValid) return;

    setSubmitting(true);
    setServerErrors({});
    try {
      await createPrompt({
        title: values.title.trim(),
        content: values.content.trim(),
        complexity: values.complexity,
      });
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        navigate('/prompts');
      }, 2800);
    } catch (err: unknown) {
      const apiErr = err as { errors?: Record<string, string>; error?: string };
      if (apiErr?.errors) {
        setServerErrors(apiErr.errors as FormErrors);
      } else {
        setServerErrors({ general: apiErr?.error ?? 'Something went wrong. Please try again.' });
      }
    } finally {
      setSubmitting(false);
    }
  }

  function complexityColor(v: number) {
    if (v <= 3) return 'var(--complexity-low)';
    if (v <= 6) return 'var(--complexity-mid)';
    return 'var(--complexity-high)';
  }

  return (
    <div className="container">
      <div className="add-page">
        <div className="detail-back">
          <button id="back-from-add" className="btn btn-ghost" onClick={() => navigate('/prompts')}>
            ← Back to Library
          </button>
        </div>

        <div className="add-card">
          <h2>Create New Prompt</h2>
          <p className="subtitle">
            Add a new AI image generation prompt to your library
          </p>

          {serverErrors.general && (
            <div className="error-banner">⚠ {serverErrors.general}</div>
          )}

          <form id="add-prompt-form" onSubmit={handleSubmit} noValidate>
            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="field-title">
                Title <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="field-title"
                type="text"
                className={`form-input${getError('title') ? ' error' : ''}`}
                placeholder="e.g. Neon Cyberpunk City at Night"
                value={values.title}
                onChange={(e) => setValues({ ...values, title: e.target.value })}
                onBlur={() => touch('title')}
                maxLength={255}
              />
              {getError('title') ? (
                <span className="form-error">⚠ {getError('title')}</span>
              ) : (
                <span className="form-hint">Minimum 3 characters</span>
              )}
            </div>

            {/* Content */}
            <div className="form-group">
              <label className="form-label" htmlFor="field-content">
                Prompt Content <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <textarea
                id="field-content"
                className={`form-textarea${getError('content') ? ' error' : ''}`}
                placeholder="Describe your prompt in detail — style, mood, colors, subjects…"
                value={values.content}
                onChange={(e) => setValues({ ...values, content: e.target.value })}
                onBlur={() => touch('content')}
              />
              {getError('content') ? (
                <span className="form-error">⚠ {getError('content')}</span>
              ) : (
                <span className="form-hint">
                  Minimum 20 characters · {values.content.length} typed
                </span>
              )}
            </div>

            {/* Complexity */}
            <div className="form-group">
              <label className="form-label" htmlFor="field-complexity">
                Complexity <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div className="range-wrapper">
                <div className="range-row">
                  <input
                    id="field-complexity"
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={values.complexity}
                    onChange={(e) =>
                      setValues({ ...values, complexity: Number(e.target.value) })
                    }
                    onBlur={() => touch('complexity')}
                    style={{
                      accentColor: complexityColor(values.complexity),
                    }}
                  />
                  <span
                    className="range-value"
                    style={{ color: complexityColor(values.complexity) }}
                  >
                    {values.complexity}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span>Simple (1)</span>
                  <span>Complex (10)</span>
                </div>
              </div>
              {getError('complexity') && (
                <span className="form-error">⚠ {getError('complexity')}</span>
              )}
            </div>

            {/* Actions */}
            <div className="form-actions">
              <button
                id="submit-prompt-btn"
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    Saving…
                  </>
                ) : (
                  '✓ Save Prompt'
                )}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/prompts')}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {showToast && (
        <div className="toast" role="status" aria-live="polite">
          ✓ Prompt saved! Redirecting…
        </div>
      )}
    </div>
  );
}
