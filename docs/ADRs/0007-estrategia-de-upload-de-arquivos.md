
# ADR 0007 — Estratégia de Upload de Arquivos

- **Status:** Accepted
- **Data:** 2026-05-28

Context
-------
O projeto pode requerer armazenamento de arquivos e mídia. Decisões sobre onde armazenar impactam custo, desempenho e complexidade de backup e distribuição.

Decision
--------
Adotaremos o storage da plataforma BaaS (buckets) para armazenar meios e arquivos durante o MVP, usando URLs assinadas (presigned/signed URLs) ou uploads diretos quando suportado pelo cliente.

Consequences
------------
- Integrar SDK do provedor BaaS para geração de URLs assinadas e operações de upload/download.
- Garantir políticas de retenção, permissões e, quando necessário, criptografia para arquivos sensíveis.
- Possibilidade de usar CDN na frente do Storage para distribuição de ativos em produção.

Implementation notes
--------------------
-- Use the provider's Storage SDK to create buckets and manage object ACLs. For public assets a public bucket is acceptable; for private assets generate signed URLs server-side using the service role key.
-- Example flow (recommended):
	1. Frontend requests an upload intent to backend.
	2. Backend (server) authenticates the user and either issues a signed URL or returns upload parameters.
	3. Frontend uploads directly to Supabase Storage using the signed info.
-- Environment variable: provider-specific service role key (e.g. `PROVIDER_SERVICE_ROLE_KEY`) required for server operations that generate signed URLs or manage private buckets.
