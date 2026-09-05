'use server';

import { cookies } from 'next/headers';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Requests a signed EIP-712 quote from the backend.
 * Returns { ok: true, data } or { ok: false, error: string }
 * Never throws — error message always reaches the client component.
 */
export async function requestQuote({ token, side, amount }) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('pd_token')?.value;
  if (!authToken) return { ok: false, error: 'Not authenticated — please reconnect your wallet' };

  let res, json;
  try {
    res = await fetch(`${API}/api/v1/trade/quote`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ token, side, amount }),
    });
    json = await res.json();
  } catch (err) {
    return { ok: false, error: `Cannot reach backend (${err.message}) — is the server running?` };
  }

  if (!json.success) {
    return { ok: false, error: json.error?.message || `Request failed (HTTP ${res.status})` };
  }
  return { ok: true, data: json.data };
}

/**
 * Submits a user-signed trade for on-chain execution.
 * Returns { ok: true, data } or { ok: false, error: string }
 */
export async function submitTrade({ quoteId, userSignature }) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('pd_token')?.value;
  if (!authToken) return { ok: false, error: 'Not authenticated — please reconnect your wallet' };

  let res, json;
  try {
    res = await fetch(`${API}/api/v1/trade/execute`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ quoteId, userSignature }),
    });
    json = await res.json();
  } catch (err) {
    return { ok: false, error: `Cannot reach backend (${err.message})` };
  }

  if (!json.success) {
    return { ok: false, error: json.error?.message || `Execution failed (HTTP ${res.status})` };
  }
  return { ok: true, data: json.data };
}

/**
 * Fetches the authenticated user's trade history.
 * Returns { ok: true, data } or { ok: false, data: [] }
 */
export async function fetchTradeHistory() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('pd_token')?.value;
  if (!authToken) return { ok: false, data: [] };

  try {
    const res = await fetch(`${API}/api/v1/trade/history`, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });
    const json = await res.json();
    if (!json.success) return { ok: false, data: [] };
    return { ok: true, data: json.data };
  } catch {
    return { ok: false, data: [] };
  }
}

