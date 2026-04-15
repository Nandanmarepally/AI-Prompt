import type { CreatePromptPayload, Prompt, PromptListItem } from '../models/prompt.model';

const BASE_URL = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw body;
  }
  return res.json() as Promise<T>;
}

/** GET /api/prompts/ — fetch all prompts */
export async function fetchPrompts(): Promise<PromptListItem[]> {
  const res = await fetch(`${BASE_URL}/prompts/`);
  return handleResponse<PromptListItem[]>(res);
}

/** GET /api/prompts/:id/ — fetch one prompt (increments Redis view counter) */
export async function fetchPrompt(id: number): Promise<Prompt> {
  const res = await fetch(`${BASE_URL}/prompts/${id}/`);
  return handleResponse<Prompt>(res);
}

/** POST /api/prompts/ — create a new prompt */
export async function createPrompt(payload: CreatePromptPayload): Promise<Prompt> {
  const res = await fetch(`${BASE_URL}/prompts/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<Prompt>(res);
}
