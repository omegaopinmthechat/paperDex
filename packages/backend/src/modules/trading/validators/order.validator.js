import { z } from 'zod';

const SUPPORTED_TOKENS = ['BTCP', 'ETHP', 'SOLP'];
const VALID_SIDES = ['BUY', 'SELL'];

/**
 * Validates the body of POST /api/v1/trade/quote.
 * amount is a positive decimal string (e.g. "0.001") — kept as string
 * to avoid floating-point precision loss before bigint conversion.
 */
export const orderSchema = z.object({
  token: z.enum(SUPPORTED_TOKENS, {
    errorMap: () => ({ message: `token must be one of: ${SUPPORTED_TOKENS.join(', ')}` }),
  }),
  side: z.enum(VALID_SIDES, {
    errorMap: () => ({ message: `side must be BUY or SELL` }),
  }),
  amount: z
    .string()
    .min(1, 'amount is required')
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: 'amount must be a positive number',
    }),
});
