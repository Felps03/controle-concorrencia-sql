import InsufficientStockError from "../errors/InsufficientStockError.js";
import VersionConflictError from "../errors/VersionConflictError.js";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Em CCO, um retorno `false` do update significa que a version mudou entre a
// leitura e a escrita (outra compra venceu a corrida) — não é um erro, é o
// mecanismo de detecção de conflito funcionando. Por isso vale tentar de novo.
export const updateStockItemConcurrently = async (
  id,
  decoratedRepository,
  { retries = 3, backoffMs = 10 } = {}
) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const stockItem = await decoratedRepository.findStockItemById(id);
    if (!stockItem || stockItem.amount <= 0) {
      throw new InsufficientStockError(id);
    }

    const success = await decoratedRepository.updateStockItem(id, stockItem.version);
    if (success) {
      return { id, attempt, status: "success" };
    }

    if (attempt < retries) {
      await wait(backoffMs * attempt + Math.random() * backoffMs);
    }
  }

  throw new VersionConflictError(id, retries);
};
