import { ethers } from 'ethers';
import env from '../../config/env.js';
import provider from './provider.js';

export const relayerWallet = new ethers.Wallet(env.RELAYER_PRIVATE_KEY, provider);
