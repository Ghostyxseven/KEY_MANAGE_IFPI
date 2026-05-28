
# ADR 0005 — Hospedagem e Infraestrutura

- **Status:** Accepted
- **Data:** 2026-05-28

Context
-------
Decidir o modelo de hospedagem impacta custo, velocidade de deploy, e a complexidade operacional. Opções incluem Serverless/BaaS e containers gerenciados.

Decision
--------
Para acelerar o MVP e reduzir esforço operacional adotamos **Supabase** como plataforma BaaS principal (fornece Postgres gerenciado, Auth e Storage). Complementos serverless ou funções podem ser usados conforme necessário.

Consequences
------------
- O projeto dependerá do Supabase para hosting do banco Postgres, autenticação e storage de arquivos durante o MVP.
- Menor necessidade imediata de criar `Dockerfile` e pipelines complexos; ainda recomenda-se CI para deploys e migrations do schema.
- Para requisitos avançados (workloads específicos, serviços externos) podemos integrar serviços adicionais ou migrar componentes para containers gerenciados, documentando via ADRs futuras.

Implementation notes
--------------------
- Secrets management: store `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL` and `DATABASE_URL` in CI/CD secret stores (GitHub Actions secrets, Render secrets, etc.). Never expose service role keys in frontend code.
- Edge/Functions: Supabase provides Edge Functions — evaluate them for lightweight server-side logic; otherwise continue using existing backend and connect to Supabase Postgres.
- Backups & migrations: rely on Supabase's managed backups initially; use Prisma migrations or Supabase SQL scripts in CI to apply schema changes deterministically.
