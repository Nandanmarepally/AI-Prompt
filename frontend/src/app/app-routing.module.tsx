import { Routes, Route, Navigate } from 'react-router-dom';
import PromptListComponent     from './components/prompt-list/prompt-list.component';
import PromptDetailComponent   from './components/prompt-detail/prompt-detail.component';
import AddPromptComponent      from './components/add-prompt/add-prompt.component';
import LoginComponent          from './components/login/login.component';
import SignupComponent         from './components/signup/signup.component';
import ForgotPasswordComponent from './components/forgot-password/forgot-password.component';
import ResetPasswordComponent  from './components/reset-password/reset-password.component';

interface Props {
  isAuthenticated: boolean;
  onLoginSuccess: (username: string) => void;
}

/**
 * AppRouting — full route map.
 *
 * Public (no auth required):
 *   /login              → Login page
 *   /signup             → Signup page
 *   /forgot-password    → Forgot password page
 *   /reset-password     → Reset password page (token in query param)
 *
 * Protected (redirect to /login if not authenticated):
 *   /prompts            → Prompt list
 *   /prompts/:id        → Prompt detail
 *   /add-prompt         → Create prompt
 *
 *   /  → redirect to /prompts (which then redirects to /login if not authed)
 */
export default function AppRouting({ isAuthenticated, onLoginSuccess }: Props) {
  return (
    <Routes>
      {/* ── Public auth pages ── */}
      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to="/prompts" replace />
            : <LoginComponent onLoginSuccess={onLoginSuccess} />
        }
      />
      <Route
        path="/signup"
        element={
          isAuthenticated
            ? <Navigate to="/prompts" replace />
            : <SignupComponent onLoginSuccess={onLoginSuccess} />
        }
      />
      <Route
        path="/forgot-password"
        element={<ForgotPasswordComponent />}
      />
      <Route
        path="/reset-password"
        element={<ResetPasswordComponent />}
      />

      {/* ── Root redirect ── */}
      <Route
        path="/"
        element={<Navigate to="/prompts" replace />}
      />

      {/* ── Protected pages ── */}
      <Route
        path="/prompts"
        element={
          isAuthenticated
            ? <PromptListComponent />
            : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/prompts/:id"
        element={
          isAuthenticated
            ? <PromptDetailComponent />
            : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/add-prompt"
        element={
          isAuthenticated
            ? <AddPromptComponent />
            : <Navigate to="/login" replace />
        }
      />

      {/* ── Catch-all ── */}
      <Route path="*" element={<Navigate to="/prompts" replace />} />
    </Routes>
  );
}
