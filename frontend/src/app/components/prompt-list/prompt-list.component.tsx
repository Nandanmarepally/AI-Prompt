import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPrompts } from '../../services/prompt.service';
import type { PromptListItem } from '../../models/prompt.model';

function complexityBadge(c: number): { label: string; cls: string } {
  if (c <= 3) return { label: 'Low', cls: 'badge-low' };
  if (c <= 6) return { label: 'Mid', cls: 'badge-mid' };
  return { label: 'High', cls: 'badge-high' };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function PromptListComponent() {
  const [prompts, setPrompts] = useState<PromptListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrompts()
      .then(setPrompts)
      .catch(() => setError('Failed to load prompts. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container">
        <div className="spinner-wrap">
          <div className="spinner" />
          <span>Loading prompts…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="page-header">
        <h1>AI Prompt Library</h1>
        <p>Discover and manage your collection of AI image generation prompts</p>
      </header>

      {error && <div className="error-banner">⚠ {error}</div>}

      {!error && prompts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No prompts yet</h3>
          <p>Click "New Prompt" in the navbar to add your first one.</p>
        </div>
      ) : (
        <div className="prompt-grid">
          {prompts.map((p) => {
            const { label, cls } = complexityBadge(p.complexity);
            return (
              <button
                key={p.id}
                id={`prompt-card-${p.id}`}
                className="card prompt-card"
                onClick={() => navigate(`/prompts/${p.id}`)}
                aria-label={`View prompt: ${p.title}`}
              >
                <div className="prompt-card-header">
                  <span className="prompt-card-title">{p.title}</span>
                  <span className={`badge ${cls}`}>{label} &nbsp;{p.complexity}</span>
                </div>
                <div className="prompt-card-meta">
                  <span>{formatDate(p.created_at)}</span>
                  <span className="prompt-card-views">
                    <span className="view-icon">👁</span>
                    {p.view_count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
