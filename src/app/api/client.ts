// In local dev: VITE_API_URL is blank → uses Vite proxy (/api → http://localhost:5000)
// On Render (static site): VITE_API_URL is set to the backend service URL
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

export type ApiError = { error?: string };

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { timeoutMs?: number; noReloadOnSuspend?: boolean; isFormData?: boolean } = {}
): Promise<T> {
  const { headers, timeoutMs = 35000, noReloadOnSuspend = false, isFormData = false, ...rest } = options;
  const controller = new AbortController();
  const t = window.setTimeout(() => controller.abort(new Error('Request timed out after ' + timeoutMs + 'ms')), timeoutMs);

  const reqHeaders: HeadersInit = { ...headers };
  if (!isFormData) {
    (reqHeaders as any)['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    credentials: 'include',
    signal: controller.signal,
    headers: reqHeaders
  });

  window.clearTimeout(t);
  const text = await res.text();
  let json: any = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    // Server returned non-JSON (e.g. an HTML 404/500 page from Express)
    if (!res.ok) {
      throw new Error(`Server error (${res.status}) — unexpected non-JSON response`);
    }
  }

  if (!res.ok) {
    // Only auto-reload on 403 "suspended" for already-authenticated routes,
    // NOT on the login/register endpoints (noReloadOnSuspend = true there)
    if (
      res.status === 403 &&
      json?.error?.includes('suspended') &&
      !noReloadOnSuspend
    ) {
      // Clear localStorage so the user lands on the landing page after reload
      try { localStorage.removeItem('zm_authed'); localStorage.removeItem('zm_admin'); } catch { }
      window.location.reload();
    }
    throw new Error((json && json.error) || `Request failed (${res.status})`);
  }
  return json as T;
}
