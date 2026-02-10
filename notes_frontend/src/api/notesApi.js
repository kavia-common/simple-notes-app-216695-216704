/**
 * Notes API client.
 * Uses REACT_APP_API_BASE if provided, otherwise falls back to http://localhost:3001.
 */

const DEFAULT_BASE_URL = "http://localhost:3001";

function getApiBaseUrl() {
  // CRA exposes env vars prefixed with REACT_APP_
  const envBase = (process.env.REACT_APP_API_BASE || "").trim();
  return envBase || DEFAULT_BASE_URL;
}

async function parseJsonSafe(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function buildError(message, status, details) {
  const err = new Error(message);
  err.status = status;
  err.details = details;
  return err;
}

async function request(path, { method = "GET", body, signal } = {}) {
  const base = getApiBaseUrl().replace(/\/+$/, "");
  const url = `${base}${path}`;

  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal
  });

  const payload = await parseJsonSafe(res);

  if (!res.ok) {
    const msg =
      (payload && payload.detail && typeof payload.detail === "string" && payload.detail) ||
      `Request failed (${res.status})`;
    throw buildError(msg, res.status, payload);
  }

  return payload;
}

// PUBLIC_INTERFACE
export async function listNotes({ signal } = {}) {
  /** Fetch all notes. Returns an array of notes. */
  return request("/notes", { method: "GET", signal });
}

// PUBLIC_INTERFACE
export async function getNote(id, { signal } = {}) {
  /** Fetch a single note by id. */
  return request(`/notes/${encodeURIComponent(id)}`, { method: "GET", signal });
}

// PUBLIC_INTERFACE
export async function createNote({ title, content }, { signal } = {}) {
  /** Create a note. Expects {title, content}. */
  return request("/notes", { method: "POST", body: { title, content }, signal });
}

// PUBLIC_INTERFACE
export async function updateNote(id, { title, content }, { signal } = {}) {
  /** Update a note by id. Expects {title, content}. */
  return request(`/notes/${encodeURIComponent(id)}`, { method: "PUT", body: { title, content }, signal });
}

// PUBLIC_INTERFACE
export async function deleteNote(id, { signal } = {}) {
  /** Delete a note by id. */
  return request(`/notes/${encodeURIComponent(id)}`, { method: "DELETE", signal });
}
