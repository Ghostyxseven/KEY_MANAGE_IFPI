# ADR 0005 — Hospedagem e Infraestrutura

**Status:** Accepted  
**Data:** 2026-05-28  
**Time:** CoreTech  
**Projeto:** Sistema de Gerenciamento de Acesso a Chaves — IFPI Campus Piripiri

---

## Contexto

O MVP precisa de infraestrutura para hospedar o backend Node.js + Express e o banco de dados PostgreSQL (servidor central de sincronização). A decisão sobre onde hospedar impacta custo, complexidade operacional e velocidade de deploy — fatores críticos em um projeto acadêmico com prazo de 11 semanas e orçamento próximo de zero.

As opções consideradas foram:

- **Servidor interno do campus (VPS próprio):** o técnico de TI indicou que o campus já opera um ambiente Node.js + PostgreSQL. Usar essa infraestrutura eliminaria custos de hospedagem e garantiria compatibilidade. **Porém, trata-se de uma incerteza institucional** — o técnico não confirmou formalmente a disponibilidade do servidor para o projeto.
- **Plataforma BaaS totalmente gerenciada (Firebase, Supabase):** reduz esforço operacional, mas introduz dependência de serviços externos com requisito de conexão constante. Firebase foi descartado na ADR 0003 por incompatibilidade com o requisito offline-first.
- **Hospedagem PaaS com contêiner (Railway, Render, Fly.io):** plataformas que aceitam deploy de aplicações Node.js via Git, com planos gratuitos adequados a projetos acadêmicos. Não exigem Docker ou pipelines complexos para deploy inicial.

## Decisão

Adotamos o **servidor interno do campus como infraestrutura primária**, com **Railway (plano gratuito) como fallback confirmado**.

| Cenário | Infraestrutura | Custo estimado (6 meses) |
|---------|---------------|--------------------------|
| **Primário** | Servidor VPS interno do campus (Node.js + PostgreSQL já operacional) | R$ 0,00 |
| **Fallback** | Railway (plano gratuito para projetos acadêmicos) + domínio opcional | ~R$ 48,00–R$ 78,00 |

Em ambos os cenários, o TCO total permanece abaixo de R$ 80,00 nos primeiros 6 meses.

**Responsável por confirmar a disponibilidade do servidor do campus:** Wesley Tiago (Scrum Master). Prazo: até o final da Semana 2 do cronograma.

Não será adotada plataforma BaaS totalmente gerenciada (Supabase, Firebase) para o MVP, pois o projeto já possui backend e banco definidos na ADR 0003 e a dependência de serviços externos contraria o princípio offline-first do sistema.

## Consequências

- O projeto depende da **confirmação formal do TI** quanto à disponibilidade do servidor do campus. Enquanto não confirmada, Railway deve ser tratado como infraestrutura de desenvolvimento e staging.
- A adoção do Railway como fallback garante que o desenvolvimento não seja bloqueado por incertezas institucionais.
- Não há necessidade imediata de criar `Dockerfile` ou pipelines complexos de CI/CD para o MVP. Recomenda-se, no mínimo, um pipeline simples de deploy automático via GitHub Actions para o ambiente Railway.
- Migrações de schema do PostgreSQL devem ser versionadas (ex.: scripts SQL ou via ferramenta de migrations do ORM adotado) para garantir deploys determinísticos em ambos os ambientes.
- Para o pós-MVP, caso haja necessidade de workloads específicos (ex.: notificações push, relatórios históricos), a migração para containers gerenciados (Docker no Render, Fly.io) deverá ser documentada em uma nova ADR.
