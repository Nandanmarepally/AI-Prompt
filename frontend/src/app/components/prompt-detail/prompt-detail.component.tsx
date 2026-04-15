import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPrompt } from '../../services/prompt.service';
import type { Prompt } from '../../models/prompt.model';

function complexityBadge(c: number): { label: string; cls: string } {
  if (c <= 3) return { label: 'Low', cls: 'badge-low' };
  if (c <= 6) return { label: 'Mid', cls: 'badge-mid' };
  return { label: 'High', cls: 'badge-high' };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function PromptDetailComponent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchPrompt(Number(id))
      .then(setPrompt)
      .catch((err) => setError(err?.error ?? 'Failed to load prompt.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container">
        <div className="spinner-wrap">
          <div className="spinner" />
          <span>Loading prompt…</span>
        </div>
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="container">
        <div className="detail-page">
          <div className="error-banner">⚠ {error || 'Prompt not found.'}</div>
          <button className="btn btn-secondary" onClick={() => navigate('/prompts')}>
            ← Back to list
          </button>
        </div>
      </div>
    );
  }

  const { label, cls } = complexityBadge(prompt.complexity);

  return (
    <div className="container">
      <div className="detail-page">
        <div className="detail-back">
          <button id="back-to-list" className="btn btn-ghost" onClick={() => navigate('/prompts')}>
            ← Back to Library
          </button>
        </div>

        <div className="detail-card">
          <div className="detail-header">
            <h1 className="detail-title">{prompt.title}</h1>
            <div className="detail-meta-row">
              <span className={`badge ${cls}`}>
                Complexity {label} · {prompt.complexity}/10
              </span>
              <span className="detail-stat">
                <span className="stat-icon">📅</span>
                {formatDate(prompt.created_at)}
              </span>
              <span className="views-pill" id="view-count-display">
                👁 {prompt.view_count} {prompt.view_count === 1 ? 'view' : 'views'}
              </span>
            </div>
          </div>

          <div className="detail-divider" />

          <p className="detail-content-label">Prompt Content</p>
          <pre className="detail-content">{prompt.content}</pre>
        </div>
      </div>
    </div>
  );
}
