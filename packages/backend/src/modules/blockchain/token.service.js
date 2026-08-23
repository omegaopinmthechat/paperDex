import { ethers } from 'ethers';
import { createRequire } from 'module';
import { paperUsdContract, paperUsdWithSigner } from '../../infrastructure/blockchain/contracts.js';
import provider from '../../infrastructure/blockchain/provider.js';
import { sendAndWait } from './relayer.service.js';

const require = createRequire(import.meta.url);
const sepolia = require('../../../../contracts/deployments/sepolia.json');
const paperTokenArtifact = require('../../../../contracts/artifacts/contracts/tokens/PaperTokens.sol/PaperToken.json');

const BALANCE_OF_ABI = ['function balanceOf(address) view returns (uint256)'];

const TOKEN_ADDRESSES = {
  USDTP: sepolia.contracts.USDTP,
  BTCP: sepolia.contracts.BTCP,
  ETHP: sepolia.contracts.ETHP,
  SOLP: sepolia.contracts.SOLP,
};

export const getTokenBalance = async (walletAddress, symbol) => {
  const tokenAddress = TOKEN_ADDRESSES[symbol.toUpperCase()];
  if (!tokenAddress) throw new Error(`Unknown token symbol: ${symbol}`);
  const contract = new ethers.Contract(tokenAddress, BALANCE_OF_ABI, provider);
  const raw = await contract.balanceOf(walletAddress);
  return ethers.formatUnits(raw, 18);
};

export const getAllTokenBalances = async (walletAddress) => {
  const symbols = Object.keys(TOKEN_ADDRESSES);
  const results = await Promise.all(symbols.map((s) => getTokenBalance(walletAddress, s)));
  return Object.fromEntries(symbols.map((s, i) => [s, results[i]]));
};

export const hasReceivedStartingBalance = async (address) => {
  return paperUsdContract.hasReceivedStartingBalance(address);
};

export const grantStartingBalance = async (address) => {
  const { txHash, blockNumber, receipt } = await sendAndWait(
    paperUsdWithSigner.grantStartingBalance(address),
  );

  const iface = paperUsdContract.interface;
  let amount = null;
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed?.name === 'StartingBalanceGranted') {
        amount = ethers.formatUnits(parsed.args.amount, 18);
        break;
      }
    } catch {
      // not a PaperUSD log
    }
  }

  return { txHash, blockNumber, amount, status: 'CONFIRMED' };
};
