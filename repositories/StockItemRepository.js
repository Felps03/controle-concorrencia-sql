class StockItemRepository {
  constructor(databaseStrategy) {
    this.databaseStrategy = databaseStrategy;
  }

  async findStockItemById(id) {
    return this.databaseStrategy.readStockItem(id);
  }

  async updateStockItem(id, version) {
    return this.databaseStrategy.updateStockItem(id, version);
  }
}

module.exports = StockItemRepository;
