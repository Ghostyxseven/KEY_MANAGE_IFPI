# ADR 0005 — Estratégia de Hospedagem e Infraestrutura

- **Status:** Aceito
- **Data:** 2026-05-28
- **Autor:** CoreTech

## Contexto
O MVP necessita de um ambiente externo para deploy estável da API e do banco de dados, permitindo a sincronização dos dispositivos móveis e a avaliação da banca acadêmica. A TI do campus informou restrições severas de suporte e indisponibilidade temporária de seus servidores locais para a fase de testes. Avaliamos a implantação de uma VPS própria via Docker (com alto custo de configuração de redes e firewalls) versus plataformas PaaS (Platform as a Service) gerenciadas.

## Decisão
Adotamos o **Railway** como plataforma oficial de hospedagem em nuvem gerenciada para o deploy do ecossistema backend (Node.js e banco de dados PostgreSQL) durante a fase de desenvolvimento e validação do MVP.

## Consequências
- **Positivas:** Reduz a zero o custo operacional de configuração, provisionamento e monitoramento de servidores, permitindo que a equipe foque exclusivamente nas regras de negócio. Oferece integração contínua (CI/CD) automatizada a partir do repositório Git e disponibiliza endpoints HTTPS públicos de forma imediata.
- **Negativas / Trade-offs:** Cria uma dependência técnica e um **Vendor Lock-in temporário** com a plataforma Railway, submetendo a estabilidade da aplicação aos limites operacionais de cotas e suspensões automáticas do plano gratuito/estudantil. Reduz o controle direto do time sobre a infraestrutura de rede profunda e a segurança física dos dados, exigindo esforço futuro de migração para os servidores definitivos do campus.