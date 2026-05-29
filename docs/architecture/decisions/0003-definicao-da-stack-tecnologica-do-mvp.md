

# ADR 0003 — Definição da Stack Tecnológica do MVP

- **Status:** Aceito
- **Data:** 2026-05-28
- **Autor:** CoreTech
- **ID:** ADR 0003

Contexto
-------
O time precisa escolher uma stack que maximize velocidade de entrega, mantenha qualidade suficiente para avaliação do MVP e minimize risco técnico dada a capacidade da equipe (prazos do semestre, conhecimento prévio em JavaScript/TypeScript).


Alternativas consideradas:

- Manter JavaScript/TypeScript no backend (Node.js) + PostgreSQL relacional.
- Migrar para soluções NoSQL (MongoDB) para flexibilidade de schema.
- Usar uma solução BaaS (serviços gerenciados) para acelerar infra vs. provisionar infraestrutura própria (Heroku, Docker em cloud).

Decisão
--------
Adotamos a seguinte stack para o MVP, conforme Relatório de Viabilidade (RVS):

- Frontend (mobile): **React Native + Expo** — app mobile offline‑first para uso no celular dos guardas.
- Backend/API: **Node.js + TypeScript + Express** — API REST leve e compatível com o ambiente de TI do campus.
- Armazenamento local (dispositivo): **SQLite** (persistência offline no app).
- Armazenamento servidor: **PostgreSQL** (banco relacional centralizado no servidor do campus).
- Sincronização: estratégia offline com fila local (SQLite) e sincronização automática ao reconectar — regra de conflito: **"último timestamp vence"** (limitação documentada).

Justificativa resumida: o RVS define claramente `React Native + Expo` e `SQLite` para offline no cliente, e `Node.js + Express` com `PostgreSQL` no servidor; essa configuração maximiza compatibilidade com a infraestrutura do campus e atende às necessidades de operação offline do MVP.

Consequências
------------


Positivas:
- Atende aos requisitos identificados no RVS: operação offline, compatibilidade com dispositivos móveis e infraestrutura interna (PostgreSQL).
- Facilita integração com o servidor do campus já gerenciado internamente pelo técnico de TI.

Negativas / Trade-offs:
- Curva de aprendizado com React Native/Expo para alguns membros da equipe (mitigar com spike técnico nas Semanas 1–2).
- A estratégia de sincronização (`último timestamp vence`) pode causar perdas silenciosas em conflitos concorrentes entre dispositivos offline.

Mitigações
---------
- Executar spike técnico (POC) nas Semanas 1–2 focado em SQLite + sincronização para validar viabilidade.
- Documentar a limitação de conflito e fornecer plano de contingência (sincronização manual pelo administrador) caso o POC aponte risco excessivo.
- Encapsular acesso a banco e mecanismos de sincronização em adaptadores (`adapters/`) para permitir mudanças futuras sem afetar o core.

Criterios de aceitação
----------------------

- Frontend: projeto React Native + Expo inicializado com telas mínimas (login e quadro de chaves) e integração com SQLite local.
- Backend: projeto Node.js + TypeScript + Express com endpoints para sincronização e persistência em PostgreSQL; `DATABASE_URL` configurável via `.env.example`.
- POC de sincronização aprovado: envio de registros do SQLite para o servidor e aplicação da regra `último timestamp vence` demonstrada em ambiente de teste.
- Documentação curta no `docs/architecture/decisions/0003-*` descrevendo fluxo de sincronização, limitações e plano de contingência.


Notas operacionais
-----------------

- Pacotes/choices iniciais recomendados: `expo` (cliente), `react-native-sqlite-storage` ou `expo-sqlite` (local), `express`, `pg`/`node-postgres` (server).
- O uso de `Prisma` é **opcional** e não foi imposto pelo RVS; se a equipe optar por `Prisma` por ergonomia TypeScript, documentar essa escolha em uma ADR adicional para rastreabilidade. Caso contrário, `node-postgres` (`pg`) é plenamente aceitável e consistente com o RVS.
- Evitar soluções BaaS obrigatórias; Railway/Neon podem ser opções de contingência caso o servidor do campus não esteja disponível.

Justificativa vinculada ao semestre
----------------------------------

Esta stack prioriza produtividade com ferramentas familiares à equipe (TypeScript + Prisma) e reduz esforço de infraestrutura durante o semestre, alinhando-se às restrições de tempo e conhecimento do grupo.

