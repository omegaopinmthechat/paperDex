import { z } from 'zod';

const VALID_SCOPES = ['READ_ONLY', 'TRADE'];
const VALID_EXPIRY = ['7d', '30d', '180d', 'never'];

export const createKeySchema = z.object({
  name: z
    .string()
    .min(1, 'name is required')
    .max(64, 'name must be 64 characters or fewer'),
  scope: z.enum(VALID_SCOPES, {
    errorMap: () => ({ message: `scope must be one of: ${VALID_SCOPES.join(', ')}` }),
  }),
  expiresIn: z.enum(VALID_EXPIRY, {
    errorMap: () => ({ message: `expiresIn must be one of: ${VALID_EXPIRY.join(', ')}` }),
  }),
});

export const revokeKeySchema = z.object({
  id: z.string().min(1, 'id is required'),
});
