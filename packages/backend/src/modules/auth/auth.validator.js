import { z } from 'zod';

const ethereumAddress = z
  .string()
  .regex(/^0x[0-9a-fA-F]{40}$/, 'Invalid Ethereum address');

export const nonceSchema = z.object({
  walletAddress: ethereumAddress,
});

export const loginSchema = z.object({
  walletAddress: ethereumAddress,
  signature: z.string().min(1, 'Signature is required'),
});
