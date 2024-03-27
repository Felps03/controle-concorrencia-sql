<!-- mermaid -->

sequenceDiagram
    participant index as index.js
    participant factory as DatabaseStrategyFactory
    participant databaseStrategy as IDatabaseStrategy (Pool/Prisma)
    participant repository as StockItemRepository
    participant decorator as LoggingRepositoryDecorator
    participant service as stockItemService.js
    participant dbClient as Database Client (Pool/Prisma)

    index->>+factory: create(strategyType)
    factory->>+databaseStrategy: Instantiate Strategy
    index->>+repository: new StockItemRepository(databaseStrategy)
    index->>+decorator: new LoggingRepositoryDecorator(repository)
    index->>service: updateStockItemConcurrently(id, decoratedRepository)
    service->>+decorator: findStockItemById(id)
    decorator->>+repository: findStockItemById(id)
    repository->>+databaseStrategy: readStockItem(id)
    databaseStrategy->>+dbClient: Execute Query
    dbClient-->>-databaseStrategy: stockItem
    databaseStrategy-->>-repository: stockItem
    repository-->>-decorator: stockItem
    decorator-->>-service: Log and Return stockItem

    service->>+decorator: updateStockItem(id, version)
    decorator->>+repository: updateStockItem(id, version)
    repository->>+databaseStrategy: updateStockItem(id, version)
    databaseStrategy->>+dbClient: Execute Update Query
    dbClient-->>-databaseStrategy: Update Result
    databaseStrategy-->>-repository: Boolean Result
    repository-->>-decorator: Boolean Result
    decorator-->>-service: Log and Return Update Success
    Note over index,service: Concurrency managed at service level with Promise.all
