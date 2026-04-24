import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __deploywatchPrisma__: PrismaClient | undefined;
}

export const prisma =
  global.__deploywatchPrisma__ ??
  new PrismaClient({
    log: ["error", "warn"]
  });

if (process.env.NODE_ENV !== "production") {
  global.__deploywatchPrisma__ = prisma;
}
