import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import AppRouting from './app-routing.module';
import { isAuthenticated, getUsername, logout } from './services/auth.service';

/**
 * AppModule — root application shell.
 * Manages auth state and renders navbar + routed pages.
 *
 * Navbar behaviour:
 *  - Not logged in  → shows  "Sign In"  and  "Sign Up"  only
 *  - Logged in      → shows  "Browse"  "New Prompt"  username  "Sign out"
 */
export default function AppModule() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(isAuthenticated);
  const [username, setUsername] = useState(getUsername);

  function handleLoginSuccess(name: string) {
    setAuthed(true);
    setUsername(name);
  }

  function handleLogout() {
    logout();
    setAuthed(false);
    setUsername(null);
    navigate('/login');
  }

  return (
    <>
      {/* ── Sticky glassmorphism Navbar ── */}
      <nav className="navbar">
        <div className="container navbar-inner">
          <NavLink to={authed ? '/prompts' : '/login'} className="navbar-logo">
            <img src="/logo.png" alt="AI Prompt Library" className="navbar-logo-img" />
            AI Prompt Library
          </NavLink>

          <div className="navbar-nav">
            {authed ? (
              /* ── Authenticated navbar ─────────────────────────── */
              <>
                <NavLink
                  to="/prompts"
                  id="nav-browse"
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                  Browse
                </NavLink>

                <button
                  id="nav-new-prompt"
                  className="btn nav-btn"
                  onClick={() => navigate('/add-prompt')}
                >
                  <span>＋</span> New Prompt
                </button>

                <div className="nav-user">
                  <span className="nav-username">👤 {username}</span>
                  <button
                    id="nav-logout"
                    className="btn btn-ghost nav-logout-btn"
                    onClick={handleLogout}
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              /* ── Guest navbar ─────────────────────────────────── */
              <>
                <button
                  id="nav-login"
                  className="btn btn-ghost nav-btn"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </button>
                <button
                  id="nav-signup"
                  className="btn nav-btn"
                  onClick={() => navigate('/signup')}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Page content ── */}
      <main>
        <AppRouting isAuthenticated={authed} onLoginSuccess={handleLoginSuccess} />
      </main>
    </>
  );
}
