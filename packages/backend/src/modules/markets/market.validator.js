import { z } from 'zod';

const VALID_SYMBOLS = ['BTCP', 'ETHP', 'SOLP', 'USDTP'];

export const symbolParamSchema = z.object({
  symbol: z
    .string()
    .transform((s) => s.toUpperCase())
    .refine((s) => VALID_SYMBOLS.includes(s), {
      message: `Symbol must be one of: ${VALID_SYMBOLS.join(', ')}`,
    }),
});
