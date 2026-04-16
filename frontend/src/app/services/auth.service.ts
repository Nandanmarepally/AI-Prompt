// Centralised auth service — JWT stored in localStorage
const TOKEN_KEY = 'ai_prompt_token';
const USERNAME_KEY = 'ai_prompt_username';

const BASE_URL = '/api';

export interface LoginPayload { username: string; password: string; }
export interface LoginResponse { token: string; username: string; }

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
}

async function handleAuthResponse<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw body;
  return body as T;
}

// ── Login ─────────────────────────────────────────────────────
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await handleAuthResponse<LoginResponse>(res);
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USERNAME_KEY, data.username);
  return data;
}

// ── Signup ────────────────────────────────────────────────────
export async function signup(payload: SignupPayload): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/auth/signup/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await handleAuthResponse<LoginResponse>(res);
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USERNAME_KEY, data.username);
  return data;
}

// ── Forgot password ───────────────────────────────────────────
export async function forgotPassword(email: string): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/auth/forgot-password/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return handleAuthResponse<{ message: string }>(res);
}

// ── Reset password ────────────────────────────────────────────
export async function resetPassword(
  token: string,
  password: string,
  confirm_password: string,
): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/auth/reset-password/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password, confirm_password }),
  });
  return handleAuthResponse<{ message: string }>(res);
}

// ── Logout / session helpers ──────────────────────────────────
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUsername(): string | null {
  return localStorage.getItem(USERNAME_KEY);
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem(TOKEN_KEY);
}

/** Returns Authorization header object if logged in, otherwise empty. */
export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
