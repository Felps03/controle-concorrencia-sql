stateDiagram-v2
    [*] --> Início
    Início --> VerificaçãoDeDisponibilidade: Iniciar Atualização
    VerificaçãoDeDisponibilidade --> Disponível: Estoque Suficiente
    VerificaçãoDeDisponibilidade --> Indisponível: Estoque Insuficiente
    Disponível --> Atualizando: Tentar Atualizar
    Atualizando --> AtualizadoComSucesso: Atualização bem-sucedida
    Atualizando --> FalhaNaAtualização: Condição de corrida ou erro
    Indisponível --> [*]
    AtualizadoComSucesso --> [*]
    FalhaNaAtualização --> [*]
