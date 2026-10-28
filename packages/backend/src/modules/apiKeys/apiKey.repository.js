import prisma from '../../infrastructure/database/client.js';
import { AppError } from '../../utils/errors.js';
import STATUS_CODES from '../../constants/statusCodes.js';
import ERROR_CODES from '../../constants/errorCodes.js';

const dbError = (err, context) =>
  new AppError(
    STATUS_CODES.INTERNAL_SERVER_ERROR,
    ERROR_CODES.INTERNAL_ERROR,
    `DB error (${context}): ${err?.message ?? JSON.stringify(err)}`,
  );

// ── Helpers ───────────────────────────────────────────────────────────────────

const toKeyRow = (k) => ({
  id:          k.id,
  user_id:     k.userId,
  key_hash:    k.keyHash,
  name:        k.name,
  scope:       k.scope,
  expires_at:  k.expiresAt,
  last_used_at: k.lastUsedAt,
  revoked_at:  k.revokedAt,
  created_at:  k.createdAt,
  user:        k.user ? { id: k.user.id, walletAddress: k.user.walletAddress } : undefined,
});


// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * Count active (non-revoked, non-expired) keys for a user.
 */
export const countActiveKeys = async (userId) => {
  try {
    return await prisma.apiKey.count({
      where: {
        userId,
        revokedAt: null,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });
  } catch (err) {
    throw dbError(err, 'countActiveKeys');
  }
};

/**
 * Insert a new API key row (secret already hashed by the service layer).
 */
export const insertApiKey = async ({ id, userId, keyHash, name, scope, expiresAt }) => {
  try {
    const key = await prisma.apiKey.create({
      data: { id, userId, keyHash, name, scope, expiresAt: expiresAt ?? null },
    });
    return toKeyRow(key);
  } catch (err) {
    throw dbError(err, 'insertApiKey');
  }
};

/**
 * List all keys for a user (active + revoked + expired).
 * The secret (keyHash) is stripped at the service layer, not here.
 */
export const listKeysByUser = async (userId) => {
  try {
    const keys = await prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return keys.map(toKeyRow);
  } catch (err) {
    throw dbError(err, 'listKeysByUser');
  }
};

/**
 * Find a key by its id string (e.g. "pdx_id_abc123").
 * Returns null if not found.
 */
export const findKeyById = async (id) => {
  try {
    const key = await prisma.apiKey.findUnique({ where: { id }, include: { user: true } });
    return key ? toKeyRow(key) : null;
  } catch (err) {
    throw dbError(err, 'findKeyById');
  }
};


/**
 * Soft-revoke a key by setting revokedAt = now().
 * Verifies the key belongs to the user before revoking.
 */
export const revokeKey = async (id, userId) => {
  try {
    const key = await prisma.apiKey.findUnique({ where: { id } });
    if (!key) {
      throw new AppError(STATUS_CODES.NOT_FOUND, ERROR_CODES.API_KEY_NOT_FOUND, 'API key not found');
    }
    if (key.userId !== userId) {
      throw new AppError(STATUS_CODES.FORBIDDEN, ERROR_CODES.FORBIDDEN, 'API key does not belong to this user');
    }
    await prisma.apiKey.update({ where: { id }, data: { revokedAt: new Date() } });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw dbError(err, 'revokeKey');
  }
};

/**
 * Update lastUsedAt timestamp (called on every successful API request).
 * Fire-and-forget — callers should not await if they want zero latency impact.
 */
export const touchLastUsed = async (id) => {
  try {
    await prisma.apiKey.update({ where: { id }, data: { lastUsedAt: new Date() } });
  } catch {
    // Non-critical — don't throw
  }
};
