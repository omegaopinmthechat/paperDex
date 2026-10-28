'use server';

import { cookies } from 'next/headers';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get('pd_token')?.value ?? null;
}

/**
 * List all API keys for the current user.
 * Returns { ok: true, data: ApiKey[] } or { ok: false, error: string }
 */
export async function listApiKeys() {
  const token = await getToken();
  if (!token) return { ok: false, error: 'Not authenticated' };

  try {
    const res  = await fetch(`${API}/api/v1/api-keys`, {
      cache: 'no-store',
      headers: authHeaders(token),
    });
    const json = await res.json();
    if (!json.success) return { ok: false, error: json.error?.message ?? 'Failed to load keys' };
    return { ok: true, data: json.data };
  } catch (err) {
    return { ok: false, error: `Network error: ${err.message}` };
  }
}

/**
 * Create a new API key.
 * Body: { name: string, scope: 'READ_ONLY'|'TRADE', expiresIn: '7d'|'30d'|'180d'|'never' }
 * Returns { ok: true, data: { id, name, scope, expiresAt, createdAt, secret } }
 * The `secret` field is present ONLY in this response — it is never returned again.
 */
export async function createApiKey({ name, scope, expiresIn }) {
  const token = await getToken();
  if (!token) return { ok: false, error: 'Not authenticated' };

  try {
    const res  = await fetch(`${API}/api/v1/api-keys`, {
      method: 'POST',
      cache: 'no-store',
      headers: authHeaders(token),
      body: JSON.stringify({ name, scope, expiresIn }),
    });
    const json = await res.json();
    if (!json.success) return { ok: false, error: json.error?.message ?? 'Failed to create key' };
    return { ok: true, data: json.data };
  } catch (err) {
    return { ok: false, error: `Network error: ${err.message}` };
  }
}

/**
 * Revoke an API key by ID.
 * Returns { ok: true } or { ok: false, error: string }
 */
export async function revokeApiKey(keyId) {
  const token = await getToken();
  if (!token) return { ok: false, error: 'Not authenticated' };

  try {
    const res  = await fetch(`${API}/api/v1/api-keys/${keyId}`, {
      method: 'DELETE',
      cache: 'no-store',
      headers: authHeaders(token),
    });
    const json = await res.json();
    if (!json.success) return { ok: false, error: json.error?.message ?? 'Failed to revoke key' };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: `Network error: ${err.message}` };
  }
}
