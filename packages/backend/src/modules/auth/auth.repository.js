import prisma from '../../infrastructure/database/client.js';

export const upsertNonce = async (walletAddress, nonce, expiresAt) => {
  await prisma.authNonce.upsert({
    where: { walletAddress },
    update: { nonce, expiresAt, used: false },
    create: { walletAddress, nonce, expiresAt, used: false },
  });
};

export const getNonce = async (walletAddress) => {
  const row = await prisma.authNonce.findUnique({
    where: { walletAddress },
    select: { nonce: true, expiresAt: true, used: true },
  });
  if (!row) return null;
  // Return shape that matches what auth.service.js expects (snake_case keys)
  return {
    nonce: row.nonce,
    expires_at: row.expiresAt,
    used: row.used,
  };
};

export const markNonceUsed = async (walletAddress) => {
  await prisma.authNonce.update({
    where: { walletAddress },
    data: { used: true },
  });
};

export const upsertUser = async (walletAddress) => {
  const user = await prisma.user.upsert({
    where: { walletAddress },
    update: {},
    create: { walletAddress },
    select: { id: true, walletAddress: true, createdAt: true },
  });
  // Return shape that matches what auth.service.js expects (snake_case keys)
  return {
    id: user.id,
    wallet_address: user.walletAddress,
    created_at: user.createdAt,
  };
};
