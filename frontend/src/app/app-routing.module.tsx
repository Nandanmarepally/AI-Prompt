import { Routes, Route, Navigate } from 'react-router-dom';
import PromptListComponent  from './components/prompt-list/prompt-list.component';
import PromptDetailComponent from './components/prompt-detail/prompt-detail.component';
import AddPromptComponent   from './components/add-prompt/add-prompt.component';
import LoginComponent       from './components/login/login.component';

interface Props {
  isAuthenticated: boolean;
  onLoginSuccess: (username: string) => void;
}

/**
 * AppRouting — all application routes.
 * /login          → Login page
 * /               → redirect to /prompts
 * /prompts        → PromptList
 * /prompts/:id    → PromptDetail
 * /add-prompt     → AddPrompt (requires auth, redirects to /login otherwise)
 */
export default function AppRouting({ isAuthenticated, onLoginSuccess }: Props) {
  return (
    <Routes>
      <Route path="/login" element={<LoginComponent onLoginSuccess={onLoginSuccess} />} />
      <Route path="/"        element={<Navigate to="/prompts" replace />} />
      <Route path="/prompts" element={<PromptListComponent />} />
      <Route path="/prompts/:id" element={<PromptDetailComponent />} />
      <Route
        path="/add-prompt"
        element={
          isAuthenticated
            ? <AddPromptComponent />
            : <Navigate to="/login" replace />
        }
      />
      <Route path="*" element={<Navigate to="/prompts" replace />} />
    </Routes>
  );
}
