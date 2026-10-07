/**
 * Autonomous and resilient API client for Wkly
 * Handles automatic demo session provisioning, token persistence, and 401 transparent retry.
 */

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

export async function ensureAuthToken(): Promise<string> {
  const existingToken = localStorage.getItem('token');
  if (existingToken) {
    return existingToken;
  }

  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await fetch('/api/users/demo-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('token', data.token);
          return data.token;
        }
      }
    } catch {
      // Fallback: try regular login
      try {
        const loginRes = await fetch('/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'rosa.athlete@stanford.edu', password: 'password123' }),
        });
        if (loginRes.ok) {
          const loginData = await loginRes.json();
          if (loginData.token) {
            localStorage.setItem('token', loginData.token);
            return loginData.token;
          }
        }
      } catch {}
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
    return '';
  })();

  return refreshPromise;
}

export async function authenticatedFetch(
  input: string | URL,
  init: RequestInit = {}
): Promise<Response> {
  let token = await ensureAuthToken();

  const headers = new Headers(init.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let res = await fetch(input, { ...init, headers });

  // If unauthorized (e.g. token expired after long inactivity), refresh token once and retry
  if (res.status === 401) {
    localStorage.removeItem('token');
    token = await ensureAuthToken();
    if (token) {
      const retryHeaders = new Headers(init.headers || {});
      retryHeaders.set('Authorization', `Bearer ${token}`);
      res = await fetch(input, { ...init, headers: retryHeaders });
    }
  }

  return res;
}
