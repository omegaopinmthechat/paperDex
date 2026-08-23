import supabase from '../../infrastructure/database/client.js';

export const insertTransaction = async ({ userId, txHash, type, token, direction, amount, status, blockNumber }) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      tx_hash: txHash,
      type,
      token,
      direction,
      amount,
      status,
      block_number: blockNumber,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};
