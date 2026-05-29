
# ADR 0005 — Hospedagem e Infraestrutura

- **Status:** Accepted
- **Data:** 2026-05-28

Context
-------
Decidir o modelo de hospedagem impacta custo, velocidade de deploy, e a complexidade operacional. Opções incluem Serverless/BaaS e containers gerenciados.

Decision
--------
Para acelerar o MVP e reduzir esforço operacional adotamos uma plataforma BaaS gerenciada (fornece Postgres gerenciado, autenticação e storage). Complementos serverless ou funções podem ser usados conforme necessário.

Consequences
------------
- O projeto dependerá da plataforma BaaS para hosting do banco Postgres, autenticação e storage de arquivos durante o MVP.
- Menor necessidade imediata de criar `Dockerfile` e pipelines complexos; ainda recomenda-se CI para deploys e migrations do schema.
- Para requisitos avançados (workloads específicos, serviços externos) podemos integrar serviços adicionais ou migrar componentes para containers gerenciados, documentando via ADRs futuras.

Implementation notes
--------------------
- Secrets management: store provider-specific secrets such as `PROVIDER_SERVICE_ROLE_KEY`, `PROVIDER_URL` and `DATABASE_URL` in CI/CD secret stores (GitHub Actions secrets, Render secrets, etc.). Never expose service role keys in frontend code.
- Edge/Functions: some BaaS platforms provide Edge/Function capabilities — evaluate them for lightweight server-side logic; otherwise continue using existing backend and connect to the provider Postgres.
- Backups & migrations: rely on the platform's managed backups initially; use Prisma migrations or provider SQL scripts in CI to apply schema changes deterministically.
