import prisma from '../../infrastructure/database/client.js';

export const findByWalletAddress = async (walletAddress) => {
  const user = await prisma.user.findUnique({
    where: { walletAddress },
    select: { id: true, walletAddress: true, createdAt: true },
  });
  if (!user) return null;
  // Return shape that matches what user.service.js expects (snake_case keys)
  return {
    id: user.id,
    wallet_address: user.walletAddress,
    created_at: user.createdAt,
  };
};
