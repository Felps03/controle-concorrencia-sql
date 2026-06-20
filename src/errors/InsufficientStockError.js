class InsufficientStockError extends Error {
  constructor(id) {
    super(`Estoque insuficiente para o item ${id}`);
    this.name = "InsufficientStockError";
    this.id = id;
  }
}

module.exports = InsufficientStockError;
