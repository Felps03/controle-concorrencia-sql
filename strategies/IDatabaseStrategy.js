class IDatabaseStrategy {
  async readStockItem(id) {
    throw new Error("readStockItem method not implemented");
  }

  async updateStockItem(id, version) {
    throw new Error("updateStockItem method not implemented");
  }
}

module.exports = { IDatabaseStrategy };
