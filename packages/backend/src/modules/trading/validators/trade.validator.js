import { z } from 'zod';

/**
 * Validates the body of POST /api/v1/trade/execute.
 * quoteId — UUID of the quote row returned by /quote
 * userSignature — EIP-712 typed-data signature produced by MetaMask (0x-prefixed hex)
 */
export const tradeSchema = z.object({
  quoteId: z.string().uuid('quoteId must be a valid UUID'),
  userSignature: z
    .string()
    .regex(/^0x[0-9a-fA-F]+$/, 'userSignature must be a 0x-prefixed hex string')
    .min(132, 'userSignature appears too short for a valid ECDSA signature'),
});
