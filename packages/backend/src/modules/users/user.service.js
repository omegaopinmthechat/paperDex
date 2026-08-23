import * as tokenService from '../blockchain/token.service.js';
import * as blockchainRepo from '../blockchain/blockchain.repository.js';
import * as userRepo from './user.repository.js';

export const ensureStarterBalance = async (walletAddress) => {
  const alreadyGranted = await tokenService.hasReceivedStartingBalance(walletAddress);
  if (alreadyGranted) return;

  let result;
  try {
    result = await tokenService.grantStartingBalance(walletAddress);
  } catch (err) {
    // AlreadyReceivedStartingBalance — concurrent login won the race; treat as success
    if (err?.message?.includes('AlreadyReceivedStartingBalance')) {
      console.info('ensureStarterBalance: concurrent grant already succeeded', { walletAddress });
      return;
    }
    console.error('ensureStarterBalance: grantStartingBalance failed', { walletAddress, err });
    return; // do not retry here; next login's hasReceivedStartingBalance check handles it
  }

  const user = await userRepo.findByWalletAddress(walletAddress);
  if (!user) {
    console.error('ensureStarterBalance: user row not found after grant', { walletAddress });
    return;
  }

  await blockchainRepo.insertTransaction({
    userId: user.id,
    txHash: result.txHash,
    type: 'STARTER_GRANT',
    token: 'USDTP',
    direction: 'CREDIT',
    amount: result.amount,
    status: result.status,
    blockNumber: result.blockNumber,
  });
};
