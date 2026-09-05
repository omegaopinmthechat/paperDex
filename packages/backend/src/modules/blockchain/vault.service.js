import { ethers } from 'ethers';
import { createRequire } from 'module';
import provider from '../../infrastructure/blockchain/provider.js';

const require = createRequire(import.meta.url);
const sepolia = require('../../../../contracts/deployments/sepolia.json');

// Minimal ERC-20 ABI — only balanceOf and decimals are needed here
const ERC20_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

/**
 * Returns the vault's balance of a given token address as a human-readable decimal string.
 * Uses the standard balanceOf / decimals calls (all PaperTokens are 18-decimal ERC-20s).
 */
export const getVaultBalance = async (tokenAddress) => {
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const [raw, decimals] = await Promise.all([
    contract.balanceOf(sepolia.contracts.PaperDEXVault),
    contract.decimals(),
  ]);
  return ethers.formatUnits(raw, decimals);
};
