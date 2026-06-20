require("dotenv").config();

const DatabaseStrategyFactory = require("./src/Factory");
const StockItemRepository = require('./src/repositories/StockItemRepository');
const LoggingRepositoryDecorator = require('./src/decorators/LoggingRepositoryDecorator');

const { updateStockItemConcurrently } = require('./src/services/stockItemService');


const strategyType = process.env.DATABASE_STRATEGY || "pool";

const databaseStrategy = DatabaseStrategyFactory.create(strategyType);

const stockItemRepository = new StockItemRepository(databaseStrategy);
const decoratedRepository  = new LoggingRepositoryDecorator(stockItemRepository);

const main = async () => {
    const id = "f92ef45b-a729-4938-b580-03d939a80301";

    const results = await Promise.allSettled(
      Array.from({ length: 100 }, () => updateStockItemConcurrently(id, decoratedRepository))
    );

    const summary = results.reduce((acc, result) => {
      const status = result.status === "fulfilled" ? "success" : result.reason.name;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const finalStockItem = await decoratedRepository.findStockItemById(id);
    console.log("Resumo das tentativas:", summary);
    console.log("Resultado final do estoque:", finalStockItem);
  }

  main()
    .catch(console.error)
    .finally(() => {
      if (strategyType === "pool") {
        require("./src/database/pool/poolClient").end();
      }
    });
