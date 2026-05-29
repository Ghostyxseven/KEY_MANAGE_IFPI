
# ADR 0008 — Arquitetura Macro: Monolito Modular + Clean Architecture + Vertical Slices + MVVM

- **Status:** Accepted
- **Data:** 2026-05-28
- **Time:** CoreTech
- **Projeto:** Sistema de Gerenciamento de Acesso a Chaves — IFPI Campus Piripiri

---

## Contexto

O projeto precisa de uma abordagem arquitetural que equilibre rapidez de entrega (prazo acadêmico curto), baixo custo operacional (infraestrutura limitada) e qualidade técnica suficiente para permitir evolução pós-MVP. O time é pequeno e tem experiência variada; além disso, o requisito de operação offline-first impõe restrições importantes ao desenho da solução.

Decisões já tomadas (ver ADRs relacionadas): stack tecnológica (ADR 0003), organização por features (ADR 0002), estratégia de sincronização offline (ADR 0006) e identificação de chaves sem hardware (ADR 0007). Falta explicitar a decisão macro que unifica essas escolhas e orienta a implementação prática.

## Decisão

Adotamos como arquitetura macro para o MVP a combinação:

- **Monolito Modular** (implantação única, limites internos explícitos);
- **Clean Architecture / Ports & Adapters** (núcleo de regras de negócio isolado de detalhes de infraestrutura);
- **Vertical Slice / Feature-Based** para organização de código (pastas por feature/épico);
- **MVVM** como orientação para camadas de apresentação nas interfaces móveis (React Native / Expo).

Essa combinação visa preservar simplicidade operacional (um único deploy e banco), promover desacoplamento e testabilidade do core de negócio, e acelerar entrega de features completas por pequenos times.

## Consequências

- Benefícios:
  - Reduz complexidade operacional (um único processo/DB), adequado ao contexto do campus.
  - Facilita extração futura de módulos (quando houver maturidade/necessidade) porque as fronteiras internas serão explícitas.
  - Clean Architecture protege regras de negócio de mudanças em infraestrutura (DB, auth, storage), facilitando testes de unidade e integração.
  - Vertical Slices acelera entregas por permitir que uma feature seja desenvolvida de ponta a ponta com menos coordenação entre desenvolvedores.
  - MVVM favorece testabilidade e reatividade no cliente mobile.

- Custos / limitações:
  - Requer disciplina para manter boundaries claros entre módulos; sem disciplina o monolito pode degenerar em código com acoplamento.
  - Extração para microsserviços no futuro exige trabalho, mas será mais simples com fronteiras bem definidas.

## Orientações práticas de implementação (não quebrar o código)

1. **Comece incrementalmente** — não faça reescrita total. Identifique uma feature pouco acoplada (ex.: gestão de chaves) para prova de conceito de modularização.

2. **Introduza Ports & Adapters:** crie interfaces (ports) para interações com infraestrutura (persistência, filas, auth, storage). As implementações concretas (adapters) ficam em `adapters/` ou dentro de cada feature quando apropriado.

3. **Estrutura inicial recomendada:**

```
src/
  core/                # Núcleo: entidades, casos de uso, interfaces (ports)
  features/
    auth/
    chaves/
    sincronizacao/
  adapters/            # Implementações de infra (db, storage, email, etc.)
  presentation/        # Camada de UI (React Native) com ViewModels (MVVM)
  shared/              # Utilitários e tipos compartilhados
```

4. **Strangler Pattern:** quando extrair uma funcionalidade, mantenha o contrato existente (API/DB) e redirecione chamadas gradualmente para a nova implementação. Use feature flags se necessário.

5. **Banco de dados e migrações:** planeje mudanças de schema compatíveis com deploys incrementais (colunas novas com valores default, backfills, leitura dupla quando necessário). Versione migrations e execute no CI antes do deploy.

6. **Testes:** aumente cobertura em pontos críticos (sincronização, operações de retirada/devolução). Priorize testes de integração que simulam ciclos offline→sync.

7. **Documentação e ADRs:** registre decisões de fronteira e contratos em ADRs adicionais sempre que mudar boundaries significativas.

8. **Critérios de boundary entre módulos:** cada módulo deve possuir:
   - responsabilidade única bem definida (ex.: gestão de chaves não faz lógica de autenticação);
   - interface pública mínima documentada (input/output);
   - dependências externas acessadas via ports/adapters.

## Plano imediato de ação (sprint 0 / spike)

- Criar ADR 0008 (este documento) e referenciá-la nas ADRs 0002, 0003 e 0006.
- Implementar scaffold em branch `feature/arquitetura`: pastas `src/core`, `src/features/*`, `src/adapters`, `src/presentation` e exemplos de interfaces (ports) e um `ViewModel` simples.
- Implementar POC de sincronização movendo a `sincronizacao` para a nova estrutura e guardar testes end-to-end.

## Consequências de longo prazo

- Facilita futuras extrações e testes; reduz custo de manutenção ao longo do tempo.
- A qualidade do código no final do MVP dependerá da disciplina do time em respeitar boundaries e padrões acordados.

---

Referências: ADR 0001, ADR 0002, ADR 0003, ADR 0006, ADR 0007.
