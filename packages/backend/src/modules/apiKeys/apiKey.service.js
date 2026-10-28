import crypto from 'crypto';
import * as repo from './apiKey.repository.js';
import { AppError } from '../../utils/errors.js';
import STATUS_CODES from '../../constants/statusCodes.js';
import ERROR_CODES from '../../constants/errorCodes.js';

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_ACTIVE_KEYS = 3;

const EXPIRY_DURATIONS = {
  '7d':   7   * 24 * 60 * 60 * 1000,
  '30d':  30  * 24 * 60 * 60 * 1000,
  '180d': 180 * 24 * 60 * 60 * 1000,
  'never': null,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Generates a hex key ID: "pdx_id_<16 random hex chars>" */
const generateId = () => `pdx_id_${crypto.randomBytes(8).toString('hex')}`;

/** Generates a raw secret: "pdx_secret_<32 random hex chars>" */
const generateSecret = () => `pdx_secret_${crypto.randomBytes(16).toString('hex')}`;

/** One-way SHA-256 hash of a raw secret. Stored in DB; raw secret is never stored. */
const hashSecret = (rawSecret) =>
  crypto.createHash('sha256').update(rawSecret).digest('hex');

/** Compute expiresAt Date (or null for "never"). */
const computeExpiresAt = (expiresIn) => {
  const ms = EXPIRY_DURATIONS[expiresIn];
  return ms != null ? new Date(Date.now() + ms) : null;
};

// ── Strip keyHash from the object returned to clients ─────────────────────────
const stripHash = ({ key_hash, ...rest }) => rest; // eslint-disable-line no-unused-vars

// ── Service API ───────────────────────────────────────────────────────────────

/**
 * Create a new API key for a user.
 * Returns the key metadata + the raw secret — shown ONCE, never again.
 */
export const createApiKey = async (userId, { name, scope, expiresIn }) => {
  const activeCount = await repo.countActiveKeys(userId);
  if (activeCount >= MAX_ACTIVE_KEYS) {
    throw new AppError(
      STATUS_CODES.CONFLICT,
      ERROR_CODES.API_KEY_LIMIT_REACHED,
      `Maximum of ${MAX_ACTIVE_KEYS} active API keys allowed. Revoke an existing key first.`,
    );
  }

  const id        = generateId();
  const rawSecret = generateSecret();
  const keyHash   = hashSecret(rawSecret);
  const expiresAt = computeExpiresAt(expiresIn);

  await repo.insertApiKey({ id, userId, keyHash, name, scope, expiresAt });

  // Return the raw secret ONCE — it is never retrievable again
  return {
    id,
    name,
    scope,
    expiresAt,
    createdAt: new Date(),
    secret: rawSecret,  // ← shown once only
  };
};

/**
 * List all API keys for a user (secret stripped, never returned).
 */
export const listApiKeys = async (userId) => {
  const keys = await repo.listKeysByUser(userId);
  return keys.map(stripHash).map((k) => ({
    id:         k.id,
    name:       k.name,
    scope:      k.scope,
    expiresAt:  k.expires_at,
    lastUsedAt: k.last_used_at,
    revokedAt:  k.revoked_at,
    createdAt:  k.created_at,
  }));
};

/**
 * Revoke a key immediately.
 */
export const revokeApiKey = async (keyId, userId) => {
  await repo.revokeKey(keyId, userId);
};

/**
 * Validate an incoming API key pair (id + secret).
 * Called by apiKeyAuth.middleware on every /api/v2 request.
 *
 * Returns { userId, walletAddress, scope } on success.
 * Throws AppError on any failure — caller should sendError() and return.
 */
export const validateApiKey = async (id, rawSecret) => {
  const key = await repo.findKeyById(id);

  if (!key) {
    throw new AppError(STATUS_CODES.UNAUTHORIZED, ERROR_CODES.API_KEY_NOT_FOUND, 'Invalid API key');
  }

  // Check revoked
  if (key.revoked_at !== null) {
    throw new AppError(STATUS_CODES.UNAUTHORIZED, ERROR_CODES.API_KEY_REVOKED, 'This API key has been revoked');
  }

  // Check expired
  if (key.expires_at !== null && new Date(key.expires_at) < new Date()) {
    throw new AppError(STATUS_CODES.UNAUTHORIZED, ERROR_CODES.API_KEY_EXPIRED, 'This API key has expired');
  }

  // Constant-time hash comparison to prevent timing attacks
  const incomingHash = hashSecret(rawSecret);
  const storedHash   = key.key_hash;
  const hashBuffer1 = Buffer.from(incomingHash);
  const hashBuffer2 = Buffer.from(storedHash);

  if (
    hashBuffer1.length !== hashBuffer2.length ||
    !crypto.timingSafeEqual(hashBuffer1, hashBuffer2)
  ) {
    throw new AppError(STATUS_CODES.UNAUTHORIZED, ERROR_CODES.API_KEY_INVALID, 'Invalid API key secret');
  }

  // Fire-and-forget lastUsedAt update
  repo.touchLastUsed(id).catch(() => {});

  const user = key.user;
  if (!user) {
    throw new AppError(STATUS_CODES.UNAUTHORIZED, ERROR_CODES.USER_NOT_FOUND, 'User for this API key no longer exists');
  }

  return {
    userId:        user.id,
    walletAddress: user.walletAddress,
    scope:         key.scope,
    keyId:         key.id,
  };
};

