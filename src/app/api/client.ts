// In local dev: VITE_API_URL is blank → uses Vite proxy (/api → http://localhost:5000)
// On Render (static site): VITE_API_URL is set to the backend service URL
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

export type ApiError = { error?: string };

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<T> {
  const { headers, timeoutMs = 8000, ...rest } = options;
  const controller = new AbortController();
  const t = window.setTimeout(() => controller.abort(), timeoutMs);
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    credentials: 'include',
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {})
    }
  });

  window.clearTimeout(t);
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};

  if (!res.ok) {
    if (res.status === 403 && json?.error === 'You are suspended from administration') {
      window.location.reload(); // Instantly reloads, failing session check and kicking user to landing
    }
    throw new Error((json && json.error) || `Request failed (${res.status})`);
  }
  return json as T;
}

