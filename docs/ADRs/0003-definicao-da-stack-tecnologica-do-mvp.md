
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
- Plataforma BaaS recomendada: Supabase (fornece Postgres gerenciado, autenticação e Storage integrados), adotada para acelerar o MVP.

Consequences
------------
- Operações que exigem consistência e modelo relacional serão implementadas com constraints e transações no PostgreSQL (via Supabase/Postgres).
- Integração com ORMs modernos (ex: Prisma) e ferramentas de validação em TypeScript (Zod) favorecerão produtividade.
- Para necessidades específicas (ex.: pesquisa full-text, workloads massivos), projetos complementares poderão ser avaliados em ADRs futuras.

Implementation notes
--------------------
- Environment variables: set `SUPABASE_URL`, `SUPABASE_ANON_KEY` (client), `SUPABASE_SERVICE_ROLE_KEY` (server-only) and `DATABASE_URL` (Postgres connection string provided by Supabase) in CI/CD and runtime secrets.
- Recommended packages (backend): `@supabase/supabase-js`, `@prisma/client`, `prisma`, `zod`.
- Prisma can be used against the Supabase Postgres by setting `DATABASE_URL` to the Supabase connection string (prefer using a dedicated DB user/role where possible).
- Use the Supabase dashboard to manage migrations during early MVP stages or drive migrations from Prisma (`prisma migrate deploy`) in CI.

