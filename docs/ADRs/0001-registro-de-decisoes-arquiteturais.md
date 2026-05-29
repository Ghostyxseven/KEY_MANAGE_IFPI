# ADR 0001 — Registro de Decisões Arquiteturais

- **Status:** Accepted
- **Data:** 2026-05-28

Context
-------
O repositório do projeto necessita de um mecanismo simples, padronizado e visível para registrar decisões arquiteturais importantes ao longo do desenvolvimento do MVP. Essas decisões devem ser consultáveis por toda a equipe e conter justificativas técnicas para futuras revisões.

Decision
--------
Adotamos o padrão de ADRs (Architecture Decision Records) como ferramenta oficial de governança técnica e registro histórico do repositório. Cada decisão importante será documentada em um arquivo numerado dentro de `docs/ADRs/` seguindo o template de Michael Nygard: `Status`, `Context`, `Decision` e `Consequences`.

Consequences
------------
- Todas as decisões arquiteturais relevantes serão documentadas no repositório.
- O status inicial desta ADR é `Accepted` para tornar explícita a adoção do processo.
- Revisões e mudanças futuras deverão ser registradas via novas ADRs, preservando o histórico.

