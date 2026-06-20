const test = require("node:test");
const assert = require("node:assert/strict");

const { updateStockItemConcurrently } = require("../../src/services/stockItemService");
const InsufficientStockError = require("../../src/errors/InsufficientStockError");
const VersionConflictError = require("../../src/errors/VersionConflictError");

const id = "fake-id";

const fakeRepository = ({ amount, version, updateResults }) => {
  let call = 0;
  return {
    async findStockItemById() {
      return { id, amount, version };
    },
    async updateStockItem() {
      const result = updateResults[call];
      call += 1;
      return result;
    },
  };
};

test("retorna sucesso quando o update vence na primeira tentativa", async () => {
  const repo = fakeRepository({ amount: 10, version: 0, updateResults: [true] });

  const result = await updateStockItemConcurrently(id, repo);

  assert.equal(result.status, "success");
  assert.equal(result.attempt, 1);
});

test("tenta novamente apos conflito de versao e tem sucesso na 2a tentativa", async () => {
  const repo = fakeRepository({ amount: 10, version: 0, updateResults: [false, true] });

  const result = await updateStockItemConcurrently(id, repo, { retries: 3, backoffMs: 1 });

  assert.equal(result.status, "success");
  assert.equal(result.attempt, 2);
});

test("lanca VersionConflictError apos esgotar as tentativas", async () => {
  const repo = fakeRepository({ amount: 10, version: 0, updateResults: [false, false, false] });

  await assert.rejects(
    () => updateStockItemConcurrently(id, repo, { retries: 3, backoffMs: 1 }),
    VersionConflictError
  );
});

test("lanca InsufficientStockError quando o estoque esta zerado", async () => {
  const repo = fakeRepository({ amount: 0, version: 0, updateResults: [] });

  await assert.rejects(
    () => updateStockItemConcurrently(id, repo),
    InsufficientStockError
  );
});

test("lanca InsufficientStockError quando o item nao existe", async () => {
  const repo = {
    async findStockItemById() {
      return undefined;
    },
  };

  await assert.rejects(
    () => updateStockItemConcurrently(id, repo),
    InsufficientStockError
  );
});
