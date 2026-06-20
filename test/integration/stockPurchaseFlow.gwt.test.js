const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");

const { PrismaClient } = require("@prisma/client");
const { PoolStrategy } = require("../../src/strategies/PoolStrategy");
const { PrismaStrategy } = require("../../src/strategies/PrismaStrategy");
const StockItemRepository = require("../../src/repositories/StockItemRepository");
const LoggingRepositoryDecorator = require("../../src/decorators/LoggingRepositoryDecorator");
const { updateStockItemConcurrently } = require("../../src/services/stockItemService");
const InsufficientStockError = require("../../src/errors/InsufficientStockError");
const VersionConflictError = require("../../src/errors/VersionConflictError");
const poolClient = require("../../src/database/pool/poolClient");

// Testes de integracao do fluxo de compra (stockItemService) contra um
// Postgres real, escritos no estilo Dado/Quando/Entao (Given/When/Then).
// Requer DATABASE_URL com as migrations aplicadas (ver README).
const prisma = new PrismaClient();
const createdIds = [];

const seedStock = async (amount, version = 0) => {
  const id = crypto.randomUUID();
  createdIds.push(id);
  await prisma.stock.create({ data: { id, amount, version } });
  return id;
};

const strategies = {
  pool: () => new PoolStrategy(),
  prisma: () => new PrismaStrategy(),
};

for (const [name, createStrategy] of Object.entries(strategies)) {
  const repository = new LoggingRepositoryDecorator(new StockItemRepository(createStrategy()));

  test(`[${name}] Dado estoque com unidades disponiveis, quando uma compra e realizada, entao ela tem sucesso e o estoque decrementa`, async () => {
    // Dado
    const id = await seedStock(5, 0);

    // Quando
    const result = await updateStockItemConcurrently(id, repository);

    // Entao
    assert.equal(result.status, "success");
    const stockItem = await repository.findStockItemById(id);
    assert.equal(stockItem.amount, 4);
    assert.equal(stockItem.version, 1);
  });

  test(`[${name}] Dado estoque zerado, quando uma compra e tentada, entao ocorre InsufficientStockError e o estoque permanece inalterado`, async () => {
    // Dado
    const id = await seedStock(0, 0);

    // Quando / Entao
    await assert.rejects(() => updateStockItemConcurrently(id, repository), InsufficientStockError);

    const stockItem = await repository.findStockItemById(id);
    assert.equal(stockItem.amount, 0);
    assert.equal(stockItem.version, 0);
  });

  test(`[${name}] Dado um item de estoque que nao existe, quando uma compra e tentada, entao ocorre InsufficientStockError`, async () => {
    // Dado
    const id = crypto.randomUUID();

    // Quando / Entao
    await assert.rejects(() => updateStockItemConcurrently(id, repository), InsufficientStockError);
  });
}

// Simula deterministicamente um "escritor concorrente" que altera a version
// do registro exatamente entre a leitura e a escrita feitas pelo service —
// reproduz a corrida de forma controlada, sem depender de timing real.
const raceInjectingRepository = (repository, { times = Infinity } = {}) => {
  let injections = 0;
  return {
    async findStockItemById(id) {
      const result = await repository.findStockItemById(id);
      if (injections < times) {
        injections += 1;
        await prisma.stock.update({ where: { id }, data: { version: { increment: 1 } } });
      }
      return result;
    },
    async updateStockItem(id, version) {
      return repository.updateStockItem(id, version);
    },
  };
};

test("Dado um unico conflito de versao simulado entre a leitura e a escrita, quando a compra e tentada novamente, entao ela se recupera e tem sucesso", async () => {
  // Dado
  const id = await seedStock(5, 0);
  const repository = new StockItemRepository(new PoolStrategy());
  const flakyRepository = raceInjectingRepository(repository, { times: 1 });

  // Quando
  const result = await updateStockItemConcurrently(id, flakyRepository, { retries: 3, backoffMs: 1 });

  // Entao
  assert.equal(result.status, "success");
  assert.equal(result.attempt, 2); // falhou na 1a tentativa, teve sucesso na 2a

  const stockItem = await prisma.stock.findUniqueOrThrow({ where: { id } });
  assert.equal(stockItem.amount, 4);
  assert.equal(stockItem.version, 2); // 1 do "concorrente" + 1 da compra bem-sucedida
});

test("Dado conflitos de versao persistentes (o concorrente sempre vence), quando as tentativas se esgotam, entao ocorre VersionConflictError e nenhuma compra e efetivada", async () => {
  // Dado
  const id = await seedStock(5, 0);
  const repository = new StockItemRepository(new PoolStrategy());
  const alwaysFlakyRepository = raceInjectingRepository(repository);

  // Quando / Entao
  await assert.rejects(
    () => updateStockItemConcurrently(id, alwaysFlakyRepository, { retries: 3, backoffMs: 1 }),
    VersionConflictError
  );

  const stockItem = await prisma.stock.findUniqueOrThrow({ where: { id } });
  assert.equal(stockItem.amount, 5); // a compra que falhou nunca decrementou o estoque
});

test.after(async () => {
  await prisma.stock.deleteMany({ where: { id: { in: createdIds } } });
  await prisma.$disconnect();
  await poolClient.end();
});
