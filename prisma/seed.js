const { PrismaClient } = require("@prisma/client");

let prisma = new PrismaClient();

const main = async () => {
  await prisma.stock.upsert({
    where: {
      id: "f92ef45b-a729-4938-b580-03d939a80301",
    },
    update: {
      amount: 10,
      version: 0,
    },
    create: {
      id: "f92ef45b-a729-4938-b580-03d939a80301",
      amount: 10,
      version: 0,
    },
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
