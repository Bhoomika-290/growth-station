export interface AuthUser {
  id: number;
  email: string;
  name: string;
  city?: string;
  domain?: string;
  college?: string;
  specialization?: string;
  dream_company?: string;
  score?: number;
  tasks_done?: number;
  streak?: number;
}

const TOKEN_KEY = 'station_token';
const USER_KEY = 'station_user';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function saveSession(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function removeToken() {
  clearSession();
}

async function apiFetch(path: string, opts: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(path, { ...opts, headers });
}

export async function signUp(email: string, password: string, name: string, domain?: string) {
  const res = await apiFetch('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, domain }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Sign up failed');
  saveSession(data.token, data.user);
  return data;
}

export async function signIn(email: string, password: string) {
  const res = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Sign in failed');
  saveSession(data.token, data.user);
  return data;
}

export async function fetchMe(): Promise<AuthUser | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await apiFetch('/api/auth/me');
    if (!res.ok) { clearSession(); return null; }
    const user = await res.json();
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  } catch {
    return null;
  }
}

export async function updateProfile(data: Partial<AuthUser>) {
  const res = await apiFetch('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  const updated = await res.json();
  if (!res.ok) throw new Error(updated.error || 'Update failed');
  localStorage.setItem(USER_KEY, JSON.stringify(updated));
  return updated;
}
