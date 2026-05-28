
# ADR 0006 — Bibliotecas de Validação e ORM

- **Status:** Accepted
- **Data:** 2026-05-28

Context
-------
Escolher ferramentas para mapeamento objeto-relacional e validação de entrada impacta fortemente a experiência do desenvolvedor no TypeScript e a qualidade das APIs.

Decision
--------
Adotaremos `Prisma` como ORM principal e `Zod` para validação de esquemas e payloads no backend.

Consequences
------------
- Será necessário adicionar `prisma` ao projeto, definir o arquivo `schema.prisma` e integrar migrations ao pipeline de deploy.
- Padronizar uso de `Zod` em handlers/controllers para validar entradas e transformar dados antes da persistência.

Implementation notes
--------------------
- Prisma + Supabase: set `DATABASE_URL` to the Supabase Postgres connection string. Initialize Prisma (`npx prisma init`) and create models reflecting domain entities. Use `prisma migrate deploy` in CI to apply migrations.
- Example `schema.prisma` generator snippet:

```prisma
generator client {
	provider = "prisma-client-js"
}

datasource db {
	provider = "postgresql"
	url      = env("DATABASE_URL")
}
```

- Zod: define request schemas with Zod and infer TypeScript types to keep validation and types synchronized.
