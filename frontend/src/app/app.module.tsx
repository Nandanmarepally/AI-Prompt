import { useNavigate, NavLink } from 'react-router-dom';
import AppRouting from './app-routing.module';

/**
 * AppModule — root application shell.
 * Contains the sticky navbar and delegates page rendering to AppRouting.
 * Mirrors the role of Angular's AppModule + AppComponent.
 */
export default function AppModule() {
  const navigate = useNavigate();

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
            <button
              id="nav-new-prompt"
              className="btn nav-btn"
              onClick={() => navigate('/add-prompt')}
            >
              <span>＋</span> New Prompt
            </button>
          </div>
        </div>
      </nav>

      {/* ── Page content rendered by router ── */}
      <main>
        <AppRouting />
      </main>
    </>
  );
}
