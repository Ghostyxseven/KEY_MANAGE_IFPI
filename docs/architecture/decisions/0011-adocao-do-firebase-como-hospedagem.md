# ADR 0011 — Adoção do Firebase como Plataforma de Hospedagem, em Substituição ao Railway

- **Status:** Aceito — Supersedes ADR-0005
- **Data:** 2026-07-14
- **Autor:** CoreTech

## Contexto
A ADR-0005 adotou o **Railway** como plataforma de hospedagem gerenciada para o backend Node.js/Express e o banco PostgreSQL, aceitando como trade-off um vendor lock-in temporário sujeito às cotas e suspensões do plano gratuito/estudantil.

Com a substituição do PostgreSQL pelo Firebase/Firestore (ADR-0010), parte da razão original para manter um servidor Node.js/Express dedicado — servir como camada de acesso ao banco relacional — deixa de existir para as operações de CRUD mais simples, já que o SDK do Firestore permite acesso direto do aplicativo ao banco, controlado por regras de segurança declarativas. Isso torna natural reavaliar também a estratégia de hospedagem, evitando manter dois provedores de nuvem distintos (Railway para a API e Firebase para o banco) quando o próprio Firebase já oferece Hosting e Cloud Functions para lógica de servidor quando necessária.

## Decisão
Adotamos a infraestrutura do próprio **Firebase** (Firestore com Regras de Segurança para acesso direto do app, complementado por Cloud Functions para lógica que exige processamento no servidor, como validações cruzadas e o log de auditoria de conflitos) em substituição ao Railway como plataforma de hospedagem do backend do MVP.

## Consequências
- **Positivas:** Elimina a necessidade de um segundo provedor de nuvem, consolidando banco de dados e hospedagem sob uma única plataforma e um único plano gratuito. Remove o risco de suspensão automática do plano gratuito do Railway, apontado como trade-off negativo na ADR-0005. Reduz o volume de código de API a manter, já que operações de CRUD simples (RF02–RF06) podem ser servidas diretamente pelo SDK do Firestore sem passar por uma camada Express intermediária.
- **Negativas / Trade-offs:** Introduz uma nova superfície de lock-in: o uso de Cloud Functions em cenários que exigem chamadas de rede ou determinados gatilhos requer o plano pago (Blaze) do Firebase, o que pode romper a premissa de custo próximo de zero caso o uso cresça além do esperado. Exige que a equipe aprenda a linguagem declarativa das **Regras de Segurança do Firestore** para reforçar regras de negócio (ex.: RN01 — impedir retirada dupla de uma chave já em uso) que antes seriam codificadas de forma imperativa nos controllers Express, deslocando parte da lógica de negócio para um modelo menos familiar ao time. Reduz a flexibilidade de uma API REST totalmente customizada para integrações futuras não suportadas nativamente pelo Firebase.