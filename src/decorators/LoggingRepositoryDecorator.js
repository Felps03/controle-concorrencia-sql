const logger = require("../logger");

class LoggingRepositoryDecorator {
  constructor(repository) {
    this.repository = repository;
  }

  async findStockItemById(id) {
    logger.debug({ id }, "Buscando stockItem");
    const result = await this.repository.findStockItemById(id);
    logger.debug({ id, result }, "Resultado da busca");
    return result;
  }

  async updateStockItem(id, version) {
    logger.debug({ id, version }, "Atualizando stockItem");
    const success = await this.repository.updateStockItem(id, version);
    logger.debug({ id, version, success }, "Resultado da atualizacao");
    return success;
  }
}

module.exports = LoggingRepositoryDecorator;
