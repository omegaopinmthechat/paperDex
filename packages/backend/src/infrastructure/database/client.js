import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import env from '../../config/env.js'; // Ensure env vars are loaded

const { Pool } = pg;

// Singleton: reuse the same PrismaClient across hot-reloads (nodemon)
const globalForPrisma = globalThis;

if (!globalForPrisma.prisma) {
  const connectionString = env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  globalForPrisma.prisma = new PrismaClient({
    adapter,
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

const prisma = globalForPrisma.prisma;
export default prisma;