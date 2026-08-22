import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import env from '../../config/env.js';
import ERROR_CODES from '../../constants/errorCodes.js';
import { AppError } from '../../utils/errors.js';
import STATUS_CODES from '../../constants/statusCodes.js';
import { generateNonce, nonceExpiresAt, buildNonceMessage } from './nonce.service.js';
import * as repo from './auth.repository.js';

export const requestNonce = async (walletAddress) => {
  const address = ethers.getAddress(walletAddress); // normalise + validate checksum
  const nonce = generateNonce();
  const expiresAt = nonceExpiresAt();
  await repo.upsertNonce(address, nonce, expiresAt);
  return { nonce, message: buildNonceMessage(address, nonce) };
};

export const login = async (walletAddress, signature) => {
  const address = ethers.getAddress(walletAddress);

  const record = await repo.getNonce(address);
  if (!record) {
    throw new AppError(STATUS_CODES.UNAUTHORIZED, ERROR_CODES.INVALID_NONCE, 'No nonce found for this address');
  }
  if (record.used) {
    throw new AppError(STATUS_CODES.UNAUTHORIZED, ERROR_CODES.INVALID_NONCE, 'Nonce already used');
  }
  if (new Date(record.expires_at) < new Date()) {
    throw new AppError(STATUS_CODES.UNAUTHORIZED, ERROR_CODES.NONCE_EXPIRED, 'Nonce has expired');
  }

  const message = buildNonceMessage(address, record.nonce);
  const recovered = ethers.verifyMessage(message, signature);
  if (recovered.toLowerCase() !== address.toLowerCase()) {
    throw new AppError(STATUS_CODES.UNAUTHORIZED, ERROR_CODES.INVALID_SIGNATURE, 'Signature verification failed');
  }

  // Mark nonce used before issuing token — prevents replay under concurrent requests
  await repo.markNonceUsed(address);

  const user = await repo.upsertUser(address);
  const token = jwt.sign({ sub: user.id, wallet: address }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

  return { token, user };
};
