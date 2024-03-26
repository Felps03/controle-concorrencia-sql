# Gerenciamento de Estoque com Controle de Concorrência Otimista

## Visão Geral do Problema

Ao lidar com um alto volume de transações concorrentes em um recurso compartilhado, como a atualização da quantidade de estoque de um item em um banco de dados, condições de corrida podem ocorrer. Essas condições de corrida podem levar a estados de dados inconsistentes e incorretos. Por exemplo, se múltiplas solicitações de compra tentarem decrementar a quantidade de estoque de um único item ao mesmo tempo, sem a sincronização adequada, elas podem todas ler a mesma quantidade inicial de estoque e decrementá-la independentemente, resultando em um valor final de estoque incorreto.

## Abordagem da Solução

Para mitigar o problema de condições de corrida em transações concorrentes, esta implementação utiliza o **Controle de Concorrência Otimista (CCO)**. CCO é um método de controle de concorrência que assume que múltiplas transações podem frequentemente ser completadas sem interferir umas nas outras. Ao invés de bloquear o recurso no início de uma transação, ela prossegue com a operação e verifica no momento do commit se outra transação modificou o recurso. Se o recurso foi modificado por outra transação, a transação atual é revertida e ações apropriadas podem ser tomadas, como tentar a operação novamente ou abortar a transação.

## Detalhes da Implementação

A solução envolve três funções-chave: `read`, `updateStockItem` e `purchase`, orquestradas por uma função `main` que simula múltiplas operações de compra concorrentes.

### Leitura do Item de Estoque

A função `read` busca de forma assíncrona um item de estoque único no banco de dados baseado em seu ID. Ela seleciona campos específicos: `id`, `amount` e `version`.

### Atualização do Item de Estoque

A função `updateStockItem` tenta atualizar a quantidade e a versão de um item de estoque. Ela usa o `id` e a `version` do item para garantir que a operação de atualização afete a versão pretendida do item. A `amount` é decrementada em 1, e a `version` é incrementada em 1 para sinalizar uma mudança. Se a versão específica do item não for encontrada (indicando que outra transação já o atualizou), a operação captura um erro e registra uma mensagem indicando que uma condição de corrida foi evitada.

### Operação de Compra

A função `purchase` realiza uma operação de compra de um item de estoque. Primeiro, ela lê o item de estoque para verificar sua disponibilidade (`amount` > 0). Se o item estiver disponível, ela chama `updateStockItem` para decrementar a quantidade de estoque e lidar com o controle de concorrência.

### Execução Principal

A função `main` simula 100 operações de compra concorrentes usando `Promise.all`. Ela garante que todas as tentativas de compra sejam processadas de forma concorrente, demonstrando a eficácia do CCO no tratamento de condições de corrida. Após todas as operações serem tentadas, ela busca e registra o estado final do item de estoque para mostrar o resultado das operações concorrentes.

## Conclusão

Esta implementação demonstra como o Controle de Concorrência Otimista pode prevenir efetivamente condições de corrida em transações de banco de dados concorrentes, garantindo a integridade e consistência dos dados sem a necessidade de mecanismos de bloqueio explícitos. Ao incrementar um número de versão a cada atualização, a solução garante que apenas uma transação possa atualizar o estoque por vez, com outras sendo tratadas de forma graciosa para evitar níveis incorretos de estoque.