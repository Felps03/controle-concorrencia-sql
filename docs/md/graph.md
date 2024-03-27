graph TD
    SistemaDeGerenciamentoDeEstoque(Sistema de Gerenciamento de Estoque)
    PontoDeEntrada(Ponto de Entrada: index.js) --> Configuração(Configuração de Banco de Dados)
    Configuração --> FactoryJS(Factory.js)
    FactoryJS --> Estratégias(Estratégias de Banco de Dados)
    Estratégias --> PoolStrategyJS(PoolStrategy.js)
    Estratégias --> PrismaStrategyJS(PrismaStrategy.js)
    PoolStrategyJS --> PoolClientJS(poolClient.js)
    PrismaStrategyJS --> PrismaClientJS(prismaClient.js)
    PontoDeEntrada --> Repositório(Repositório de Itens de Estoque)
    Repositório --> StockItemRepositoryJS(StockItemRepository.js)
    Repositório --> LoggingDecoratorJS(LoggingRepositoryDecorator.js)
    PontoDeEntrada --> Serviço(Serviço de Gerenciamento de Itens de Estoque)
    Serviço --> StockItemServiceJS(stockItemService.js)
    SistemaDeGerenciamentoDeEstoque --> Operações
    Operações --> Verificação(Verificação de disponibilidade)
    Operações --> Atualização(Atualização de estoque)

    style SistemaDeGerenciamentoDeEstoque fill:#f9f,stroke:#333
    style Operações fill:#bbf,stroke:#333
