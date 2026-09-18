import prisma from '../../infrastructure/database/client.js';
import { AppError } from '../../utils/errors.js';
import STATUS_CODES from '../../constants/statusCodes.js';
import ERROR_CODES from '../../constants/errorCodes.js';

const dbError = (err, context) =>
  new AppError(
    STATUS_CODES.INTERNAL_SERVER_ERROR,
    ERROR_CODES.INTERNAL_ERROR,
    `DB error (${context}): ${err?.message ?? JSON.stringify(err)}`,
  );

// ── Helpers ───────────────────────────────────────────────────────────────────

// Map Prisma camelCase quote → snake_case shape expected by trading.service.js
const toQuoteRow = (q) => ({
  id: q.id,
  user_id: q.userId,
  token: q.token,
  side: q.side,
  amount: q.amount,
  price: q.price,
  nonce: q.nonce,
  deadline: q.deadline,
  quote_signature: q.quoteSignature,
  created_at: q.createdAt,
});

// Map Prisma camelCase trade → snake_case shape expected by trading.service.js
const toTradeRow = (t) => ({
  id: t.id,
  user_id: t.userId,
  token: t.token,
  side: t.side,
  amount: t.amount,
  price: t.price,
  usd_amount: t.usdAmount,
  nonce: t.nonce,
  tx_hash: t.txHash,
  status: t.status,
  created_at: t.createdAt,
});

// ── Quotes ────────────────────────────────────────────────────────────────────

export const insertQuote = async ({ userId, token, side, amount, price, nonce, deadline, quoteSignature }) => {
  try {
    const quote = await prisma.quote.create({
      data: {
        userId,
        token,
        side,
        amount,
        price,
        nonce: nonce.toString(),   // store as text — bigint is too large for JS number
        deadline: deadline.toString(),
        quoteSignature,
      },
    });
    return toQuoteRow(quote);
  } catch (err) {
    throw dbError(err, 'insertQuote');
  }
};

export const getQuoteById = async (quoteId) => {
  try {
    const quote = await prisma.quote.findUniqueOrThrow({
      where: { id: quoteId },
    });
    return toQuoteRow(quote);
  } catch (err) {
    throw dbError(err, 'getQuoteById');
  }
};

// ── Trades ────────────────────────────────────────────────────────────────────

export const insertTrade = async ({ userId, token, side, amount, price, usdAmount, nonce, txHash, status }) => {
  try {
    const trade = await prisma.trade.create({
      data: {
        userId,
        token,
        side,
        amount,
        price,
        usdAmount,
        nonce: nonce.toString(),
        txHash,
        status,
      },
    });
    return toTradeRow(trade);
  } catch (err) {
    throw dbError(err, 'insertTrade');
  }
};

export const getTradesByUser = async (userId) => {
  try {
    const trades = await prisma.trade.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return trades.map(toTradeRow);
  } catch (err) {
    throw dbError(err, 'getTradesByUser');
  }
};

