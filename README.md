
# Gerenciamento de Estoque com Controle de Concorrência Otimista

## Visão Geral do Problema

Em ambientes de alta concorrência, como sistemas de gerenciamento de estoque, é comum enfrentar desafios relacionados a condições de corrida. Essas condições podem resultar em estados de dados inconsistentes, especialmente quando múltiplas transações tentam modificar o mesmo recurso — por exemplo, a quantidade de um item de estoque — simultaneamente.

## Abordagem da Solução

Este projeto aborda o problema utilizando o **Controle de Concorrência Otimista (CCO)**, que permite a execução de múltiplas transações de forma concorrente, com verificação no momento do commit para evitar inconsistências.

## Detalhes da Implementação

A solução é estruturada em torno de componentes principais que seguem padrões de design específicos para facilitar a manutenção e escalabilidade:

### Componentes Principais

- **Leitura e Atualização do Item de Estoque**: Utilizamos métodos `findStockItemById` e `updateStockItem` para gerenciar a leitura e atualização do estoque, respectivamente. Esses métodos fazem parte do `StockItemRepository`, que abstrai as operações de banco de dados.

- **Operação de Compra (`purchase`)**: Realiza a compra de itens verificando a disponibilidade e aplicando a atualização do estoque de forma atômica, usando o controle de concorrência otimista.

- **Execução Concorrente (`main`)**: A função `main` simula operações de compra concorrentes para demonstrar a eficácia do CCO na prevenção de condições de corrida.

### Padrões de Design Utilizados

- **Singleton**: Usado para garantir uma única instância de conexão com o banco de dados, otimizando recursos e facilitando a gestão das conexões.

- **Strategy**: Permite a troca flexível entre diferentes estratégias de acesso a dados, como Prisma e Pool, facilitando testes e manutenção.

- **Factory**: Centraliza a criação de objetos, neste caso, estratégias de banco de dados, permitindo uma inicialização simplificada e configurável.

- **Decorator**: Adiciona funcionalidades de logging às operações do repositório de forma dinâmica, melhorando a transparência das operações sem modificar a lógica existente.

- **Repository**: Abstrai a lógica de acesso aos dados, separando-a da lógica de negócios da aplicação e facilitando a modificação e expansão das operações de banco de dados.

### Exemplo de Código

```javascript
// Execução de compra concorrente em main
async function main() {
    const id = "unique-item-id";
    // Simula 100 operações de compra concorrentes
    await Promise.all(Array.from({ length: 100 }, () => purchase(id)));
}
```

## Conclusão

Através da implementação de padrões de design específicos e da utilização do Controle de Concorrência Otimista, este projeto demonstra uma abordagem robusta para gerenciar transações concorrentes em um sistema de gerenciamento de estoque. Essa abordagem não só previne eficazmente condições de corrida mas também promove uma arquitetura de software limpa, modular e facilmente extensível.

Para detalhes adicionais sobre a implementação dos padrões de design e exemplos específicos do projeto, consulte o documento **[Guia de Padrões de Design: Implementações e Práticas no Projeto de Acesso a Dados](DesignPatternsGuide_DataAccessProject.md)**.