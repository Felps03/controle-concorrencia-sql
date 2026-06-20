import DatabaseStrategyFactory from "./src/Factory.js";
import StockItemRepository from "./src/repositories/StockItemRepository.js";
import LoggingRepositoryDecorator from "./src/decorators/LoggingRepositoryDecorator.js";

import { updateStockItemConcurrently } from "./src/services/stockItemService.js";
import logger from "./src/logger.js";


const strategyType = process.env.DATABASE_STRATEGY || "pool";

const databaseStrategy = DatabaseStrategyFactory.create(strategyType);

const stockItemRepository = new StockItemRepository(databaseStrategy);
const decoratedRepository  = new LoggingRepositoryDecorator(stockItemRepository);

const main = async () => {
    const id = process.env.STOCK_ITEM_ID || "f92ef45b-a729-4938-b580-03d939a80301";

    const results = await Promise.allSettled(
      Array.from({ length: 100 }, () => updateStockItemConcurrently(id, decoratedRepository))
    );

    const summary = results.reduce((acc, result) => {
      const status = result.status === "fulfilled" ? "success" : result.reason.name;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const finalStockItem = await decoratedRepository.findStockItemById(id);
    logger.info({ summary }, "Resumo das tentativas");
    logger.info({ finalStockItem }, "Resultado final do estoque");
  }

  main()
    .catch((error) => logger.error({ err: error }, "Erro durante a execucao do script"))
    .finally(async () => {
      if (strategyType === "pool") {
        const { default: poolClient } = await import("./src/database/pool/poolClient.js");
        await poolClient.end();
      } else if (strategyType === "prisma") {
        const { default: prisma } = await import("./src/database/prisma/prismaClient.js");
        await prisma.$disconnect();
      }
    });
