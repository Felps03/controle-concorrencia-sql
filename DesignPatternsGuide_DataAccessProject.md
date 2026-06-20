# Padrões de Design Utilizados no Projeto

Neste projeto, implementamos vários padrões de design para atingir uma estrutura de código flexível, modular e fácil de manter. Abaixo, descrevemos os padrões usados, por que foram escolhidos e fornecemos exemplos de código diretamente do projeto.

## Singleton

### Por Que Foi Utilizado
O padrão Singleton foi utilizado para garantir que apenas uma instância de conexão com o banco de dados seja criada e compartilhada em toda a aplicação. Isso é importante para evitar o consumo desnecessário de recursos ao criar múltiplas instâncias de conexão.

### Exemplo de Código
```javascript
// database/pool/poolClient.js

const { Pool } = require("pg");

class PoolSingleton {
  constructor() {
    if (!PoolSingleton.instance) {
      PoolSingleton.instance = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
    }
    return PoolSingleton.instance;
  }
}

module.exports = new PoolSingleton();
```

## Strategy

### Por Que Foi Utilizado
O padrão Strategy foi aplicado para permitir a troca dinâmica das estratégias de acesso ao banco de dados. Isso oferece flexibilidade para alternar entre diferentes implementações de banco de dados (como Prisma e Pool) sem alterar o código cliente.

### Exemplo de Código
```javascript
// Factory.js

class DatabaseStrategyFactory {
  static strategies = {
    pool: PoolStrategy,
    prisma: PrismaStrategy,
  };

  static create(strategyType) {
    const Strategy = this.strategies[strategyType];
    if (!Strategy) {
      throw new Error('Invalid database strategy type');
    }
    return new Strategy();
  }
}
```

## Factory

### Por Que Foi Utilizado
Utilizamos o padrão Factory para encapsular a lógica de criação das estratégias de banco de dados, simplificando a criação de objetos e escondendo a complexidade da instânciação direta.

### Exemplo de Código
```javascript
// index.js

const databaseStrategy = DatabaseStrategyFactory.create(strategyType);
```

## Decorator

### Por Que Foi Utilizado
O padrão Decorator foi empregado para adicionar funcionalidades extras, como logging, a objetos já existentes sem modificar seu código fonte. Isso permite uma extensão flexível das funcionalidades de objetos em tempo de execução.

### Exemplo de Código
```javascript
// decorators/LoggingRepositoryDecorator.js

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
```

## Repository

### Por Que Foi Utilizado
O padrão Repository foi usado para abstrair a camada de acesso ao banco de dados, isolando a lógica de negócios da aplicação da lógica de acesso aos dados. Isso contribui para uma maior manutenção e organização do código.

### Exemplo de Código
```javascript
// repositories/StockItemRepository.js

class StockItemRepository {
  constructor(databaseStrategy) {
    this.databaseStrategy = databaseStrategy;
  }

  async findStockItemById(id) {
    return this.databaseStrategy.readStockItem(id);
  }
}
```

## Conclusão

Esses padrões de design, quando aplicados corretamente, ajudam a criar uma base de código sólida, escalável e fácil de manter. Cada padrão resolve um conjunto específico de problemas de design de software, permitindo que a aplicação cresça e evolua de maneira controlada.