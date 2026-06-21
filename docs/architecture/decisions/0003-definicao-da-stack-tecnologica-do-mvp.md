# ADR 0003 — Definição da Stack Tecnológica do MVP

- **Status:** Aceito
- **Data:** 2026-05-28
- **Autor:** CoreTech

## Contexto
O MVP exige operação offline-first na guarita do campus devido à instabilidade crônica de internet, além de compatibilidade com a infraestrutura existente gerenciada pelo técnico de TI do IFPI. O time possui forte familiaridade com JavaScript/TypeScript. Considerou-se o uso de ecossistemas NoSQL (MongoDB) pela flexibilidade de schema e plataformas BaaS prontas para acelerar a infraestrutura, contrapondo o uso de estruturas relacionais tradicionais e robustas.

## Decisão
Adotamos a seguinte stack técnica, alinhada ao Relatório de Viabilidade (RVS): **React Native com Expo** para o aplicativo móvel, **Node.js com TypeScript e Express** para o servidor de API, **SQLite** para persistência local offline no dispositivo do guarda, e **PostgreSQL** como o banco de dados relacional centralizado do servidor do campus.

## Consequências
- **Positivas:** Permite o reaproveitamento de conhecimento técnico do time utilizando TypeScript em todo o ecossistema (frontend e backend). Garante a aderência estrita aos requisitos de funcionamento offline e assegura compatibilidade direta e nativa com o banco de dados oficial (PostgreSQL) da TI institucional do campus.
- **Negativas / Trade-offs:** Impõe o custo e a complexidade de gerenciar e manter **dois bancos de dados de paradigmas diferentes simultaneamente** (SQLite e PostgreSQL), o que exige o mapeamento manual e o controle rigoroso de esquemas duplicados. O banco relacional exige um esforço adicional e contínuo com controle rígido de migrations e modelagem engessada de tabelas, onde qualquer alteração estrutural impacta as duas pontas da aplicação.