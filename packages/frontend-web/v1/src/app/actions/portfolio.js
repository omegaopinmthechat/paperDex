'use server';

import { cookies } from 'next/headers';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchPortfolio() {
  const cookieStore = await cookies();
  const token = cookieStore.get('pd_token')?.value;
  if (!token) return { success: false, error: 'Not authenticated', data: [] };

  try {
    const res = await fetch(`${API}/api/v1/portfolio`, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();
    if (!json.success) return { success: false, error: json.error?.message || 'Failed to fetch portfolio', data: [] };
    return { success: true, data: json.data };
  } catch (err) {
    return { success: false, error: err.message, data: [] };
  }
}
