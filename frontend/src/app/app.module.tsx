import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import AppRouting from './app-routing.module';
import { isAuthenticated, getUsername, logout } from './services/auth.service';

/**
 * AppModule — root application shell.
 * Manages auth state and renders navbar + routed pages.
 */
export default function AppModule() {
  const navigate = useNavigate();
  const [authed, setAuthed]     = useState(isAuthenticated);
  const [username, setUsername] = useState(getUsername);

  function handleLoginSuccess(name: string) {
    setAuthed(true);
    setUsername(name);
  }

  function handleLogout() {
    logout();
    setAuthed(false);
    setUsername(null);
    navigate('/prompts');
  }

  return (
    <>
      {/* ── Sticky glassmorphism Navbar ── */}
      <nav className="navbar">
        <div className="container navbar-inner">
          <NavLink to="/prompts" className="navbar-logo">
            <span className="logo-icon">✦</span>
            AI Prompt Library
          </NavLink>

          <div className="navbar-nav">
            <NavLink
              to="/prompts"
              id="nav-browse"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              Browse
            </NavLink>

            {authed ? (
              <>
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
              <button
                id="nav-login"
                className="btn nav-btn"
                onClick={() => navigate('/login')}
              >
                Sign In
              </button>
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
