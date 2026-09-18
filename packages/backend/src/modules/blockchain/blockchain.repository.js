import prisma from '../../infrastructure/database/client.js';

export const insertTransaction = async ({ userId, txHash, type, token, direction, amount, status, blockNumber }) => {
  const tx = await prisma.transaction.create({
    data: {
      userId,
      txHash,
      type,
      token,
      direction,
      amount,
      status,
      blockNumber: blockNumber ?? null,
    },
  });
  // Return snake_case shape to match callers in user.service.js
  return {
    id: tx.id,
    user_id: tx.userId,
    tx_hash: tx.txHash,
    type: tx.type,
    token: tx.token,
    direction: tx.direction,
    amount: tx.amount,
    status: tx.status,
    block_number: tx.blockNumber,
    created_at: tx.createdAt,
  };
};
