/**
 * API client — single source of truth for all HTTP calls.
 * Injects Bearer token, handles 401 globally, normalises errors.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const TOKEN_KEY = "bib_auth_token";

// ── Token storage ──────────────────────────────────────────────────────────
export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

// ── Core request ───────────────────────────────────────────────────────────
async function request(path, { body, headers: extra, signal, ...opts } = {}) {
  const token = tokenStorage.get();
  const isFormData = body instanceof FormData;

  const headers = {
    Accept: "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(!isFormData && body != null && { "Content-Type": "application/json" }),
    ...extra,
  };

  let response;
  try {
    response = await fetch(`${BASE_URL}/api${path}`, {
      ...opts,
      headers,
      signal,
      body: isFormData ? body : body != null ? JSON.stringify(body) : undefined,
    });
  } catch (cause) {
    if (cause?.name === "AbortError") throw cause;
    const err = new Error(
      "Impossible de joindre le serveur. Vérifiez votre connexion.",
    );
    err.status = 0;
    throw err;
  }

  // Session expired — broadcast to auth context
  if (response.status === 401) {
    tokenStorage.clear();
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    const err = new Error("Session expirée. Veuillez vous reconnecter.");
    err.status = 401;
    throw err;
  }

  if (response.status === 204) return null;

  let data = null;
  try {
    data = await response.json();
  } catch {
    /* no body */
  }

  if (!response.ok) {
    let msg = data?.message ?? `Erreur ${response.status}`;
    if (msg.includes('SQLSTATE') || msg.includes('PDOException')) {
      msg = 'Le service est temporairement indisponible (erreur serveur/base de données).';
    }
    const err = new Error(msg);
    err.status = response.status;
    err.errors = data?.errors ?? null;
    err.data = data;
    throw err;
  }

  return data;
}

// ── Public API ─────────────────────────────────────────────────────────────
export const api = {
  get(path, params, signal) {
    const filtered = params
      ? Object.fromEntries(
          Object.entries(params).filter(([, v]) => v != null && v !== ""),
        )
      : null;
    const qs =
      filtered && Object.keys(filtered).length
        ? "?" + new URLSearchParams(filtered)
        : "";
    return request(`${path}${qs}`, { signal });
  },
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};
