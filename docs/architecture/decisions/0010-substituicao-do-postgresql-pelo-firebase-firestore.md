# ADR 0010 — Substituição do PostgreSQL pelo Firebase (Cloud Firestore) como Banco de Dados do MVP

- **Status:** Aceito — Supersedes ADR-0003
- **Data:** 2026-07-14
- **Autor:** CoreTech

## Contexto
A ADR-0003 definiu **PostgreSQL** como banco relacional centralizado do servidor, justificado pela compatibilidade com a infraestrutura Node.js + PostgreSQL já operada pelo técnico de TI do campus. Essa mesma ADR já registrava como trade-off negativo o custo de manter **dois bancos de paradigmas diferentes simultaneamente** (SQLite local e PostgreSQL remoto), exigindo mapeamento manual de esquemas duplicados.

Discussões posteriores ao RVS reforçaram três pontos já sinalizados nos documentos do projeto: (1) a disponibilidade do servidor Node.js + PostgreSQL do campus é uma **incerteza institucional, não uma garantia** (RVS, seções 3.1 e 3.4); (2) a sincronização offline construída sob medida entre SQLite e PostgreSQL foi classificada como o **risco técnico mais crítico do MVP** (RVS, seção 4), exigindo POC dedicado nas Semanas 1–2; e (3) o time ainda enfrenta curva de aprendizado com React Native, o que torna qualquer redução de escopo de backend tecnicamente valiosa dentro do prazo acadêmico de 11 semanas.

Diante disso, reavaliamos a escolha original considerando o **Firebase (Cloud Firestore)** como alternativa: um banco de documentos gerenciado (BaaS) com persistência offline nativa e sincronização automática incorporadas ao SDK mobile, eliminando a necessidade de um mecanismo de sincronização construído manualmente entre dois bancos de paradigmas distintos.

## Decisão
Adotamos o **Firebase (Cloud Firestore)** como banco de dados central do MVP, substituindo o PostgreSQL. O SDK oficial do Firebase para aplicações mobile oferece cache local com persistência offline e sincronização automática ao restabelecer a conectividade, o que permite eliminar a manutenção paralela de um schema relacional (PostgreSQL) e um schema local (SQLite) mapeados manualmente.

## Consequências
- **Positivas:** Remove o trade-off de manter dois paradigmas de banco simultâneos, apontado como consequência negativa na ADR-0003. Elimina a dependência da disponibilidade do servidor PostgreSQL do campus, tratada como incerteza institucional nos documentos de viabilidade. Reduz o esforço de desenvolvimento do mecanismo de sincronização offline, hoje classificado como risco CRÍTICO/ALTO na Matriz de Riscos do RVS. O plano gratuito do Firebase (Spark) mantém o TCO próximo de zero, alinhado à estimativa original de custo do projeto.
- **Negativas / Trade-offs:** Substitui o vínculo com a infraestrutura já operacional do campus por um **vendor lock-in** com o ecossistema proprietário do Google, sem caminho de migração tão direto quanto o de um banco SQL padrão. O Firestore é um banco de documentos (NoSQL), exigindo modelagem desnormalizada dos dados de chaves, histórico e log de sincronização, diferente da modelagem relacional prevista originalmente. Introduz uma nova curva de aprendizado (SDK e regras de segurança do Firestore) somada à curva já existente com React Native, ambas concorrendo pelo mesmo cronograma de 11 semanas. Importante: a persistência offline do Firestore resolve o **esforço de implementação** da sincronização, mas não elimina por si só o **risco de perda silenciosa de dados** em conflitos de escrita concorrente — o comportamento padrão do Firestore em conflitos offline também é essencialmente "último escrito vence" a nível de documento, e essa limitação deve continuar documentada (ver ADR-0012).