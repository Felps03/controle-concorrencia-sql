const updateStockItemConcurrently = async (id, decoratedRepository) => {
  try {
    const stockItem = await decoratedRepository.findStockItemById(id);
    if (!stockItem || stockItem.amount <= 0) {
      throw new Error("Estoque insuficiente.");
    }
    await decoratedRepository.updateStockItem(id, stockItem.version);
  } catch (error) {
    console.error(
      `Erro ao atualizar o estoque para o item ${id}:`,
      error.message
    );
  }
};

module.exports = { updateStockItemConcurrently };
