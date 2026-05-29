
# ADR 0004 — Estratégia de Autenticação

- **Status:** Accepted
- **Data:** 2026-05-28

Context
-------
Autenticação e autorização são áreas críticas de segurança. Implementar um sistema customizado exige tempo, expertise e responsabilidade contínua (rotinas de segurança, rotação de chaves, monitoramento). Para o MVP precisamos de uma solução segura que minimize esforço operacional.

Decision
--------
Adotamos o serviço de autenticação da plataforma BaaS como solução de autenticação para o MVP. O backend validará tokens JWT/Session gerados pelo provedor e aplicará autorização baseada em claims/roles conforme necessário. Usuários poderão ser sincronizados localmente quando vinculados a domínios de negócio.

Consequences
------------
- O backend precisa validar tokens/claims emitidos pelo Supabase e aplicar políticas de autorização.
- Dependeremos do Supabase para fluxos de autenticação (login, reset de senha, verificação de e-mail), reduzindo esforço operacional.
- Caso no futuro se opte por migrar para outro provedor, documentaremos o plano de migração em uma ADR de follow-up.

Implementation notes
--------------------
- Environment variables: store provider-specific variables such as `PROVIDER_URL`, `PROVIDER_ANON_KEY` (frontend) and `PROVIDER_SERVICE_ROLE_KEY` (server-only) as secrets.
- Token validation: for server-side verification use the provider SDK or verify JWTs using the provider's JWKS endpoint. For sensitive operations prefer server-side checks using the service role key.
- User data: keep a `profiles` table (or equivalent) in Postgres to store domain-related user attributes; rely on the provider's Auth for authentication and link to `profiles` via `user_id`.
- Row-Level Security (RLS): when using the provider Postgres consider RLS policies for fine-grained DB access; document policies and test thoroughly.
