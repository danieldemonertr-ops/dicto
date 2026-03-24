import { PrismaClient } from "@prisma/client";

// Detecta erros de cold-start do Neon (banco adormecido)
function isNeonSleepError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message;
  return (
    msg.includes("Can't reach database") ||
    msg.includes("P1001") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("Connection refused")
  );
}

function createPrisma() {
  const client = new PrismaClient({ log: ["error"] });

  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          // Até 3 tentativas com 2s de espera entre elas (Neon leva ~5-10s para acordar)
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              return await query(args);
            } catch (err) {
              if (isNeonSleepError(err) && attempt < 2) {
                await new Promise((r) => setTimeout(r, 2000));
                continue;
              }
              throw err;
            }
          }
          // TypeScript precisa de um return explícito aqui
          return query(args);
        },
      },
    },
  });
}

type ExtendedPrisma = ReturnType<typeof createPrisma>;
const globalForPrisma = globalThis as unknown as { prisma: ExtendedPrisma };

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
