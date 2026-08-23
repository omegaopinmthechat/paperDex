import { ethers } from 'ethers';
import env from '../../config/env.js';

const provider = new ethers.JsonRpcProvider(env.SEPOLIA_RPC_URL);

export default provider;
