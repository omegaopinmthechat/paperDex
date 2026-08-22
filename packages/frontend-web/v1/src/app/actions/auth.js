'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchNonce(walletAddress) {
  const res = await fetch(`${API}/api/v1/auth/nonce`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Failed to get nonce');
  return json.data; // { nonce, message }
}

export async function loginWithSignature(walletAddress, signature) {
  const res = await fetch(`${API}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress, signature }),
  });
  const json = await res.json();

  console.log('LOGIN STATUS:', res.status);
  console.log('LOGIN RESPONSE:', JSON.stringify(json, null, 2));

  if (!json.success) {
    throw new Error(json.error?.message || 'Login failed');
  }
  const { token, user } = json.data;
  const cookieStore = await cookies();
  cookieStore.set('pd_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  cookieStore.set('pd_wallet', user.wallet_address, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('pd_token');
  cookieStore.delete('pd_wallet');
  redirect('/');
}
