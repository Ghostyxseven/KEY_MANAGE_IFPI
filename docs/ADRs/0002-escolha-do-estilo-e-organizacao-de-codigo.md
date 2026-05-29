
# ADR 0002 — Escolha do Estilo e Organização de Código

- **Status:** Accepted
- **Data:** 2026-05-28

Context
-------
O time precisa definir a organização do código para o MVP de forma que favoreça velocidade de entrega, facilidade de manutenção e clareza nas responsabilidades entre módulos. Há duas abordagens frequentemente consideradas: a arquitetura em camadas (Layered / Horizontal) e a arquitetura por fatias de contexto (Vertical Slice / Feature-Based).

Decision
--------
Adotamos a arquitetura por fatias de contexto (Vertical Slice Architecture / Feature-Based) para o desenvolvimento do MVP.

Consequences
------------
- Estrutura do repositório organizada por domínio/feature (pastas por feature contendo handlers, controllers, serviços e testes relacionados).
- Código compartilhado (utilitários, libs internas) ficará em pastas `shared/` ou `core/` para evitar duplicação.
- Requer disciplina para evitar duplicação e garantir consistência entre slices (linters, convenções e revisões serão importantes).

