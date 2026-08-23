import { ethers } from 'ethers';
import { createRequire } from 'module';
import provider from './provider.js';
import { relayerWallet } from './wallet.js';

const require = createRequire(import.meta.url);
const sepoliaAddresses = require('../../../../contracts/deployments/sepolia.json');
const paperUsdArtifact = require('../../../../contracts/artifacts/contracts/tokens/PaperUSD.sol/PaperUSD.json');

export const paperUsdContract = new ethers.Contract(
  sepoliaAddresses.contracts.USDTP,
  paperUsdArtifact.abi,
  provider,
);

export const paperUsdWithSigner = paperUsdContract.connect(relayerWallet);
