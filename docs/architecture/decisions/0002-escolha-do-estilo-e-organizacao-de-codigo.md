# ADR 0002 — Escolha do Estilo e Organização de Código

**Status:** Accepted  
**Data:** 2026-05-28  
**Time:** CoreTech  
**Projeto:** Sistema de Gerenciamento de Acesso a Chaves — IFPI Campus Piripiri

---

## Contexto

O time precisa definir como o código do MVP será organizado internamente para favorecer velocidade de entrega, facilidade de manutenção e clareza nas responsabilidades entre módulos. Esta decisão afeta diretamente a produtividade dos 5 desenvolvedores ativos do time (Deric, Roger, Nilson, Eric, Ana Rosa) e a facilidade de revisão pelo professor avaliador.

Há duas abordagens frequentemente consideradas:

- **Arquitetura em Camadas (Layered / Horizontal):** o código é dividido por responsabilidade técnica — pastas como `controllers/`, `services/`, `repositories/`, `models/`. Todos os módulos de uma mesma "camada" convivem na mesma pasta, independentemente do domínio de negócio.
- **Arquitetura por Fatias de Contexto (Vertical Slice / Feature-Based):** o código é dividido por domínio ou funcionalidade — pastas como `features/auth/`, `features/chaves/`, `features/sincronizacao/`. Cada pasta contém todos os artefatos daquela feature (handler, service, modelo, testes).

Dado que o MVP possui três épicos bem delimitados (Controle de Acesso, Gestão de Retirada/Devolução e Operação Offline/Sincronização), há uma correspondência natural entre esses domínios e a organização Feature-Based.

## Decisão

Adotamos a **Arquitetura por Fatias de Contexto (Vertical Slice Architecture / Feature-Based)** para o desenvolvimento do MVP.

A estrutura de pastas seguirá o padrão abaixo:

```
src/
  features/
    auth/             # Épico 1 — Controle de Acesso e Identificação
      auth.handler.ts
      auth.service.ts
      auth.schema.ts
      auth.test.ts
    chaves/           # Épico 2 — Gestão de Retirada e Devolução
      chaves.handler.ts
      chaves.service.ts
      chaves.schema.ts
      chaves.test.ts
    sincronizacao/    # Épico 3 — Operação Offline e Sincronização
      sync.handler.ts
      sync.service.ts
      sync.schema.ts
      sync.test.ts
  shared/             # Utilitários, tipos globais, helpers reutilizáveis
  core/               # Configurações de banco, inicialização do servidor
```

## Consequências

- O repositório será organizado por domínio/feature, com cada pasta contendo handlers, controllers, serviços e testes relacionados — facilitando a navegação por qualquer membro do time.
- Código compartilhado (utilitários, libs internas, tipos globais) ficará em `shared/` ou `core/` para evitar duplicação entre features.
- A abordagem exige disciplina para evitar acoplamento entre slices. Linters, convenções de nomenclatura e revisões de PR serão importantes para garantir consistência.
- A rastreabilidade entre épicos (RVS/DR) e pastas de código é direta: cada épico corresponde a uma feature, facilitando a auditoria de escopo do MVP.
- Caso o projeto evolua para pós-MVP com perfis de acesso diferenciados, novas features (`admin/`, `relatorios/`) podem ser adicionadas sem reestruturar o código existente.
