import { defineConfig, env } from "prisma/config";

// A CLI do Prisma roda fora do nosso `node --env-file-if-exists=.env`, então
// precisa carregar o .env por conta própria. Usamos a API nativa do Node
// (sem dotenv) para manter a mesma abordagem do resto do projeto.
try {
  process.loadEnvFile(".env");
} catch {
  // .env nao existe (ex: CI, onde as vars já vêm do ambiente) - segue sem ele.
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
