require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

let prisma = new PrismaClient();

// Permite simular diferentes cenarios (ex: estoque zerado, estoque baixo)
// sem editar este arquivo: SEED_STOCK_ID, SEED_STOCK_AMOUNT, SEED_STOCK_VERSION.
const id = process.env.SEED_STOCK_ID || "f92ef45b-a729-4938-b580-03d939a80301";
const amount = Number(process.env.SEED_STOCK_AMOUNT ?? 10);
const version = Number(process.env.SEED_STOCK_VERSION ?? 0);

const main = async () => {
  await prisma.stock.upsert({
    where: { id },
    update: { amount, version },
    create: { id, amount, version },
  });
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
