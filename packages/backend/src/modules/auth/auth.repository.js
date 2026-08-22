import supabase from '../../infrastructure/database/client.js';

export const upsertNonce = async (walletAddress, nonce, expiresAt) => {
  const { error } = await supabase
    .from('auth_nonces')
    .upsert({ wallet_address: walletAddress, nonce, expires_at: expiresAt, used: false });
  if (error) throw error;
};

export const getNonce = async (walletAddress) => {
  const { data, error } = await supabase
    .from('auth_nonces')
    .select('nonce, expires_at, used')
    .eq('wallet_address', walletAddress)
    .maybeSingle();
  if (error) throw error;
  return data; // null when no row found
};

export const markNonceUsed = async (walletAddress) => {
  const { error } = await supabase
    .from('auth_nonces')
    .update({ used: true })
    .eq('wallet_address', walletAddress);
  if (error) throw error;
};

export const upsertUser = async (walletAddress) => {
  const { error } = await supabase
    .from('users')
    .upsert({ wallet_address: walletAddress }, { onConflict: 'wallet_address', ignoreDuplicates: true });
  if (error) throw error;

  const { data, error: selectError } = await supabase
    .from('users')
    .select('id, wallet_address, created_at')
    .eq('wallet_address', walletAddress)
    .single();
  if (selectError) throw selectError;
  return data;
};
