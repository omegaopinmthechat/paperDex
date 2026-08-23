import supabase from '../../infrastructure/database/client.js';

export const findByWalletAddress = async (walletAddress) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, wallet_address, created_at')
    .eq('wallet_address', walletAddress)
    .maybeSingle();
  if (error) throw error;
  return data;
};
