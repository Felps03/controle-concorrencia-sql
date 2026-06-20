import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

import prisma from "../../src/database/prisma/prismaClient.js";
import { PoolStrategy } from "../../src/strategies/PoolStrategy.js";
import StockItemRepository from "../../src/repositories/StockItemRepository.js";
import { updateStockItemConcurrently } from "../../src/services/stockItemService.js";
import poolClient from "../../src/database/pool/poolClient.js";

// Requer um Postgres acessivel via DATABASE_URL com as migrations aplicadas
// (ver README: docker compose up -d && npx prisma migrate deploy).
const repository = new StockItemRepository(new PoolStrategy());
const createdIds = [];

// Sob alta contencao, mais de uma tentativa de retry pode ser necessaria para
// que cada unidade de estoque disponivel seja efetivamente "vencida" por
// algum chamador antes que outro a leia como esgotada. 10 tentativas se
// mostrou suficiente mesmo em 1000 chamadas simultaneas neste teste.
const RETRIES = 10;

const seedStock = async (amount) => {
  const id = crypto.randomUUID();
  createdIds.push(id);
  await prisma.stock.create({ data: { id, amount, version: 0 } });
  return id;
};

for (const concurrentRequests of [100, 500, 1000]) {
  test(`estoque nunca fica negativo com ${concurrentRequests} compras simultaneas`, async () => {
    const initialAmount = 10;
    const id = await seedStock(initialAmount);

    const results = await Promise.allSettled(
      Array.from({ length: concurrentRequests }, () =>
        updateStockItemConcurrently(id, repository, { retries: RETRIES, backoffMs: 5 })
      )
    );

    const finalStockItem = await repository.findStockItemById(id);
    const successes = results.filter((r) => r.status === "fulfilled").length;

    assert.ok(finalStockItem.amount >= 0, "o estoque nunca pode ficar negativo");
    assert.equal(successes, initialAmount, "numero de compras bem-sucedidas deve ser igual ao estoque inicial");
    assert.equal(finalStockItem.amount, initialAmount - successes);
  });
}

test.after(async () => {
  await prisma.stock.deleteMany({ where: { id: { in: createdIds } } });
  await prisma.$disconnect();
  await poolClient.end();
});
