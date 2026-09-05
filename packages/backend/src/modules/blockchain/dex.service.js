import { ethers } from 'ethers';
import { createRequire } from 'module';
import provider from '../../infrastructure/blockchain/provider.js';
import { relayerWallet } from '../../infrastructure/blockchain/wallet.js';
import { sendAndWait } from './relayer.service.js';
import { parseContractError } from './blockchain.service.js';

const require = createRequire(import.meta.url);
const sepolia = require('../../../../contracts/deployments/sepolia.json');
const paperDexArtifact = require('../../../../contracts/artifacts/contracts/exchange/PaperDEX.sol/PaperDEX.json');

const paperDexContract = new ethers.Contract(
  sepolia.contracts.PaperDEX,
  paperDexArtifact.abi,
  provider,
);

const paperDexWithSigner = paperDexContract.connect(relayerWallet);

/**
 * Checks whether a (user, nonce) pair has already been consumed on-chain.
 * View call — no gas.
 */
export const isNonceUsed = async (userAddress, nonce) => {
  return paperDexContract.usedNonces(userAddress, BigInt(nonce));
};

/**
 * Returns true if the token address is in the DEX's supported-token set.
 * View call — no gas.
 */
export const isSupportedToken = async (tokenAddress) => {
  return paperDexContract.supportedTokens(tokenAddress);
};

/**
 * Calls PaperDEX.executeTrade() via the relayer wallet and waits for 1 confirmation.
 * Returns { txHash, blockNumber }.
 * Throws a typed AppError on contract revert (via parseContractError).
 */
export const executeTrade = async ({
  token,
  price,
  amount,
  side,
  user,
  nonce,
  deadline,
  quoteSignature,
  userSignature,
}) => {
  try {
    const { txHash, blockNumber } = await sendAndWait(
      paperDexWithSigner.executeTrade(
        token,
        BigInt(price),
        BigInt(amount),
        side,
        user,
        BigInt(nonce),
        BigInt(deadline),
        quoteSignature,
        userSignature,
      ),
    );
    return { txHash, blockNumber };
  } catch (err) {
    throw parseContractError(err);
  }
};
