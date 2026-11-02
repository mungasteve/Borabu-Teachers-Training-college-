import fs from 'fs';
import path from 'path';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../generated/prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

function resolveDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // On Vercel serverless functions, the bundled project directory is read-only.
  // Copy the bundled SQLite database to /tmp/dev.db on cold start so writes succeed.
  if (process.env.VERCEL) {
    const tmpDbPath = '/tmp/dev.db';
    if (!fs.existsSync(tmpDbPath)) {
      const bundledDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
      if (fs.existsSync(bundledDbPath)) {
        fs.copyFileSync(bundledDbPath, tmpDbPath);
      }
    }
    return `file:${tmpDbPath}`;
  }

  return 'file:./prisma/dev.db';
}

let prisma: PrismaClient;
const databaseUrl = resolveDatabaseUrl();

if (process.env.NODE_ENV === 'production') {
  const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
  prisma = new PrismaClient({ adapter });
} else {
  if (!global.prisma) {
    const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
    global.prisma = new PrismaClient({ adapter });
  }
  prisma = global.prisma;
}

export { prisma };
export * from '../generated/prisma/client';
