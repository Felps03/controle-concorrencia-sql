import test from "node:test";
import assert from "node:assert/strict";

import { updateStockItemConcurrently } from "../../src/services/stockItemService.js";
import InsufficientStockError from "../../src/errors/InsufficientStockError.js";
import VersionConflictError from "../../src/errors/VersionConflictError.js";

const id = "fake-id";

// Repositorio fake com estoque/version fixos entre chamadas, registrando
// quantas vezes cada metodo foi chamado e com quais argumentos.
const fakeRepository = ({ amount, version, updateResults }) => {
  const calls = { find: 0, update: [] };
  return {
    calls,
    async findStockItemById() {
      calls.find += 1;
      return { id, amount, version };
    },
    async updateStockItem(_id, versionUsed) {
      calls.update.push(versionUsed);
      return updateResults[calls.update.length - 1];
    },
  };
};

// Simula um "concorrente" que muda a version do registro a cada leitura,
// permitindo verificar que cada tentativa de retry usa a version mais
// recente lida, e nao uma version desatualizada da primeira tentativa.
const flakyVersionRepository = ({ amount, succeedsOnAttempt }) => {
  const versionsUsedInUpdate = [];
  let version = 0;
  return {
    versionsUsedInUpdate,
    async findStockItemById() {
      version += 1;
      return { id, amount, version };
    },
    async updateStockItem(_id, versionUsed) {
      versionsUsedInUpdate.push(versionUsed);
      return versionsUsedInUpdate.length === succeedsOnAttempt;
    },
  };
};

test("Dado um update que tem sucesso na primeira tentativa, quando a compra e realizada, entao ela retorna sucesso com o id e a tentativa corretos", async () => {
  // Dado
  const repo = fakeRepository({ amount: 10, version: 0, updateResults: [true] });

  // Quando
  const result = await updateStockItemConcurrently(id, repo);

  // Entao
  assert.equal(result.status, "success");
  assert.equal(result.attempt, 1);
  assert.equal(result.id, id);
});

test("Dado um conflito de versao na primeira tentativa, quando a compra e tentada novamente, entao ela tem sucesso na segunda tentativa usando a version mais recente lida", async () => {
  // Dado
  const repo = flakyVersionRepository({ amount: 10, succeedsOnAttempt: 2 });

  // Quando
  const result = await updateStockItemConcurrently(id, repo, { retries: 3, backoffMs: 1 });

  // Entao
  assert.equal(result.status, "success");
  assert.equal(result.attempt, 2);
  assert.deepEqual(repo.versionsUsedInUpdate, [1, 2]); // nunca reusa a version da 1a leitura
});

test("Dado conflitos de versao em todas as tentativas, quando o orcamento de retries se esgota, entao VersionConflictError e lancado", async () => {
  // Dado
  const repo = fakeRepository({ amount: 10, version: 0, updateResults: [false, false, false] });

  // Quando / Entao
  await assert.rejects(
    () => updateStockItemConcurrently(id, repo, { retries: 3, backoffMs: 1 }),
    VersionConflictError
  );
  assert.equal(repo.calls.find, 3);
  assert.equal(repo.calls.update.length, 3);
});

test("Dado retries igual a 1, quando a unica tentativa falha por conflito de versao, entao VersionConflictError e lancado imediatamente, sem nenhuma nova leitura", async () => {
  // Dado
  const repo = fakeRepository({ amount: 10, version: 0, updateResults: [false] });

  // Quando / Entao
  await assert.rejects(
    () => updateStockItemConcurrently(id, repo, { retries: 1, backoffMs: 1 }),
    VersionConflictError
  );
  assert.equal(repo.calls.find, 1);
  assert.equal(repo.calls.update.length, 1);
});

test("Dado nenhuma opcao de retries informada, quando ocorrem 2 conflitos seguidos, entao a compra ainda tem sucesso usando o orcamento padrao de 3 tentativas", async () => {
  // Dado
  const repo = fakeRepository({ amount: 10, version: 0, updateResults: [false, false, true] });

  // Quando
  const result = await updateStockItemConcurrently(id, repo);

  // Entao
  assert.equal(result.status, "success");
  assert.equal(result.attempt, 3);
});

test("Dado estoque zerado, quando uma compra e tentada, entao InsufficientStockError e nenhuma tentativa de escrita e feita", async () => {
  // Dado
  const repo = fakeRepository({ amount: 0, version: 0, updateResults: [] });

  // Quando / Entao
  await assert.rejects(() => updateStockItemConcurrently(id, repo), InsufficientStockError);
  assert.equal(repo.calls.update.length, 0);
});

test("Dado um estoque com amount negativo (estado inconsistente), quando uma compra e tentada, entao InsufficientStockError", async () => {
  // Dado
  const repo = fakeRepository({ amount: -1, version: 0, updateResults: [] });

  // Quando / Entao
  await assert.rejects(() => updateStockItemConcurrently(id, repo), InsufficientStockError);
});

test("Dado um item de estoque que nao existe, quando uma compra e tentada, entao InsufficientStockError", async () => {
  // Dado
  const repo = {
    async findStockItemById() {
      return undefined;
    },
  };

  // Quando / Entao
  await assert.rejects(() => updateStockItemConcurrently(id, repo), InsufficientStockError);
});
