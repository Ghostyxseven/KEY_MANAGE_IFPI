
# ADR 0003 — Definição da Stack Tecnológica do MVP

- **Status:** Accepted
- **Data:** 2026-05-28

Context
-------
Definir o conjunto de linguagens, frameworks e paradigmas de banco de dados para o MVP é uma decisão de impacto no tempo de entrega, qualidade e facilidade de manutenção. O repositório atual já contém um backend em TypeScript, portanto é natural alinhar decisões com essa base.

Decision
--------
Para o MVP adotamos a seguinte stack macro:

- Backend: Node.js com TypeScript, utilizando um framework leve como Fastify.
- Frontend: React com Vite.
- Banco de Dados: PostgreSQL (relacional).
-- Plataforma BaaS recomendada: plataforma BaaS gerenciada (fornece Postgres gerenciado, autenticação e storage integrados), adotada para acelerar o MVP.

Consequences
------------
-- Operações que exigem consistência e modelo relacional serão implementadas com constraints e transações no PostgreSQL (via a plataforma BaaS/Postgres).
- Integração com ORMs modernos (ex: Prisma) e ferramentas de validação em TypeScript (Zod) favorecerão produtividade.
- Para necessidades específicas (ex.: pesquisa full-text, workloads massivos), projetos complementares poderão ser avaliados em ADRs futuras.

Implementation notes
--------------------
-- Environment variables: set provider-specific variables such as `PROVIDER_URL`, `PROVIDER_ANON_KEY` (client), `PROVIDER_SERVICE_ROLE_KEY` (server-only) and `DATABASE_URL` (Postgres connection string fornecida pela plataforma BaaS) in CI/CD and runtime secrets.
-- Recommended packages (backend): SDK do provedor BaaS, `@prisma/client`, `prisma`, `zod`.
-- Prisma can be used against the provider Postgres by setting `DATABASE_URL` to the provider's connection string (prefer using a dedicated DB user/role where possible).
-- Use the platform BaaS dashboard to manage migrations during early MVP stages or drive migrations from Prisma (`prisma migrate deploy`) in CI.

