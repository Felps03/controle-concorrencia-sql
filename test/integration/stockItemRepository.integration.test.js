const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");

const { PrismaClient } = require("@prisma/client");
const { PoolStrategy } = require("../../src/strategies/PoolStrategy");
const { PrismaStrategy } = require("../../src/strategies/PrismaStrategy");
const poolClient = require("../../src/database/pool/poolClient");

// Requer um Postgres acessivel via DATABASE_URL com as migrations aplicadas
// (ver README: docker compose up -d && npx prisma migrate deploy).
const prisma = new PrismaClient();
const createdIds = [];

const seedStock = async (id, amount, version = 0) => {
  createdIds.push(id);
  await prisma.stock.upsert({
    where: { id },
    update: { amount, version },
    create: { id, amount, version },
  });
};

const strategies = {
  pool: new PoolStrategy(),
  prisma: new PrismaStrategy(),
};

for (const [name, strategy] of Object.entries(strategies)) {
  test(`[${name}] updateStockItem decrementa amount e incrementa version em caso de sucesso`, async () => {
    const id = crypto.randomUUID();
    await seedStock(id, 5, 0);

    const success = await strategy.updateStockItem(id, 0);
    assert.equal(success, true);

    const updated = await strategy.readStockItem(id);
    assert.equal(updated.amount, 4);
    assert.equal(updated.version, 1);
  });

  test(`[${name}] updateStockItem retorna false quando a version esta desatualizada (conflito)`, async () => {
    const id = crypto.randomUUID();
    await seedStock(id, 5, 0);

    await strategy.updateStockItem(id, 0); // avanca para version 1

    const conflicted = await strategy.updateStockItem(id, 0); // tenta com a version antiga
    assert.equal(conflicted, false);

    const stockItem = await strategy.readStockItem(id);
    assert.equal(stockItem.amount, 4); // nao decrementou de novo
  });
}

test.after(async () => {
  await prisma.stock.deleteMany({ where: { id: { in: createdIds } } });
  await prisma.$disconnect();
  await poolClient.end();
});
