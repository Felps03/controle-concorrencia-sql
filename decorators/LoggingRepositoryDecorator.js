class LoggingRepositoryDecorator {
  constructor(repository) {
    this.repository = repository;
  }

  async findStockItemById(id) {
    console.log(`Buscando stockItem com id: ${id}`);
    const result = await this.repository.findStockItemById(id);
    console.log(`Resultado: ${JSON.stringify(result)}`);
    return result;
  }

  async updateStockItem(id, version) {
    console.log(`Atualizando stockItem com id: ${id} e version: ${version}`);
    const success = await this.repository.updateStockItem(id, version);
    console.log(`Atualização ${success ? "bem-sucedida" : "falhou"}`);
    return success;
  }
}

module.exports = LoggingRepositoryDecorator;
