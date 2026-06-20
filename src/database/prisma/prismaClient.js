import { PrismaClient } from "../../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

class PrismaSingleton {
  constructor() {
    if (!PrismaSingleton.instance) {
      const adapter = new PrismaPg({
        connectionString: process.env.DATABASE_URL,
        // o driver `pg` nao tem timeout de conexao por padrao (0); o Prisma
        // <7 usava 5s internamente, então mantemos esse comportamento aqui.
        connectionTimeoutMillis: 5000,
      });
      PrismaSingleton.instance = new PrismaClient({ adapter });
    }
    return PrismaSingleton.instance;
  }
}

export default new PrismaSingleton();
