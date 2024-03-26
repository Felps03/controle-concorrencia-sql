require("dotenv").config();

const DatabaseStrategyFactory = require("./Factory");
const StockItemRepository = require('./repositories/StockItemRepository');
const LoggingRepositoryDecorator = require('./decorators/LoggingRepositoryDecorator');

const { updateStockItemConcurrently } = require('./services/stockItemService');


const strategyType = process.env.DATABASE_STRATEGY || "pool";

const databaseStrategy = DatabaseStrategyFactory.create(strategyType);

const stockItemRepository = new StockItemRepository(databaseStrategy);
const decoratedRepository  = new LoggingRepositoryDecorator(stockItemRepository);

const main = async () => {
    const id = "f92ef45b-a729-4938-b580-03d939a80301";
  
    try {

        await Promise.all(Array.from({ length: 100 }, () => updateStockItemConcurrently(id, decoratedRepository)));
        const finalStockItem = await decoratedRepository.findStockItemById(id);
        console.log("Resultado final do estoque:", finalStockItem);

      
    } catch (error) {
      console.error("Erro durante a execução do script:", error);
    }
  }

  main().catch(console.error);