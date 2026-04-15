import { Routes, Route } from 'react-router-dom';
import PromptListComponent from './components/prompt-list/prompt-list.component';
import PromptDetailComponent from './components/prompt-detail/prompt-detail.component';
import AddPromptComponent from './components/add-prompt/add-prompt.component';

/**
 * AppRouting — defines all application routes.
 *
 * /              → redirect to /prompts
 * /prompts       → PromptList
 * /prompts/:id   → PromptDetail
 * /add-prompt    → AddPrompt form
 */
export default function AppRouting() {
  return (
    <Routes>
      <Route path="/" element={<PromptListComponent />} />
      <Route path="/prompts" element={<PromptListComponent />} />
      <Route path="/prompts/:id" element={<PromptDetailComponent />} />
      <Route path="/add-prompt" element={<AddPromptComponent />} />
      {/* Catch-all fallback */}
      <Route path="*" element={<PromptListComponent />} />
    </Routes>
  );
}
