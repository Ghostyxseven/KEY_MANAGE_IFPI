# Modelo de dados

## `usuarios/{uid}`

`uid`, `nome`, `matricula`, `perfil` (`admin|guarda`), `ativo`, `criadoEm`, `atualizadoEm`.

## `acessos/{matriculaNormalizada}`

`uid`, `authEmail`, `ativo`, `criadoEm`, `atualizadoEm`. Consulta exclusiva do administrador; não contém PIN.

## `chaves/{id}`

Mantém `codigo`, `status`, `responsavelAtual`, `ultimaMovimentacaoEm` e `ultimaMovimentacaoId`.

## `movimentacoes/{id}`

Registro imutável com tipo, chave, responsável canônico, horário, dispositivo, `autorUid` e estado de sincronização.
