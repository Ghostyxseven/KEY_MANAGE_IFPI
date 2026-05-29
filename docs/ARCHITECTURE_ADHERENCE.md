# Análise de Aderência Arquitetural — CoreTech

Este documento resume a análise automatizada/manual realizada no backend e lista as mudanças aplicadas para aproximar a implementação da combinação arquitetural acordada: Monolito Modular (macro), Clean Architecture + Vertical Slices (médio) e MVVM (micro).

Resumo
- O projeto já possui separação clara de `core` (entidades, ports, usecases) e `features`.
- Havia pontos em que controllers acessavam `pool` diretamente, quebrando a regra de dependência (infra → core).

Alterações aplicadas
- Adicionado: `backend/src/adapters/db/postgresAdapter.ts` — implementações de `ChaveRepository` e `RegistroRepository` e helpers para sincronização.
- Refatorado: `backend/src/controllers/keysController.ts` — agora usa `adapter.listKeysWithHolder()` em vez de `pool.query`.
- Refatorado: `backend/src/controllers/syncController.ts` — agora usa funções do adapter (`eventExists`, `getLastAppliedEventForKey`, `insertEvent`, `applyKeyStatusUpdate`, `getEventsByDevice`).

Observações pendentes
- Criar testes automatizados que assegurem que `core` não depende de infra.
- Substituir outras ocorrências diretas de `pool` (se houver) por adaptadores.
- Avaliar migração de rotas para usar `features/*` handlers de forma consistente (atualmente coexistem controllers e handlers).

Recomendações
- Mantenha os `ports` como única interface pública do `core` para persistência.
- Implemente adapters para cada tecnologia (Postgres, Memory, SQLite) e injete-os em pontos de boot (ex: `server.ts`).
- Documente convenções de dependência em `backend/src/shared/README.md`.

Data da análise: 2026-05-28
Autor: Análise automatizada via agente local (ação de refactor aplicada)
