import { randomBytes } from 'crypto';
import env from '../../config/env.js';

export const generateNonce = () => randomBytes(16).toString('hex');

export const nonceExpiresAt = () =>
  new Date(Date.now() + env.NONCE_TTL_SECONDS * 1000).toISOString();

export const buildNonceMessage = (address, nonce) =>
  `Sign this message to authenticate with PaperDEX.\n\nWallet: ${address}\nNonce: ${nonce}`;
