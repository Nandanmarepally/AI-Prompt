import type { CreatePromptPayload, Prompt, PromptListItem } from '../models/prompt.model';
import { authHeaders } from './auth.service';

const BASE_URL = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw body;
  }
  return res.json() as Promise<T>;
}

/** GET /api/prompts/?tag=<name>  — fetch all prompts, optional tag filter */
export async function fetchPrompts(tag?: string): Promise<PromptListItem[]> {
  const query = tag ? `?tag=${encodeURIComponent(tag)}` : '';
  const res = await fetch(`${BASE_URL}/prompts/${query}`);
  return handleResponse<PromptListItem[]>(res);
}

/** GET /api/prompts/:id/ — fetch one prompt (increments Redis view counter) */
export async function fetchPrompt(id: number): Promise<Prompt> {
  const res = await fetch(`${BASE_URL}/prompts/${id}/`);
  return handleResponse<Prompt>(res);
}

/** POST /api/prompts/ — create a new prompt (requires JWT) */
export async function createPrompt(payload: CreatePromptPayload): Promise<Prompt> {
  const res = await fetch(`${BASE_URL}/prompts/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse<Prompt>(res);
}

/** GET /api/tags/ — fetch all tag names */
export async function fetchTags(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/tags/`);
  return handleResponse<string[]>(res);
}
