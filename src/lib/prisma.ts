import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaD1?: PrismaClient;
};

function createLocalClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/** Resolve Prisma — D1 on Cloudflare Workers, SQLite file locally. */
export function getPrisma(): PrismaClient {
  // Prefer Cloudflare D1 when running inside Workers / OpenNext
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getCloudflareContext } = require("@opennextjs/cloudflare") as {
      getCloudflareContext: (opts?: { async?: boolean }) => { env: { DB?: unknown } };
    };
    const ctx = getCloudflareContext({ async: false });
    const db = ctx?.env?.DB as ConstructorParameters<typeof PrismaD1>[0] | undefined;
    if (db) {
      if (!globalForPrisma.prismaD1) {
        const adapter = new PrismaD1(db);
        globalForPrisma.prismaD1 = new PrismaClient({ adapter });
      }
      return globalForPrisma.prismaD1;
    }
  } catch {
    // Not in Workers runtime
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createLocalClient();
  }
  return globalForPrisma.prisma;
}

/** Sync proxy so existing `prisma.model.method()` call sites keep working. */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrisma();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
