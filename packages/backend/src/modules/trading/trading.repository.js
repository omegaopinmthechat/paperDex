import supabase from '../../infrastructure/database/client.js';
import { AppError } from '../../utils/errors.js';
import STATUS_CODES from '../../constants/statusCodes.js';
import ERROR_CODES from '../../constants/errorCodes.js';

const dbError = (err, context) =>
  new AppError(
    STATUS_CODES.INTERNAL_SERVER_ERROR,
    ERROR_CODES.INTERNAL_ERROR,
    `DB error (${context}): ${err?.message ?? JSON.stringify(err)}`,
  );

// ── Quotes ────────────────────────────────────────────────────────────────────

export const insertQuote = async ({ userId, token, side, amount, price, nonce, deadline, quoteSignature }) => {
  const { data, error } = await supabase
    .from('quotes')
    .insert({
      user_id: userId,
      token,
      side,
      amount,
      price,
      nonce: nonce.toString(),   // store as text — bigint is too large for JS number
      deadline: deadline.toString(),
      quote_signature: quoteSignature,
    })
    .select()
    .single();

  if (error) throw dbError(error, 'insertQuote');
  return data;
};

export const getQuoteById = async (quoteId) => {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', quoteId)
    .single();

  if (error) throw dbError(error, 'getQuoteById');
  return data;
};

// ── Trades ────────────────────────────────────────────────────────────────────

export const insertTrade = async ({ userId, token, side, amount, price, usdAmount, nonce, txHash, status }) => {
  const { data, error } = await supabase
    .from('trades')
    .insert({
      user_id: userId,
      token,
      side,
      amount,
      price,
      usd_amount: usdAmount,
      nonce: nonce.toString(),
      tx_hash: txHash,
      status,
    })
    .select()
    .single();

  if (error) throw dbError(error, 'insertTrade');
  return data;
};

export const getTradesByUser = async (userId) => {
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw dbError(error, 'getTradesByUser');
  return data;
};

